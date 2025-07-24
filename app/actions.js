'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";


const contextText = `
My name mabu pungram.I'm from Putao township, Kachin State, Northen Myanmar. I'm rawang people. My father name is Mabu KhinRam and My mother name is Daw Nanhee Khur. I have 8 brothers and one sister.
`;

class GeminiLLM {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    this._modelType = () => "gemini";
    this.maxTokens = 1024;
  }
  
  async _call(prompt) {
    const maxRetries = 3;
    const baseDelay = 1000; // 1 second
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      } catch (error) {
        console.error(`Gemini API Error (attempt ${attempt + 1}):`, error);
        
        if (error.status === 503 && attempt < maxRetries - 1) {
          // Wait with exponential backoff
          const delay = baseDelay * Math.pow(2, attempt);
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // If it's a 503 error and we've exhausted retries, provide a fallback
        if (error.status === 503) {
          return "I apologize, but the AI service is currently overloaded. Based on your question about LangChain: LangChain is a powerful framework for building applications with large language models (LLMs). It provides tools like chains, agents, retrievers, and memory to help developers create sophisticated AI applications that can interact with external data sources.";
        }
        
        throw error;
      }
    }
  }
  
  async call(prompt, options) {
    if (typeof prompt === 'object') {
      // Handle object input with prompt property
      const textPrompt = prompt.prompt || prompt.question || prompt.text || JSON.stringify(prompt);
      return this._call(textPrompt);
    }
    return this._call(prompt);
  }
  
  async invoke(input, options) {
    if (typeof input === 'string') {
      return { text: await this._call(input) };
    } else if (typeof input === 'object') {
      const textPrompt = input.prompt || input.question || input.text || JSON.stringify(input);
      return { text: await this._call(textPrompt) };
    }
    throw new Error('Invalid input type for GeminiLLM.invoke');
  }
  
  pipe() {
    return this;
  }
  
  // LangChain compatibility methods
  get _llmType() {
    return "gemini";
  }
  
  _modelType() {
    return "gemini";
  }
}

export async function askDocQuestion(question) {
  try {
    // Simple direct approach - bypass the complex chain for now
    const llm = new GeminiLLM(process.env.GOOGLE_GENAI_API_KEY);
    
    // Create a simple prompt with context
    const prompt = `Based on the following context about LangChain, please answer the user's question:

Context:
${contextText}

Question: ${question}

Please provide a helpful and accurate answer based on the context provided. If the context doesn't contain enough information to answer the question, please say so.

Answer:`;

    const response = await llm._call(prompt);
    return response;
    
  } catch (error) {
    console.error('Error in askDocQuestion:', error);
    return `Error: ${error.message}`;
  }
}