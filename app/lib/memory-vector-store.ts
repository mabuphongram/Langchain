import { cosine } from 'ml-distance/lib/similarities';
import { VectorizedChunk, SimilarityResult, VectorStore } from '@/types';

export class MemoryVectorStore implements VectorStore {
  public chunks: VectorizedChunk[] = [];

  addChunks(chunks: VectorizedChunk[]): void {
    this.chunks.push(...chunks);
    console.log(`Added ${chunks.length} chunks to vector store. Total: ${this.chunks.length}`);
  }

  similaritySearch(queryEmbedding: number[], k: number = 5): SimilarityResult[] {
    if (this.chunks.length === 0) {
      return [];
    }

    // Calculate cosine similarity for each chunk
    const similarities: SimilarityResult[] = this.chunks.map(chunk => {
      const similarity = 1 - cosine(queryEmbedding, chunk.embedding);
      return {
        chunk,
        similarity: isNaN(similarity) ? 0 : similarity
      };
    });

    // Sort by similarity (highest first) and return top k
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, k);
  }

  clear(): void {
    this.chunks = [];
    console.log('Vector store cleared');
  }

  getStats() {
    return {
      totalChunks: this.chunks.length,
      embeddingDimension: this.chunks.length > 0 ? this.chunks[0].embedding.length : 0
    };
  }
}

// Global instance for the app
export const globalVectorStore = new MemoryVectorStore();