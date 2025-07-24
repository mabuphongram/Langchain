'use client';

import { useState } from 'react';
import { TextChunk } from '@/types';

interface FileUploadProps {
  onChunksGenerated: (chunks: TextChunk[], stats?: any) => void;
}

export default function FileUpload({ onChunksGenerated }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setUploadStatus('Please select a PDF file');
      return;
    }

    setIsUploading(true);
    setUploadStatus('Uploading and processing...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      onChunksGenerated(result.chunks, result.vectorStoreStats);
      setUploadStatus(`Successfully processed ${result.chunks.length} chunks and generated embeddings`);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('Error processing file: ' + (error as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = async () => {
    setIsClearing(true);
    try {
      const response = await fetch('/api/clear', {
        method: 'POST',
      });

      if (response.ok) {
        onChunksGenerated([], undefined);
        setUploadStatus('All data cleared');
      } else {
        throw new Error('Failed to clear data');
      }
    } catch (error) {
      console.error('Clear error:', error);
      setUploadStatus('Error clearing data');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg">
      <div className="text-center">
        <div className="flex justify-center gap-4">
          <div>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              disabled={isUploading || isClearing}
              className="hidden"
              id="pdf-upload"
            />
            <label
              htmlFor="pdf-upload"
              className={`cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                isUploading || isClearing
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isUploading ? 'Processing...' : 'Upload PDF'}
            </label>
          </div>
          
          <button
            onClick={handleClear}
            disabled={isClearing}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
              isClearing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isClearing ? 'Clearing...' : 'Clear Data'}
          </button>
        </div>
      </div>
    </div>
  );
}