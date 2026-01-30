import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { beautyRenderPrompt } from '$lib/constants/prompts';
import { OPENROUTER_API_KEY } from '$env/static/private';
import { GEMINI_API_KEY } from '$env/static/private';
import { GoogleGenerativeAI } from '@google/generative-ai';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

/** OpenRouter model that supports image generation (output_modalities includes "image"). */
const OPENROUTER_IMAGE_MODEL = 'google/gemini-2.5-flash-image';

function extractBase64FromDataUrl(dataUrl: string): string | null {
  if (!dataUrl?.startsWith('data:')) return null;
  const i = dataUrl.indexOf(',');
  return i === -1 ? null : dataUrl.slice(i + 1);
}

/** Generate beauty icon image via OpenRouter (modalities: image + text). */
async function generateBeautyOpenRouter(
  key: string,
  beautyPrompt: string
): Promise<{ beautyBase64: string | null; error?: string }> {
  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://icon-studio.local'
    },
    body: JSON.stringify({
      model: OPENROUTER_IMAGE_MODEL,
      messages: [{ role: 'user', content: beautyPrompt }],
      modalities: ['image', 'text'],
      max_tokens: 1024
    })
  });

  const data = await res.json();

  if (!res.ok) {
    const err = data?.error?.message ?? data?.message ?? res.statusText;
    return { beautyBase64: null, error: err };
  }

  const message = data?.choices?.[0]?.message;
  const images = message?.images;
  if (!images?.length) {
    return {
      beautyBase64: null,
      error: 'OpenRouter returned no image. Try a different prompt or check model supports image generation.'
    };
  }

  const first = images[0];
  const url = first?.image_url?.url ?? first?.imageUrl?.url;
  if (!url) return { beautyBase64: null, error: 'No image URL in response' };

  const base64 = extractBase64FromDataUrl(url);
  return { beautyBase64: base64 ?? null };
}

/** Legacy: generate via Gemini (requires GEMINI_API_KEY). */
async function generateBeautyGemini(
  key: string,
  beautyPrompt: string
): Promise<{ beautyBase64: string | null }> {
  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: beautyPrompt }] }]
  });
  const candidates = result.response.candidates ?? [];
  for (const c of candidates) {
    const parts = c.content?.parts ?? [];
    for (const p of parts) {
      if (p.inlineData?.data && p.inlineData?.mimeType?.startsWith('image/')) {
        return { beautyBase64: p.inlineData.data };
      }
    }
  }
  return { beautyBase64: null };
}

/** MVP1: Generate Beauty PNG (and optionally Segmentation) from user brief. Uses OpenRouter when key set, else Gemini. */
export const POST: RequestHandler = async ({ request }) => {
  const openRouterKey = OPENROUTER_API_KEY?.trim();
  const geminiKey = GEMINI_API_KEY?.trim();

  if (!openRouterKey && !geminiKey) {
    return json(
      {
        error:
          'Set OPENROUTER_API_KEY or GEMINI_API_KEY in .env. OpenRouter is used for icon image generation (same key as brief).'
      },
      { status: 503 }
    );
  }

  let body: {
    brief?: string;
    purpose?: string;
    whereUsed?: string;
    visualIdea?: string;
    designChoice?: string;
    styleMode?: string;
    targetSizePx?: number;
    renderPx?: number;
    paletteList?: string;
  };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const renderPx = body.renderPx ?? 1024;
  const targetSizePx = body.targetSizePx ?? 24;
  const purpose = body.purpose ?? body.brief ?? '';
  const whereUsed = body.whereUsed ?? '';
  const visualIdea = body.visualIdea ?? '';
  const designChoice = body.designChoice ?? 'Simple';
  const styleMode = body.styleMode ?? 'Outline';
  const paletteList = body.paletteList ?? '';

  const beautyPrompt = beautyRenderPrompt({
    purpose,
    where_used: whereUsed,
    visual_idea: visualIdea,
    design_choice: designChoice,
    style_mode: styleMode,
    target_size: targetSizePx,
    render_px: renderPx,
    palette_list: paletteList
  });

  let beautyBase64: string | null = null;
  let segBase64: string | null = null;
  let message: string | undefined;

  try {
    if (openRouterKey) {
      const out = await generateBeautyOpenRouter(openRouterKey, beautyPrompt);
      beautyBase64 = out.beautyBase64;
      if (out.error && !beautyBase64) {
        return json({ error: `OpenRouter: ${out.error}` }, { status: 502 });
      }
    }

    if (!beautyBase64 && geminiKey) {
      const out = await generateBeautyGemini(geminiKey, beautyPrompt);
      beautyBase64 = out.beautyBase64;
      if (!beautyBase64) message = 'Gemini returned text only; no image. Try OpenRouter with an image-capable model.';
    }

    if (!beautyBase64) {
      return json({
        error:
          message ??
          'No image was generated. Ensure OPENROUTER_API_KEY is set and the model supports image output (e.g. google/gemini-2.5-flash-image).'
      }, { status: 502 });
    }

    return json({
      beautyBase64,
      segBase64: segBase64 ?? undefined,
      message: segBase64 ? undefined : 'Segmentation layer not generated; editor shows beauty icon only.'
    });
  } catch (e) {
    const err = e instanceof Error ? e.message : 'Unknown error';
    return json({ error: `Generation error: ${err}` }, { status: 502 });
  }
};
