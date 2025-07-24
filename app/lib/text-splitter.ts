import { TextChunk } from '@/types';

export interface TextSplitterOptions {
  chunkSize: number;
  chunkOverlap: number;
  separators?: string[];
}

export class TextSplitter {
  private chunkSize: number;
  private chunkOverlap: number;
  private separators: string[];

  constructor(options: TextSplitterOptions) {
    this.chunkSize = options.chunkSize;
    this.chunkOverlap = options.chunkOverlap;
    this.separators = options.separators || ['\n\n', '\n', '.', '!', '?', ' '];
  }

  splitText(text: string, source: string): TextChunk[] {
    const chunks: TextChunk[] = [];
    let chunkIndex = 0;

    // First, try to split by separators
    const initialSplits = this.splitBySeparators(text);
    
    // Then, ensure chunks don't exceed max size
    for (const split of initialSplits) {
      if (split.length <= this.chunkSize) {
        chunks.push({
          id: `${source}-chunk-${chunkIndex}`,
          content: split.trim(),
          metadata: {
            source,
            chunkIndex
          }
        });
        chunkIndex++;
      } else {
        // Split large chunks further
        const subChunks = this.splitLargeChunk(split);
        for (const subChunk of subChunks) {
          chunks.push({
            id: `${source}-chunk-${chunkIndex}`,
            content: subChunk.trim(),
            metadata: {
              source,
              chunkIndex
            }
          });
          chunkIndex++;
        }
      }
    }

    return this.addOverlap(chunks);
  }

  private splitBySeparators(text: string): string[] {
    let splits = [text];

    for (const separator of this.separators) {
      const newSplits: string[] = [];
      
      for (const split of splits) {
        if (split.length > this.chunkSize) {
          const parts = split.split(separator);
          newSplits.push(...parts);
        } else {
          newSplits.push(split);
        }
      }
      
      splits = newSplits;
    }

    return splits.filter(split => split.trim().length > 0);
  }

  private splitLargeChunk(chunk: string): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < chunk.length) {
      let end = start + this.chunkSize;
      
      if (end >= chunk.length) {
        chunks.push(chunk.slice(start));
        break;
      }

      // Try to end at a word boundary
      const lastSpace = chunk.lastIndexOf(' ', end);
      if (lastSpace > start) {
        end = lastSpace;
      }

      chunks.push(chunk.slice(start, end));
      start = end - this.chunkOverlap;
    }

    return chunks;
  }

  private addOverlap(chunks: TextChunk[]): TextChunk[] {
    if (chunks.length <= 1 || this.chunkOverlap === 0) {
      return chunks;
    }

    const overlappedChunks: TextChunk[] = [];

    for (let i = 0; i < chunks.length; i++) {
      let content = chunks[i].content;

      // Add overlap from previous chunk
      if (i > 0) {
        const prevChunk = chunks[i - 1].content;
        const overlapText = prevChunk.slice(-this.chunkOverlap);
        content = overlapText + ' ' + content;
      }

      overlappedChunks.push({
        ...chunks[i],
        content: content.trim()
      });
    }

    return overlappedChunks;
  }
}