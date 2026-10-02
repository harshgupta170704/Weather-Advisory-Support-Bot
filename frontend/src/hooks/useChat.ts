// Chat hook — handles messages, sessions, and talking to the backend

import { useState, useCallback, useRef } from 'react';
import { ChatMessage, ChatResponse } from '@/types';
import { createSession, sendMessage } from '@/api/client';

function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<ChatResponse | null>(null);
  const sessionInitialized = useRef(false);

  const initSession = useCallback(async () => {
    if (sessionInitialized.current) return sessionId;
    try {
      const id = await createSession();
      setSessionId(id);
      sessionInitialized.current = true;
      return id;
    } catch {
      // Fallback: generate client-side session ID
      const fallbackId = generateId();
      setSessionId(fallbackId);
      sessionInitialized.current = true;
      return fallbackId;
    }
  }, [sessionId]);

  const send = useCallback(async (content: string, location?: string | null) => {
    if (!content.trim() || isLoading) return;

    // Ensure session exists
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      currentSessionId = await initSession();
    }

    // Add user message to UI (without the location prefix)
    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    // Add loading assistant message
    const loadingMsg: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setIsLoading(true);

    try {
      // If location is provided, we silently append it for the backend context
      const queryToSend = location ? `[Location Context: ${location}] ${content.trim()}` : content.trim();
      const response = await sendMessage(currentSessionId, queryToSend);

      const assistantMsg: ChatMessage = {
        id: loadingMsg.id,
        role: 'assistant',
        content: response.answer,
        timestamp: new Date(),
        response,
      };

      setMessages((prev) =>
        prev.map((m) => (m.id === loadingMsg.id ? assistantMsg : m))
      );
      setLastResponse(response);
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: loadingMsg.id,
        role: 'assistant',
        content:
          'Sorry, I encountered an error connecting to the server. Please check that the backend is running and try again.',
        timestamp: new Date(),
      };
      setMessages((prev) =>
        prev.map((m) => (m.id === loadingMsg.id ? errorMsg : m))
      );
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, isLoading, initSession]);

  const clearSession = useCallback(() => {
    setMessages([]);
    setLastResponse(null);
    setSessionId('');
    sessionInitialized.current = false;
  }, []);

  return {
    messages,
    isLoading,
    lastResponse,
    send,
    clearSession,
    sessionId,
  };
}
