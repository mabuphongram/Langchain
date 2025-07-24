import { GoogleGenerativeAI } from '@google/generative-ai';
import { EmbeddingService } from './embedding-service';
import { globalVectorStore } from './memory-vector-store';
import { ChatMessage, QAChainOptions } from '@/types';

export class QAChain {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private embeddingService: EmbeddingService;
  private conversationHistory: ChatMessage[] = [];

  constructor(apiKey: string, options: QAChainOptions = {}) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxTokens || 2048,
        topK: options.topK || 40,
      }
    });
    this.embeddingService = new EmbeddingService(apiKey);
  }

  async askQuestion(question: string): Promise<ChatMessage> {
    try {
      // Check if vector store has content
      if (globalVectorStore.chunks.length === 0) {
        const response: ChatMessage = {
          id: this.generateId(),
          role: 'assistant',
          content: 'I don\'t have any documents to search through. Please upload a PDF document first.',
          timestamp: new Date(),
          sources: []
        };
        return response;
      }

      // Generate embedding for the question
      const questionEmbedding = await this.embeddingService.generateEmbedding(question);

      // Retrieve relevant chunks
      const relevantChunks = globalVectorStore.similaritySearch(questionEmbedding, 5);

      // Format context from relevant chunks
      const context = relevantChunks
        .map((result, index) => `Context ${index + 1} (Similarity: ${(result.similarity * 100).toFixed(1)}%):\n${result.chunk.content}`)
        .join('\n\n');

      // Build conversation history for context
      const conversationContext = this.conversationHistory
        .slice(-6) // Last 3 exchanges (6 messages)
        .map(msg => `${msg.role === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`)
        .join('\n');

      // Create the prompt
      const prompt = this.buildPrompt(question, context, conversationContext);

      // Generate response
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();

      // Create response message
      const response: ChatMessage = {
        id: this.generateId(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
        sources: relevantChunks.map(result => ({
          content: result.chunk.content.substring(0, 200) + '...',
          similarity: result.similarity,
          chunkIndex: result.chunk.metadata.chunkIndex
        }))
      };

      // Add to conversation history
      const userMessage: ChatMessage = {
        id: this.generateId(),
        role: 'user',
        content: question,
        timestamp: new Date()
      };

      this.conversationHistory.push(userMessage, response);

      // Keep conversation history manageable
      if (this.conversationHistory.length > 20) {
        this.conversationHistory = this.conversationHistory.slice(-20);
      }

      return response;

    } catch (error) {
      console.error('Error in QA chain:', error);
      throw new Error('Failed to generate response: ' + (error as Error).message);
    }
  }

  private buildPrompt(question: string, context: string, conversationHistory: string): string {
    return `You are a helpful AI assistant that answers questions based on the provided document context. 

INSTRUCTIONS:
- Answer the question using ONLY the information provided in the context below
- If the context doesn't contain enough information to answer the question, say so clearly
- Be concise but comprehensive in your answers
- Reference specific parts of the context when relevant
- If there's conversation history, consider it for context but prioritize the current question

CONVERSATION HISTORY:
${conversationHistory || 'No previous conversation.'}

DOCUMENT CONTEXT:
${context}

CURRENT QUESTION: ${question}

ANSWER:`;
  }

  async streamResponse(question: string): Promise<ReadableStream<string>> {
    // For streaming implementation (optional enhancement)
    return new ReadableStream({
      start: async (controller) => {
        try {
          const response = await this.askQuestion(question);
          controller.enqueue(response.content);
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });
  }

  getConversationHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

// Global instance
let qaChainInstance: QAChain | null = null;

export function getQAChain(apiKey: string): QAChain {
  if (!qaChainInstance) {
    qaChainInstance = new QAChain(apiKey);
  }
  return qaChainInstance;
}