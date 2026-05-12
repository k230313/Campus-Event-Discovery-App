import OpenAI from 'openai';
import { Event } from '../types';

// Initialize OpenAI client
// In production, this should be stored securely in environment variables
const getOpenAIClient = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    console.warn('OpenAI API key not found. Using fallback responses.');
    return null;
  }

  return new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true, // Note: In production, API calls should be made from backend
  });
};

/**
 * Generate a response using OpenAI GPT model
 * This provides intelligent, context-aware responses about campus events
 */
export async function generateAIResponse(
  userMessage: string,
  events: Event[],
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> {
  const client = getOpenAIClient();

  // Fallback to simple responses if no API key
  if (!client) {
    return generateFallbackResponse(userMessage, events);
  }

  try {
    // Prepare context about available events
    const eventsContext = events.map(event => ({
      title: event.title,
      category: event.category,
      date: event.date,
      time: `${event.startTime} - ${event.endTime}`,
      location: event.location,
      description: event.description.substring(0, 100) + '...',
      rsvpCount: event.rsvpCount,
      volunteersNeeded: event.volunteersNeeded,
      foodProvided: event.foodProvided,
      seatingCapacity: event.seatingCapacity,
    }));

    const systemPrompt = `You are CEDA Assistant, an intelligent chatbot for the Campus Event Discovery App at Kent Institute.
Your role is to help students discover and learn about campus events.

Available events:
${JSON.stringify(eventsContext, null, 2)}

Guidelines:
- Be helpful, friendly, and enthusiastic about campus events
- Provide specific event recommendations based on user interests
- Include relevant details like dates, times, locations, and special features (food, volunteering opportunities)
- Encourage students to participate and get involved
- Keep responses concise but informative (2-3 sentences max unless asked for more detail)
- If users ask about events, provide 2-3 relevant suggestions
- Use natural, conversational language
- Today's date is May 6, 2026`;

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-6), // Keep last 6 messages for context
      { role: 'user', content: userMessage },
    ];

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      max_tokens: 200,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || 'I apologize, I couldn\'t generate a response. Please try again.';
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return generateFallbackResponse(userMessage, events);
  }
}

/**
 * Fallback response generator when OpenAI is not available
 */
function generateFallbackResponse(query: string, events: Event[]): string {
  const lowerQuery = query.toLowerCase();

  // Category-based responses
  if (lowerQuery.includes('networking') || lowerQuery.includes('career')) {
    const careerEvents = events.filter(e => e.category === 'Career');
    if (careerEvents.length > 0) {
      return `I found ${careerEvents.length} career event(s)! Check out "${careerEvents[0].title}" on ${new Date(careerEvents[0].date).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })}. Browse all events to see more!`;
    }
  }

  if (lowerQuery.includes('workshop') || lowerQuery.includes('learn')) {
    const workshopEvents = events.filter(e => e.category === 'Workshop');
    if (workshopEvents.length > 0) {
      return `We have ${workshopEvents.length} workshop(s) available! "${workshopEvents[0].title}" on ${new Date(workshopEvents[0].date).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })} looks great. Check the Events page for details!`;
    }
  }

  if (lowerQuery.includes('social') || lowerQuery.includes('fun')) {
    const socialEvents = events.filter(e => e.category === 'Social');
    if (socialEvents.length > 0) {
      return `For social events, check out "${socialEvents[0].title}" on ${new Date(socialEvents[0].date).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })}! It's a great way to meet other students.`;
    }
  }

  if (lowerQuery.includes('volunteer')) {
    const volunteerEvents = events.filter(e => e.volunteersNeeded && (e.volunteersNeeded > (e.volunteersRegistered || 0)));
    if (volunteerEvents.length > 0) {
      return `${volunteerEvents.length} event(s) need volunteers! "${volunteerEvents[0].title}" needs ${(volunteerEvents[0].volunteersNeeded || 0) - (volunteerEvents[0].volunteersRegistered || 0)} more. Volunteering is a great way to get involved!`;
    }
  }

  if (lowerQuery.includes('food')) {
    const foodEvents = events.filter(e => e.foodProvided);
    if (foodEvents.length > 0) {
      return `${foodEvents.length} event(s) provide food! "${foodEvents[0].title}" offers ${foodEvents[0].foodOptions?.join(', ')}. Yum!`;
    }
  }

  if (lowerQuery.includes('this week') || lowerQuery.includes('upcoming')) {
    const today = new Date('2026-05-06');
    const oneWeekFromNow = new Date(today);
    oneWeekFromNow.setDate(today.getDate() + 7);

    const upcomingEvents = events.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate >= today && eventDate <= oneWeekFromNow;
    });

    if (upcomingEvents.length > 0) {
      return `Here are ${upcomingEvents.length} event(s) coming up this week: ${upcomingEvents.slice(0, 2).map(e => `"${e.title}" (${new Date(e.date).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })})`).join(', ')}. Click on "Events" to see the full calendar!`;
    }
  }

  // Default response
  return `I can help you find events by category (Academic, Career, Social, Workshop, Club), date, or topic. We have ${events.length} events available! You can also browse all events by clicking on "Events" in the navigation menu. What would you like to know?`;
}
