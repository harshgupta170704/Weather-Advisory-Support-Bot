// Thin API wrapper — all backend calls go through here

import { ChatResponse } from '@/types';

const API_BASE = ''; // empty = same origin (vite proxy handles it in dev)

export async function createSession(): Promise<string> {
  const res = await fetch(`${API_BASE}/api/session/new`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to create session');
  const data = await res.json();
  return data.session_id;
}

export async function sendMessage(
  sessionId: string,
  message: string
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, message }),
  });
  if (!res.ok) throw new Error(`Chat request failed: ${res.status}`);
  return res.json();
}

export async function checkHealth(): Promise<{
  status: string;
  sops_loaded: number;
  llm_provider: string;
}> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}
