import { NextRequest, NextResponse } from 'next/server';
import { EmbeddingService } from '@/app/lib/embedding-service';
import { globalVectorStore } from '@/app/lib/memory-vector-store';

export async function POST(request: NextRequest) {
  try {
    const { query, k = 5 } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Check for API key
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google AI API key not configured' },
        { status: 500 }
      );
    }

    // Check if vector store has chunks
    if (globalVectorStore.chunks.length === 0) {
      return NextResponse.json({
        results: [],
        message: 'No documents in vector store. Please upload a PDF first.'
      });
    }

    // Generate embedding for query
    const embeddingService = new EmbeddingService(apiKey);
    const queryEmbedding = await embeddingService.generateEmbedding(query);

    // Perform similarity search
    const results = globalVectorStore.similaritySearch(queryEmbedding, k);

    return NextResponse.json({
      success: true,
      query,
      results: results.map(result => ({
        content: result.chunk.content,
        similarity: result.similarity,
        metadata: result.chunk.metadata
      })),
      vectorStoreStats: globalVectorStore.getStats()
    });

  } catch (error) {
    console.error('Error performing search:', error);
    return NextResponse.json(
      { error: 'Search failed: ' + (error as Error).message },
      { status: 500 }
    );
  }
}