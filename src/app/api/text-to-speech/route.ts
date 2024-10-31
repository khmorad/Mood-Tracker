import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import fs from "fs";
import path from "path";

const client = new OpenAI();

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
    if (!response.body) {
      return NextResponse.json({ error: "No audio data received" }, { status: 500 });
    }

    // Set the file path for saving audio
    const filePath = path.join(process.cwd(), "public", "speech.mp3");

    // Create a writable stream
    const fileStream = fs.createWriteStream(filePath);

    // Process the stream to save audio data
    await processStream(response.body, fileStream);

    return NextResponse.json({ url: `/speech.mp3` });
  } catch (error) {
    console.error("Error generating speech:", error);
    return NextResponse.json({ error: "Failed to generate speech" }, { status: 500 });
  }
}

// Function to handle the reading and writing of audio data
async function processStream(readableStream: ReadableStream, fileStream: fs.WriteStream) {
  const reader = readableStream.getReader();
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      fileStream.write(value);
    }
  } catch (error) {
    console.error("Error while writing stream:", error);
  } finally {
    fileStream.end();
    reader.releaseLock();
  }
}
