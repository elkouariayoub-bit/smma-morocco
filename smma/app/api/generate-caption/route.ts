
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const systemInstruction = `You are an expert social media marketing assistant for a company named 'SMMA Morocco'. Your goal is to help creators and small agencies craft compelling social media content.
When given a topic, you must generate:
1.  An engaging and professional caption. The caption should be concise, use emojis appropriately to increase engagement, and have a clear call-to-action if relevant.
2.  A set of 5-10 relevant and trending hashtags.
Format your response clearly, with the caption first, followed by a blank line, and then the hashtags prefixed with the '#' symbol.
Example:
Amazing new product launch today! 🚀 We've been working hard on this, and we can't wait for you to try it. Check it out at the link in our bio!

#ProductLaunch #NewProduct #Tech #Innovation #GameChanger`;


export async function POST(req: Request) {
    // FIX: Use API_KEY from process.env as per guidelines
    if (!process.env.API_KEY) {
        return NextResponse.json({ error: "API key not configured." }, { status: 500 });
    }

    try {
        const { topic } = await req.json();

        if (!topic || typeof topic !== 'string' || !topic.trim()) {
            return NextResponse.json({ error: "Topic is required." }, { status: 400 });
        }
        
        // FIX: Use API_KEY from process.env as per guidelines
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate a social media post about: ${topic}`,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.7,
                topP: 1,
                topK: 32,
            },
        });

        return NextResponse.json({ caption: response.text });
    } catch (error) {
        console.error("Error generating caption with Gemini API:", error);
        return NextResponse.json({ error: "Failed to generate caption." }, { status: 500 });
    }
}
