import { NextRequest, NextResponse } from 'next/server';
import { parsePDF, cleanText } from '@/app/lib/pdf-parser';
import { TextSplitter } from '@/app/lib/text-splitter';
import { EmbeddingService } from '@/app/lib/embedding-service';
import { globalVectorStore } from '@/app/lib/memory-vector-store';
import { VectorizedChunk } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    // Validate file presence
    if (!file || typeof file !== 'object' || !('arrayBuffer' in file)) {
      return NextResponse.json({ error: 'No file provided or invalid file type' }, { status: 400 });
    }

    // Validate file type (PDF only)
    // @ts-ignore
    const fileType = file.type || '';
    // @ts-ignore
    const fileName = file.name || '';
    if (
      fileType !== 'application/pdf' &&
      !fileName.toLowerCase().endsWith('.pdf')
    ) {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
    }

    // Check for API key
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google AI API key not configured' },
        { status: 500 }
      );
    }

    // Convert file to buffer
    let buffer: Buffer;
    try {
      // @ts-ignore
      buffer = Buffer.from(await file.arrayBuffer());
    } catch (err) {
      console.error('Error reading file buffer:', err);
      return NextResponse.json({ error: 'Failed to read file buffer' }, { status: 400 });
    }

    // Parse PDF
    let parsedPDF;
    try {
      parsedPDF = await parsePDF(buffer, fileName);
      if (!parsedPDF || !parsedPDF.text) {
        return NextResponse.json({ error: 'PDF parsing failed or file is empty' }, { status: 400 });
      }
    } catch (err) {
      console.error('Error parsing PDF:', err);
      return NextResponse.json({ error: 'Failed to parse PDF: ' + (err as Error).message }, { status: 400 });
    }

    // Clean and split text
    const cleanedText = cleanText(parsedPDF.text);
    if (!cleanedText || cleanedText.trim().length === 0) {
      return NextResponse.json({ error: 'PDF contains no readable text' }, { status: 400 });
    }

    const textSplitter = new TextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200
    });
    const chunks = textSplitter.splitText(cleanedText, fileName);
    if (!chunks || chunks.length === 0) {
      return NextResponse.json({ error: 'No text chunks generated from PDF' }, { status: 400 });
    }

    // Generate embeddings
    let embeddings;
    try {
      const embeddingService = new EmbeddingService(apiKey);
      const texts = chunks.map(chunk => chunk.content);
      console.log(`Generating embeddings for ${texts.length} chunks...`);
      embeddings = await embeddingService.generateEmbeddings(texts);
      if (!embeddings || embeddings.length !== chunks.length) {
        throw new Error('Embedding service returned invalid result');
      }
    } catch (err) {
      console.error('Error generating embeddings:', err);
      return NextResponse.json({ error: 'Failed to generate embeddings: ' + (err as Error).message }, { status: 500 });
    }

    // Create vectorized chunks
    const vectorizedChunks: VectorizedChunk[] = chunks.map((chunk, index) => ({
      ...chunk,
      embedding: embeddings[index]
    }));

    // Add to vector store
    try {
      globalVectorStore.addChunks(vectorizedChunks);
    } catch (err) {
      console.error('Error adding chunks to vector store:', err);
      return NextResponse.json({ error: 'Failed to add chunks to vector store' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      metadata: parsedPDF.metadata,
      chunks: chunks, // Return original chunks for UI display
      vectorStoreStats: globalVectorStore.getStats(),
      message: `Successfully processed ${chunks.length} chunks and generated embeddings`
    });
  } catch (error) {
    // Catch-all for unexpected errors
    console.error('Unexpected error processing PDF:', error);
    return NextResponse.json(
      { error: 'Unexpected error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}