export interface TextChunk {
  id: string;
  content: string;
  metadata: {
    source: string;
    page?: number;
    chunkIndex: number;
  };
}

export interface ParsedPDF {
  text: string;
  metadata: {
    filename: string;
    pages: number;
    size: number;
  };
}

export interface VectorizedChunk extends TextChunk {
  embedding: number[];
}

export interface SimilarityResult {
  chunk: VectorizedChunk;
  similarity: number;
}

export interface VectorStore {
  chunks: VectorizedChunk[];
  addChunks: (chunks: VectorizedChunk[]) => void;
  similaritySearch: (queryEmbedding: number[], k?: number) => SimilarityResult[];
  clear: () => void;
}

// New types for Day 3
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: {
    content: string;
    similarity: number;
    chunkIndex: number;
  }[];
}

export interface QAChainOptions {
  temperature?: number;
  maxTokens?: number;
  topK?: number;
}