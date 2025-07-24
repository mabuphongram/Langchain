'use client';

import { useState } from 'react';
import FileUpload from './components/FileUpload';
import TextChunks from './components/TextChunks';
import ChatInterface from './components/ChatInterface';
import EnhancedSearchInterface from './components/EnhancedSearchInterface';
import VectorStoreStats from './components/VectorStoreStats';
import { TextChunk } from '@/types';

export default function Home() {
  const [chunks, setChunks] = useState<TextChunk[]>([]);
  const [vectorStoreStats, setVectorStoreStats] = useState<{
    totalChunks: number;
    embeddingDimension: number;
  } | undefined>();
  const [activeTab, setActiveTab] = useState<'chat' | 'search' | 'chunks'>('chat');

  const handleChunksGenerated = (newChunks: TextChunk[], stats?: any) => {
    setChunks(newChunks);
    if (stats) {
      setVectorStoreStats(stats);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">
          PDF RAG System
        </h1>
        <p className="text-gray-600">
          Upload PDFs, ask questions, and get intelligent answers with source citations
        </p>
      </div>
      
      <div className="max-w-6xl mx-auto space-y-8">
        {/* File Upload Section */}
        <FileUpload onChunksGenerated={handleChunksGenerated} />
        
        {/* Vector Store Stats */}
        <VectorStoreStats stats={vectorStoreStats} />
        
        {/* Tabs */}
        {chunks.length > 0 && (
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'chat', label: 'Chat & QA', icon: '💬' },
                { id: 'search', label: 'Semantic Search', icon: '🔍' },
                { id: 'chunks', label: 'Document Chunks', icon: '📄' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        )}
        
        {/* Tab Content */}
        {activeTab === 'chat' && (
          <ChatInterface hasDocuments={chunks.length > 0} />
        )}
        
        {activeTab === 'search' && (
          <EnhancedSearchInterface hasDocuments={chunks.length > 0} />
        )}
        
        {activeTab === 'chunks' && (
          <TextChunks chunks={chunks} />
        )}
        
        {/* Initial State - No Documents */}
        {chunks.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Ready to Get Started?
            </h3>
            <p className="text-gray-600 mb-6">
              Upload a PDF document to begin asking questions and exploring its content with AI.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto text-sm">
              <div className="p-4 bg-white rounded-lg border">
                <div className="text-2xl mb-2">📄</div>
                <h4 className="font-medium">Upload PDF</h4>
                <p className="text-gray-500">Upload any PDF document</p>
              </div>
              <div className="p-4 bg-white rounded-lg border">
                <div className="text-2xl mb-2">🧠</div>
                <h4 className="font-medium">AI Processing</h4>
                <p className="text-gray-500">AI creates embeddings</p>
              </div>
              <div className="p-4 bg-white rounded-lg border">
                <div className="text-2xl mb-2">💬</div>
                <h4 className="font-medium">Ask Questions</h4>
                <p className="text-gray-500">Get intelligent answers</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}