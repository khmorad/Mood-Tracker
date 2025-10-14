// route.ts - CORRECTED VERSION

import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("[Gemini API] GEMINI_API_KEY is not defined");
      throw new Error("GEMINI_API_KEY is not defined");
    }

    // Initialize the Gemini API client
    const genAI = new GoogleGenAI({ apiKey });

    const data = await req.json();
    const prompt = data.message;
    console.log("[Gemini API] Incoming prompt:", prompt);

    // ⭐️ FIX 1: Use genAI.models.generateContent (as per TypeScript error)
    // ⭐️ FIX 2: Correct the 'contents' structure (was the previous API error)
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash", // Or the recommended "gemini-2.5-flash"
      contents: [{ role: "user", parts: [{ text: prompt }] }], // CORRECTED STRUCTURE
    });

    console.log("[Gemini API] Response:", response);

    // Get the text from the response
    const output = response.text || "No valid response from the AI.";
    return NextResponse.json({ message: output });
  } catch (error) {
    console.error("[Gemini API] Error:", error);
    return NextResponse.json({
      message: "I'm here to support you. How else can I help? 💙",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
