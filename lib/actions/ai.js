'use server'
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function askGenAI(formData) {
  // Extract the question from FormData
  let question;
  if (formData instanceof FormData) {
    question = formData.get('question');
  } else {
    // If it's already a string or object, handle accordingly
    question = typeof formData === 'string' ? formData : formData?.question;
  }

  if (!question || question.trim() === '') {
    return { error: "Missing 'question' field" };
  }

  if (!process.env.GOOGLE_GENAI_API_KEY) {
    return { error: "Google GenAI API key not configured" };
  }

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);
  
  try {
    // Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Use the extracted question string
    const prompt = String(question).trim();
    
    // Generate content with explicit structure
    const result = await model.generateContent({
      contents: [{
        parts: [{ text: prompt }]
      }]
    });
    
    const response = await result.response;
    const text = response.text();
    
    return { answer: text };
  } catch (error) {
    console.error("GenAI error:", error);
    const message = error?.message || "Unknown error";
    
    if (message.includes("400")) return { error: "Bad request to GenAI API. Please check your input." };
    if (message.includes("401")) return { error: "Unauthorized. Check your GenAI API key." };
    if (message.includes("403")) return { error: "Forbidden. You do not have access to this resource." };
    if (message.includes("404")) return { error: "GenAI API endpoint not found." };
    if (message.includes("429")) return { error: "GenAI API quota exceeded. Please check your plan and billing details." };
    if (message.includes("SAFETY")) return { error: "Content was blocked by safety filters." };
    
    return { error: `Failed to generate answer: ${message}` };
  }
}