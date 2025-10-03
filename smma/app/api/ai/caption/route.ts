
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { env } from '@/lib/env'; // uses GEMINI_API_KEY

const systemInstruction = `You are an expert social media marketing assistant for a company named 'SMMA Morocco'. Your goal is to help creators and small agencies craft compelling social media content.
When given a topic, you must generate:
1.  An engaging and professional caption. The caption should be concise, use emojis appropriately to increase engagement, and have a clear call-to-action if relevant.
2.  A set of 5-10 relevant and trending hashtags.
Format your response clearly, with the caption first, followed by a blank line, and then the hashtags prefixed with the '#' symbol.
Example:
Amazing new product launch today! 🚀 We've been working hard on this, and we can't wait for you to try it. Check it out at the link in our bio!

#ProductLaunch #NewProduct #Tech #Innovation #GameChanger`;

export async function POST(req: Request) {
  try {
    const { topic, tone, length } = await req.json();

    if (!env.geminiApiKey) {
      // FIX: Use API_KEY as per guidelines
      return NextResponse.json({ ok: false, error: 'Missing API_KEY' }, { status: 500 });
    }

    // FIX: Pass apiKey in an object
    const ai = new GoogleGenAI({ apiKey: env.geminiApiKey });

    const fullPrompt = `Generate a social media post about: ${topic}. The tone should be ${tone || 'professional'} and the length should be ${length || 'medium'}.`;
    
    // FIX: Use ai.models.generateContent, correct model name, and content format.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
      config: { systemInstruction, temperature: 0.7 },
    });

    return NextResponse.json({ ok: true, result: response.text });
  } catch (e: any) {
    console.error('Gemini API error:', e);
    return NextResponse.json({ ok: false, error: e?.message || 'Unknown error' }, { status: 500 });
  }
}
