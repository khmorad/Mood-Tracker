// src/app/api/generate/route.ts


import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize Google Generative AI with your API key
const genAI = new GoogleGenerativeAI("");
// Initialize the chat model
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req: Request) {
  try {
    const { message, conversation } = await req.json();

    // Log the incoming request data
    console.log("SERVER: Incoming request data:", { message, conversation });

    // Handle undefined message with a safe fallback
    const safeMessage = message || "No message provided";

    if (!conversation) {
      console.log("SERVER: Starting a new conversation with message:", safeMessage);

      const chat = await model.startChat({
        history: [
          {
            role: "user",
            parts: [safeMessage], // Message part is an array of strings
          },
        ],
        generationConfig: {
          maxOutputTokens: 350, // This is correctly placed inside startChat's generationConfig
        },
      });

      console.log("SERVER: New conversation started:", chat);

      return NextResponse.json({
        message: "Conversation started.",
        conversation: chat, // Return the chat object for future use
      });
    } else {
      console.log("SERVER: Continuing conversation with message:", safeMessage);

      // Update conversation history manually
      const updatedHistory = [
        ...conversation._history,
        {
          role: "user",
          parts: [safeMessage],
        },
      ];

      // Pass the history as the input to generateContent, concatenated into a single string
      const inputText = updatedHistory.map((entry) => entry.parts.join(' ')).join('\n');

      // Call the API with the inputText and remove `maxOutputTokens` from the second argument
      const chatResponse = await model.generateContent(inputText);

      console.log("SERVER: Gemini API response:", chatResponse);

      const textResponse = chatResponse?.response?.text || "Sorry, no response.";

      console.log("SERVER: Extracted text response:", textResponse);

      return NextResponse.json({
        message: textResponse,
        conversation: {
          ...conversation,
          _history: updatedHistory,
        }, // Return updated conversation
      });
    }
  } catch (error: unknown) {
    console.error("SERVER: Error communicating with Gemini API:", error instanceof Error ? error.message : error);

    return NextResponse.json({
      message: "Error occurred.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}