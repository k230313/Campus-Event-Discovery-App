// ============================================
// File:    openai.ts
// Author:  Adamson Buliboli
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Provides frontend service logic for openai.
// ============================================

import { Event } from '../types';
import { csrfFetch } from './api';

export interface ChatResponse {
  reply: string;
  events: Array<{
    id: string;
    title: string;
    date?: string;
  }>;
  degraded?: boolean;
}

export async function generateAIResponse(
  userMessage: string,
  _events: Event[],
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<ChatResponse> {
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

  return {
    reply: data.reply,
    events: Array.isArray(data?.events) ? data.events : [],
    degraded: Boolean(data?.degraded),
  };
}
