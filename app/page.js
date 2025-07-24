'use client'
import { useState } from 'react';
import { askGenAI } from '@/lib/actions/ai';

export default function HomePage() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAnswer(''); // Clear previous answer
    
    const formData = new FormData(e.target);
    const result = await askGenAI(formData);
    
    setAnswer(result.answer || result.error);
    setLoading(false);
  };

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Ask GenAI (Server Action)</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          name="question"
          rows="4"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          style={{ width: '100%', padding: '1rem', marginBottom: '1rem' }}
          placeholder="Ask something..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !question.trim()}>
          {loading ? 'Asking...' : 'Ask'}
        </button>
      </form>
      <div style={{ marginTop: '1rem' }}>
        <strong>Answer:</strong>
        <p style={{ whiteSpace: 'pre-wrap' }}>{answer}</p>
      </div>
    </main>
  );
}