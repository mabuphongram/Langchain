'use client';

interface VectorStoreStatsProps {
  stats?: {
    totalChunks: number;
    embeddingDimension: number;
  };
}

export default function VectorStoreStats({ stats }: VectorStoreStatsProps) {
  if (!stats || stats.totalChunks === 0) {
    return null;
  }

  return (
    <div className="mt-4 p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Vector Store Status</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium">Total Chunks:</span>
          <span className="ml-2 text-blue-600">{stats.totalChunks}</span>
        </div>
        <div>
          <span className="font-medium">Embedding Dimension:</span>
          <span className="ml-2 text-blue-600">{stats.embeddingDimension}</span>
        </div>
      </div>
    </div>
  );
}