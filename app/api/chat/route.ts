import { NextRequest, NextResponse } from 'next/server';
import {  getQAChain,QAChain} from '@/app/lib/qa.chain';

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json();

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    // Check for API key
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google AI API key not configured' },
        { status: 500 }
      );
    }

    // Get QA chain instance
    const qaChain = getQAChain(apiKey);

    // Generate response
    const response = await qaChain.askQuestion(question);

    return NextResponse.json({
      success: true,
      message: response,
      conversationHistory: qaChain.getConversationHistory()
    });

  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to generate response: ' + (error as Error).message },
      { status: 500 }
    );
  }
}