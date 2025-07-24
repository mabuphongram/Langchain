'use client';

import { useState } from 'react';

interface SearchResult {
  content: string;
  similarity: number;
  metadata: {
    source: string;
    chunkIndex: number;
  };
}

interface EnhancedSearchInterfaceProps {
  hasDocuments: boolean;
}

export default function EnhancedSearchInterface({ hasDocuments }: EnhancedSearchInterfaceProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setSearchStatus('Please enter a search query');
      return;
    }

    if (!hasDocuments) {
      setSearchStatus('Please upload a PDF document first');
      return;
    }

    setIsSearching(true);
    setSearchStatus('Searching...');

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, k: 5 }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data.results || []);
      setSearchStatus(
        data.results?.length 
          ? `Found ${data.results.length} relevant chunks`
          : 'No relevant results found'
      );
      if (data.results?.length > 0) {
        setIsExpanded(true);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchStatus('Error performing search');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Semantic Search</h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>
      
      {isExpanded && (
        <>
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for specific content..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSearching || !hasDocuments}
              />
              <button
                type="submit"
                disabled={isSearching || !hasDocuments || !query.trim()}
                className={`px-6 py-2 text-white font-medium rounded-md ${
                  isSearching || !hasDocuments || !query.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          {searchStatus && (
            <p className={`mb-4 text-sm ${
              searchStatus.includes('Error') ? 'text-red-600' : 'text-green-600'
            }`}>
              {searchStatus}
            </p>
          )}

          {results.length > 0 && (
            <div className="space-y-4 max-h-64 overflow-y-auto">
              <h3 className="text-lg font-semibold">Search Results</h3>
              {results.map((result, index) => (
                <div key={index} className="p-4 border rounded-lg bg-blue-50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-blue-600">
                      Chunk {result.metadata.chunkIndex + 1}
                    </span>
                    <span className="text-xs text-gray-500">
                      Similarity: {(result.similarity * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">
                    {result.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}