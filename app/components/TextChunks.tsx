'use client';

import { TextChunk } from '@/types';

interface TextChunksProps {
  chunks: TextChunk[];
}

export default function TextChunks({ chunks }: TextChunksProps) {
  if (chunks.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Text Chunks ({chunks.length})</h2>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {chunks.map((chunk) => (
          <div key={chunk.id} className="p-4 border rounded-lg bg-gray-50">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium text-blue-600">
                Chunk {chunk.metadata.chunkIndex + 1}
              </span>
              <span className="text-xs text-gray-500">
                {chunk.content.length} chars
              </span>
            </div>
            <p className="text-sm text-gray-700 line-clamp-3">
              {chunk.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}