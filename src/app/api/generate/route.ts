import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Create an asynchronous function POST to handle POST requests
export async function POST(req: Request) {
  try {
    // Access your API key by creating an instance of GoogleGenerativeAI
    const apiKey = process.env.REACT_APP_GEMINI_APIKEY;
    if (!apiKey) {
      throw new Error("REACT_APP_GEMINI_APIKEY is not defined");
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    console.log("SERVER: GoogleGenerativeAI initialized");

    // Initialize the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log("SERVER: Generative model initialized");

    // Retrieve the data from the request body
    const data = await req.json();
    console.log("SERVER: Request body:", data);

    // Define a prompt variable, assuming the prompt is provided in the 'message' field
    const prompt = data.message;
    console.log("SERVER: Using prompt:", prompt);

    // Pass the prompt to the model and retrieve the output
    const result = await model.generateContent(prompt);
    console.log("SERVER: Response from Gemini API:", result);

    // Extract the response text from the result directly without using candidates
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
