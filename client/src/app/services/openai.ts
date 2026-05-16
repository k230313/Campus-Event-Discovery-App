import { Event } from '../types';
import { csrfFetch } from './api';

export async function generateAIResponse(
  userMessage: string,
  _events: Event[],
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<string> {
  const response = await csrfFetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: userMessage,
      conversationHistory,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || 'Failed to generate AI response');
  }

  if (typeof data?.reply !== 'string' || !data.reply.trim()) {
    throw new Error('Chat response was invalid');
  }

  return data.reply;
}
