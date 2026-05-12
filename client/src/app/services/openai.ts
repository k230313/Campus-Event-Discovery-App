import { Event } from '../types';

function formatShortDate(dateValue: string) {
  return new Date(dateValue).toLocaleDateString('en-AU', {
    month: 'short',
    day: 'numeric',
  });
}

export async function generateAIResponse(
  userMessage: string,
  events: Event[],
  _conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> {
  const query = userMessage.toLowerCase();

  if (query.includes('career') || query.includes('network')) {
    const matches = events.filter((event) => event.category === 'Career');
    if (matches.length) {
      return `I found ${matches.length} career event(s). A good one to start with is "${matches[0].title}" on ${formatShortDate(matches[0].date)}.`;
    }
  }

  if (query.includes('workshop') || query.includes('learn')) {
    const matches = events.filter((event) => event.category === 'Workshop');
    if (matches.length) {
      return `There are ${matches.length} workshop event(s) available. "${matches[0].title}" on ${formatShortDate(matches[0].date)} looks like a strong option.`;
    }
  }

  if (query.includes('social') || query.includes('fun')) {
    const matches = events.filter((event) => event.category === 'Social');
    if (matches.length) {
      return `For social events, check out "${matches[0].title}" on ${formatShortDate(matches[0].date)}.`;
    }
  }

  if (query.includes('this week') || query.includes('upcoming') || query.includes('soon')) {
    const matches = [...events]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 3);

    if (matches.length) {
      return `Upcoming events include ${matches.map((event) => `"${event.title}" on ${formatShortDate(event.date)}`).join(', ')}.`;
    }
  }

  const genericMatches = events.filter((event) =>
    event.title.toLowerCase().includes(query) ||
    event.description.toLowerCase().includes(query) ||
    event.location.toLowerCase().includes(query) ||
    event.category.toLowerCase().includes(query)
  );

  if (genericMatches.length) {
    return `I found ${genericMatches.length} event(s) matching "${userMessage}". The first one is "${genericMatches[0].title}" on ${formatShortDate(genericMatches[0].date)}.`;
  }

  return `I couldn't find a strong match for "${userMessage}". Try asking about career, workshop, social, club, or upcoming events.`;
}
