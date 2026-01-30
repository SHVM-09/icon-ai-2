import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { userBriefPrompt } from '$lib/constants/prompts';
import { OPENROUTER_API_KEY } from '$env/static/private';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const DEFAULT_MODEL = 'google/gemini-2.5-flash-image';

export const POST: RequestHandler = async ({ request }) => {
  const key = OPENROUTER_API_KEY?.trim();
  if (!key) {
    return json(
      { error: 'OPENROUTER_API_KEY is not set. Add it in .env (get one at openrouter.ai)' },
      { status: 503 }
    );
  }

  let body: {
    purpose?: string;
    whereUsed?: string;
    visualIdea?: string;
    designChoice?: string;
    styleMode?: string;
    targetSizePx?: number;
    paletteList?: string;
  };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const intake = {
    purpose: body.purpose ?? '',
    whereUsed: body.whereUsed ?? '',
    visualIdea: body.visualIdea ?? '',
    designChoice: body.designChoice ?? 'Simple',
    styleMode: body.styleMode ?? 'Outline',
    targetSizePx: body.targetSizePx ?? 24,
    paletteList: body.paletteList ?? ''
  };

  const prompt = userBriefPrompt(intake);

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://icon-studio.local'
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1024
      })
    });

    const data = await res.json();

    if (!res.ok) {
      const err = data?.error?.message ?? data?.message ?? res.statusText;
      return json({ error: `OpenRouter: ${err}` }, { status: 502 });
    }

    const message = data?.choices?.[0]?.message;
    let text = '';
    const content = message?.content;
    if (typeof content === 'string') {
      text = content.trim();
    } else if (Array.isArray(content) && content.length > 0) {
      for (const part of content) {
        const t = (part?.text ?? part?.content ?? '').trim();
        if (t) {
          text = t;
          break;
        }
      }
    }
    if (!text) {
      text = (data?.choices?.[0]?.text ?? '').trim();
    }

    if (!text) {
      return json({ error: 'Empty response from OpenRouter' }, { status: 502 });
    }

    return json({ brief: text });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return json({ error: `OpenRouter request failed: ${message}` }, { status: 502 });
  }
};
