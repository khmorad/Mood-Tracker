// src/app/api/text-to-speech/route.ts

import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import fs from "fs";
import path from "path";

const client = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY });
if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
  throw new Error("Environment variable NEXT_PUBLIC_OPENAI_API_KEY is missing");
}

export async function POST(req: Request) {
  try {
    const { text, voice = "alloy" } = await req.json();
    if (!text) {
      return NextResponse.json({ error: "Text input is required" }, { status: 400 });
    }

    // Generate the TTS response
    const response = await client.audio.speech.create({
      model: "tts-1",
      voice,
      input: text,
    });

    // Check if the response body exists
    if (!response || !response.body) {
      return NextResponse.json({ error: "No audio data received" }, { status: 500 });
    }

    // Ensure the public directory exists
    const publicDir = path.join(process.cwd(), "public");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Set the file path for saving audio in the `public` folder
    const filePath = path.join(publicDir, "speech.mp3");

    // Fetch the audio data as an ArrayBuffer and write it to a file
    const audioBuffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(filePath, audioBuffer);

    // Return the URL path to the saved file
    return NextResponse.json({ url: `/speech.mp3` });
  } catch (error) {
    console.error("Error generating speech:", error);
    return NextResponse.json({ error: "Failed to generate speech" }, { status: 500 });
  }
}
