
import { GoogleGenAI } from "@google/genai";

export async function POST(request) {
  const body = await request.json();
  const question = body.question;

  if (!question) {
    return new Response(JSON.stringify({ error: "Missing 'question'" }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: question,
    });
    const answer = response.text;

    return new Response(JSON.stringify({ answer }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("GenAI error:", error);

    const message = error?.message || "Unknown error";
    if (message.includes("400")) {
      return new Response(JSON.stringify({ error: "Bad request to GenAI API." }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (message.includes("401")) {
      return new Response(JSON.stringify({ error: "Unauthorized. Check your GenAI API key." }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (message.includes("403")) {
      return new Response(JSON.stringify({ error: "Forbidden. You do not have access to this resource." }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (message.includes("404")) {
      return new Response(JSON.stringify({ error: "GenAI API endpoint not found." }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (message.includes("429")) {
      return new Response(JSON.stringify({ error: "GenAI API quota exceeded. Please check your plan and billing details." }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: "Failed to generate answer." }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
