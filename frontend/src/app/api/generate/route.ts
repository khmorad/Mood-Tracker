import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// create an asynchronous function POST to handle POST requests **used by mood-tracking/page.tsx**
export async function POST(req: Request) {
  try {
    const apiKey = process.env.REACT_APP_GEMINI_APIKEY;
    if (!apiKey) {
      throw new Error("REACT_APP_GEMINI_APIKEY is not defined");
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    console.log("SERVER: GoogleGenerativeAI initialized");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log("SERVER: Generative model initialized");
    // retrieve the data from the request body
    //SERVER: Request body: { message: 'hello :D', conversation: null }
    const data = await req.json();
    console.log("SERVER: Request body:", data);
    // prompt created by the user (need to make this more effective)
    const prompt = data.message;
    console.log("SERVER: Using prompt:", prompt);
    // Pass the prompt to the model and retrieve the output
    const result = await model.generateContent(prompt);
    console.log("SERVER: Response from Gemini API:", result);

    /*
    SERVER: Response from Gemini API: {
  response: {
    candidates: [ [Object] ],
    usageMetadata: {
      promptTokenCount: 4,
      candidatesTokenCount: 237,
      totalTokenCount: 241
    },
    modelVersion: 'gemini-1.5-flash-001',
    text: [Function (anonymous)],
    functionCall: [Function (anonymous)],
    functionCalls: [Function (anonymous)]
  }
}
    */
    const output = result.response?.text() || "No valid response from the AI.";
    console.log("SERVER: Output from AI:", output);

    // Send the output as a server response object
    return NextResponse.json({ message: output }); // Changed from 'output' to 'message'
  } catch (error) {
    console.error("SERVER: Error communicating with Gemini API:", error);
    return NextResponse.json({
      error: "An error occurred while processing your request.",
    });
  }
}
