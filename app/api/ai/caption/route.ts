// app/api/ai/caption/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { requireGeminiApiKey } from '@/lib/env';

const systemInstruction = `You are an expert social media marketer helping small businesses craft compelling social media content.
When given a topic, generate:
1) A short, engaging caption (1–3 sentences), including an emoji or two if natural.
2) 5–10 relevant hashtags.
Format exactly:
<caption text>

#tag1 #tag2 #tag3 ...`;

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();
    if (!topic || typeof topic !== 'string') {
      return NextResponse.json({ ok: false, error: 'Missing "topic"' }, { status: 400 });
    }

    const apiKey = requireGeminiApiKey();
    const ai = new GoogleGenAI({
      apiKey,
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: `Topic: ${topic}\n\nFollow the instructions.` }] },
      ],
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const text = response?.text?.trim?.() ?? '';
    if (!text) {
      return NextResponse.json({ ok: false, error: 'Empty response from model' }, { status: 502 });
    }

    return NextResponse.json({ ok: true, result: text });
  } catch (e: any) {
    console.error('Gemini API error:', e);
    return NextResponse.json({ ok: false, error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
