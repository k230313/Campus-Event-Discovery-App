// ============================================
// File:    ChatBot.tsx
// Author:  Navroop Kaur
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Renders the Chat Bot frontend component.
// ============================================

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { useApp } from '../context/AppContext';
import { generateAIResponse } from '../services/openai';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  degraded?: boolean;
  relatedEvents?: Array<{
    id: string;
    title: string;
    date?: string;
  }>;
}

/**
 * Executes the format event date logic.
 * @param {*} date - Represents the date input.
 * @returns {*} Returns the resulting value.
 */
function formatEventDate(date?: string) {
  if (!date) {
    return '';
  }

  return new Date(date).toLocaleDateString('en-AU', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Renders the ChatBot component for the application interface.
 * @returns {JSX.Element} Renders the component output.
 */
export function ChatBot() {
  const { events } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! I\'m CEDA Assistant, powered by AI. I can help you find campus events using natural language. Try asking me things like "Find networking events" or "What events are happening this week?"',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  /**
   * Asynchronously executes the handle send logic.
   * @returns {*} Returns the resulting value.
   */
  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const query = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      // Prepare conversation history for context
      const conversationHistory = messages.map(m => ({
        role: m.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: m.text,
      }));

      // Call OpenAI API with event context
      const botResponse = await generateAIResponse(query, events, conversationHistory);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse.reply,
        sender: 'bot',
        timestamp: new Date(),
        degraded: Boolean(botResponse.degraded),
        relatedEvents: botResponse.events,
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I apologize, I encountered an error. Please try again or browse events directly from the Events page.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          aria-label="Open CEDA chat assistant"
          className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-2xl bg-gradient-to-br from-[#B45309] to-[#92400E] hover:from-[#92400E] hover:to-[#B45309] hover:scale-110 transition-all duration-300 z-50 text-white"
        >
          <MessageCircle className="h-7 w-7" aria-hidden="true" />
        </Button>
      )}

      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-[400px] h-[600px] max-h-[80vh] flex flex-col shadow-2xl border-2 border-[#EF9B28]/20 z-50 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-[#1B2E55] to-[#2a4575] text-white rounded-t-lg flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#EF9B28] flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold">CEDA Assistant</h3>
                <Badge className="bg-[#EF9B28]/20 text-[#EF9B28] border-[#EF9B28]/30 text-xs">
                  AI-Powered
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat assistant"
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 shadow-md ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-br from-[#1B2E55] to-[#2a4575] text-white'
                        : 'bg-white border-2 border-gray-100'
                    }`}
                  >
                    <div className={`text-sm leading-relaxed space-y-2 ${message.sender === 'bot' ? 'text-gray-800' : ''}`}>
                      {message.degraded && (
                        <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700">
                          Limited mode
                        </Badge>
                      )}
                      {message.text.split('\n').filter(Boolean).map((line, index) => (
                        <p key={`${message.id}-line-${index}`}>{line.trim()}</p>
                      ))}
                      {message.sender === 'bot' && message.relatedEvents && message.relatedEvents.length > 0 && (
                        <div className="pt-1">
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                            Related events
                          </p>
                          <div className="space-y-2">
                            {message.relatedEvents.map((event) => (
                              <Link
                                key={event.id}
                                to={`/events/${event.id}`}
                                onClick={() => setIsOpen(false)}
                                className="block rounded-lg border border-[#EF9B28]/30 bg-[#FFF8ED] px-3 py-2 transition-colors hover:bg-[#FDE9C8]"
                              >
                                <span className="block font-medium text-[#1B2E55]">{event.title}</span>
                                {event.date && (
                                  <span className="block text-xs text-gray-500 mt-1">{formatEventDate(event.date)}</span>
                                )}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <p className={`text-xs mt-2 ${message.sender === 'user' ? 'text-white/70' : 'text-gray-400'}`}>
                      {message.timestamp.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 shadow-md">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-[#EF9B28] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-[#EF9B28] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-[#EF9B28] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                      <span className="text-xs text-gray-500">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t bg-white flex-shrink-0">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isTyping && handleSend()}
                placeholder="Ask me about events..."
                disabled={isTyping}
                className="border-2 focus:border-[#EF9B28] transition-colors"
              />
              <Button
                onClick={handleSend}
                size="icon"
                disabled={isTyping || !inputValue.trim()}
                className="bg-gradient-to-br from-[#EF9B28] to-[#d68a20] hover:from-[#d68a20] hover:to-[#EF9B28] disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-center text-gray-400 mt-2">
              Event assistant
            </p>
          </div>
        </Card>
      )}
    </>
  );
}
