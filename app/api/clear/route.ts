import { NextResponse } from 'next/server';
import { globalVectorStore } from '@/app/lib/memory-vector-store';
import { getQAChain } from '@/app/lib/qa.chain';

export async function POST() {
  try {
    // Clear vector store
    globalVectorStore.clear();
    
    // Clear conversation history if QA chain exists
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;
    if (apiKey) {
      const qaChain = getQAChain(apiKey);
      qaChain.clearHistory();
    }

    return NextResponse.json({
      success: true,
      message: 'Vector store and conversation history cleared'
    });
  } catch (error) {
    console.error('Error clearing data:', error);
    return NextResponse.json(
      { error: 'Failed to clear data' },
      { status: 500 }
    );
  }
}