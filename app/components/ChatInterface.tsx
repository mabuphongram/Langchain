'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '@/types';

interface ChatInterfaceProps {
  hasDocuments: boolean;
}

export default function ChatInterface({ hasDocuments }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSources, setShowSources] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    if (!hasDocuments) {
      alert('Please upload a PDF document first');
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: userMessage.content }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      setMessages(prev => [...prev, data.message]);

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your question. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSources = (messageId: string) => {
    setShowSources(showSources === messageId ? null : messageId);
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Ask Questions</h2>
      
      {/* Chat Messages */}
      <div className="h-96 overflow-y-auto border border-gray-300 rounded-lg p-4 mb-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            <p>Start a conversation by asking a question about your uploaded document.</p>
            <p className="text-sm mt-2">
              Try questions like: "What is this document about?" or "Summarize the main points"
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div key={message.id} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block max-w-3xl p-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-800 border border-gray-200'
                }`}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs mt-2 opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                
                {/* Sources for assistant messages */}
                {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                  <div className="mt-2">
                    <button
                      onClick={() => toggleSources(message.id)}
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      {showSources === message.id ? 'Hide Sources' : `Show Sources (${message.sources.length})`}
                    </button>
                    
                    {showSources === message.id && (
                      <div className="mt-2 space-y-2">
                        {message.sources.map((source, index) => (
                          <div key={index} className="text-xs bg-gray-100 p-2 rounded border-l-4 border-blue-400">
                            <div className="flex justify-between mb-1">
                              <span className="font-medium">Chunk {source.chunkIndex + 1}</span>
                              <span className="text-gray-600">
                                {(source.similarity * 100).toFixed(1)}% similarity
                              </span>
                            </div>
                            <p className="text-gray-700">{source.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="text-left mb-4">
                <div className="inline-block bg-white text-gray-800 border border-gray-200 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                    <span>Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={hasDocuments ? "Ask a question about your document..." : "Upload a PDF first..."}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading || !hasDocuments}
        />
        <button
          type="submit"
          disabled={isLoading || !hasDocuments || !inputValue.trim()}
          className={`px-6 py-2 text-white font-medium rounded-md ${
            isLoading || !hasDocuments || !inputValue.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>

      {/* Quick Questions */}
      {hasDocuments && messages.length === 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">Quick questions to try:</p>
          <div className="flex flex-wrap gap-2">
            {[
              "What is this document about?",
              "Summarize the main points",
              "What are the key findings?",
              "List the important details"
            ].map((question) => (
              <button
                key={question}
                onClick={() => setInputValue(question)}
                className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded-full"
                disabled={isLoading}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}