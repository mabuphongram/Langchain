import pdf from 'pdf-parse';
import { ParsedPDF } from '@/types';

export async function parsePDF(buffer: Buffer, filename: string): Promise<ParsedPDF> {
  try {
    const data = await pdf(buffer);
    
    return {
      text: data.text,
      metadata: {
        filename,
        pages: data.numpages,
        size: buffer.length
      }
    };
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF file');
  }
}

export function cleanText(text: string): string {
  // Remove excessive whitespace and normalize line breaks
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();
}