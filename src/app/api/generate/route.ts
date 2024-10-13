import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY as string); // Ensure the API key is defined as a string

// Initialize the chat model
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req: Request) {
  try {
    // Parse request body to extract message and conversation
    const { message, conversation } = await req.json();
    
    // Handle undefined message with a safe fallback
    const safeMessage = message || "No message provided";

    // Check if conversation exists
    if (!conversation) {
      // Start a new conversation
      const chat = model.startChat({
        history: [
          {
            role: "user",
            parts: [safeMessage], // Ensuring the message part is an array of strings (as expected by Gemini API)
          },
        ],
        generationConfig: {
          maxOutputTokens: 350,
        },
      });

      // Return a response indicating the conversation started
      return NextResponse.json({
        message: "Conversation started.",
        conversation: chat, // Return the chat object so the client can continue the conversation
      });
    } else {
      // Continue an existing conversation
      const response = await conversation.sendMessage(safeMessage);

      // Extract the response text
      const textResponse = response.messages?.[0]?.content?.parts?.join(" ") || "Sorry, no response.";

      // Return the AI response and conversation object
      return NextResponse.json({
        message: textResponse,
        conversation, // Return updated conversation for future interactions
      });
    }
  } catch (error: unknown) { // Error type set to unknown to avoid `any`
    // Improved error handling
    if (error instanceof Error) {
      console.error("Error communicating with Gemini API:", error.message);
      return NextResponse.json({ message: "Error occurred.", error: error.message });
    } else {
      console.error("Unknown error:", error);
      return NextResponse.json({ message: "Unknown error occurred." });
    }
  }
}
