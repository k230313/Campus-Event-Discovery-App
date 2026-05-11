import { useState } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { mockEvents } from '../data/mockEvents';
import { Event } from '../types';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  suggestedEvents?: Event[];
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! I\'m your Kent Events Assistant. I can help you find events, answer questions about seating, food options, volunteering opportunities, and more. Try asking me something like "Show me career events" or "Events with food"!',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');

  const findRelevantEvents = (query: string): Event[] => {
    const lowerQuery = query.toLowerCase();

    return mockEvents.filter((event) => {
      // Search in title, description, category, tags
      const matchesText =
        event.title.toLowerCase().includes(lowerQuery) ||
        event.description.toLowerCase().includes(lowerQuery) ||
        event.category.toLowerCase().includes(lowerQuery) ||
        event.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery));

      // Search for specific features
      const matchesFood = lowerQuery.includes('food') && event.food?.provided;
      const matchesVolunteering = lowerQuery.includes('volunteer') && event.volunteering?.needed;
      const matchesSeating = lowerQuery.includes('seat') && event.seating?.available;
      const matchesFree = lowerQuery.includes('free') && event.food?.cost === 0;

      return matchesText || matchesFood || matchesVolunteering || matchesSeating || matchesFree;
    });
  };

  const generateResponse = (userQuery: string): { text: string; events?: Event[] } => {
    const lowerQuery = userQuery.toLowerCase();

    // Check for greeting
    if (lowerQuery.match(/^(hi|hello|hey)/)) {
      return {
        text: 'Hello! How can I help you find the perfect event today?',
      };
    }

    // Check for volunteering queries
    if (lowerQuery.includes('volunteer')) {
      const volunteerEvents = mockEvents.filter((e) => e.volunteering?.needed);
      return {
        text: `I found ${volunteerEvents.length} events that need volunteers! Here they are:`,
        events: volunteerEvents,
      };
    }

    // Check for food queries
    if (lowerQuery.includes('food')) {
      const foodEvents = mockEvents.filter((e) => e.food?.provided);
      return {
        text: `I found ${foodEvents.length} events with food provided! Here they are:`,
        events: foodEvents,
      };
    }

    // Check for seating queries
    if (lowerQuery.includes('seat') || lowerQuery.includes('space')) {
      const seatingEvents = mockEvents.filter((e) => e.seating?.remaining && e.seating.remaining > 0);
      return {
        text: `Here are ${seatingEvents.length} events with available seating:`,
        events: seatingEvents,
      };
    }

    // Check for category queries
    const categories = ['career', 'social', 'academic', 'workshop', 'club'];
    for (const category of categories) {
      if (lowerQuery.includes(category)) {
        const catEvents = mockEvents.filter(
          (e) => e.category.toLowerCase() === category
        );
        return {
          text: `I found ${catEvents.length} ${category} events:`,
          events: catEvents,
        };
      }
    }

    // Check for "this week" or "soon"
    if (lowerQuery.includes('week') || lowerQuery.includes('soon') || lowerQuery.includes('upcoming')) {
      const upcomingEvents = mockEvents.slice(0, 5);
      return {
        text: 'Here are the upcoming events happening soon:',
        events: upcomingEvents,
      };
    }

    // General search
    const relevantEvents = findRelevantEvents(userQuery);
    if (relevantEvents.length > 0) {
      return {
        text: `I found ${relevantEvents.length} event(s) matching "${userQuery}":`,
        events: relevantEvents,
      };
    }

    return {
      text: `I couldn't find any events matching "${userQuery}". Try asking about specific categories (career, social, academic), or features like "food", "volunteering", or "seating".`,
    };
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Generate bot response
    const response = generateResponse(inputValue);
    const botMessage: Message = {
      id: `bot_${Date.now()}`,
      text: response.text,
      sender: 'bot',
      timestamp: new Date(),
      suggestedEvents: response.events,
    };

    setTimeout(() => {
      setMessages((prev) => [...prev, botMessage]);
    }, 500);

    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    'Show me career events',
    'Events with food',
    'Volunteering opportunities',
    'Events this week',
  ];

  return (
    <>
      {/* Chatbot Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-[#182E55] text-white rounded-full shadow-lg hover:bg-[#182E55]/90 transition-all flex items-center justify-center z-50 group"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#EEA928] rounded-full animate-pulse" />
        </button>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-border">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#182E55] to-[#182E55]/90 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#EEA928] rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#182E55]" />
              </div>
              <div>
                <h3 className="text-white">Events Assistant</h3>
                <p className="text-xs text-white/80">Always here to help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/10 p-1 rounded transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/30">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-[#182E55] text-white'
                      : 'bg-white border border-border'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>

                  {/* Event Suggestions */}
                  {message.suggestedEvents && message.suggestedEvents.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.suggestedEvents.map((event) => (
                        <a
                          key={event.id}
                          href={`/events/${event.id}`}
                          className="block p-2 bg-muted rounded hover:bg-muted/80 transition"
                        >
                          <p className="text-xs font-medium text-foreground">
                            {event.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(event.date).toLocaleDateString('en-AU', {
                              month: 'short',
                              day: 'numeric',
                            })} • {event.category}
                          </p>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          {messages.length === 1 && (
            <div className="px-4 py-2 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Quick actions:</p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action) => (
                  <button
                    key={action}
                    onClick={() => {
                      setInputValue(action);
                      setTimeout(handleSend, 100);
                    }}
                    className="text-xs px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded-full transition"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-border bg-white rounded-b-lg">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="px-4 py-2 bg-[#182E55] text-white rounded-md hover:bg-[#182E55]/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
