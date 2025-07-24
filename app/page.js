'use client';

import { useState, useTransition } from 'react';
import { askDocQuestion } from './actions';

export default function Home() {
  const [input, setInput] = useState('');
  const [chat, setChat] = useState([]);
  const [isPending, startTransition] = useTransition();

  const handleAsk = () => {
    if (!input.trim()) return;
    const userMessage = input;
    setChat((prev) => [...prev, { type: 'user', text: userMessage }]);
    setInput('');

    startTransition(async () => {
      const response = await askDocQuestion(userMessage);
      // Ensure response is always a string
      const responseText = typeof response === 'string' ? response : JSON.stringify(response);
      setChat((prev) => [...prev, { type: 'bot', text: responseText }]);
    });
  };

  return (
    <main style={{ padding: 20 }}>
      <h1>📚 Ask Your Document</h1>

      <div style={{ border: '1px solid #ddd', padding: 10, minHeight: 150, marginBottom: 10 }}>
        {chat.map((msg, i) => (
          <p key={i} style={{ color: msg.type === 'user' ? '#000' : '#0070f3' }}>
            <strong>{msg.type === 'user' ? 'You' : 'Bot'}:</strong> {msg.text}
          </p>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask about the document..."
        style={{ width: '100%', marginBottom: 10 }}
        onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
      />
      <button onClick={handleAsk} disabled={isPending}>
        {isPending ? 'Thinking...' : 'Ask'}
      </button>
    </main>
  );
}