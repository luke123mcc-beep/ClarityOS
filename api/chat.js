// Vercel serverless function. Proxies the browser to Anthropic
// so ANTHROPIC_API_KEY never reaches the client.
//
// Reads the system prompt from src/systemPrompt.js so the prompt
// is checked into git and easy to iterate on. The system prompt
// is marked for caching — multi-turn sessions will reuse the cached
// prefix and only pay for new turns.

import Anthropic from '@anthropic-ai/sdk';
import { COACH_SYSTEM_PROMPT } from '../src/systemPrompt.js';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MODEL = 'claude-sonnet-4-5';
const MAX_TOKENS = 1024;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({
      error: 'ANTHROPIC_API_KEY not configured on the server.',
    });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  const messages = Array.isArray(body?.messages) ? body.messages : null;
  if (!messages || messages.length === 0) {
    return res.status(400).json({ error: 'messages[] required' });
  }

  // Whitelist shape — refuse anything that isn't {role, content} strings.
  const clean = messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: m.content }));

  if (clean.length === 0) {
    return res.status(400).json({ error: 'no valid messages' });
  }

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      // Cache the (long, stable) system prompt across turns in a session.
      system: [
        {
          type: 'text',
          text: COACH_SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: clean,
    });

    const text = response.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n');

    return res.status(200).json({
      text,
      usage: response.usage,
    });
  } catch (err) {
    console.error('Anthropic error:', err);
    return res.status(500).json({
      error: err?.message || 'Unknown error talking to Anthropic',
    });
  }
}
