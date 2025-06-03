import React, { useState, useRef, useEffect } from 'react';

interface PromptRefinementChatProps {
  prompt: string;
  setPrompt: (p: string) => void;
  onComplete: () => void;
  onBack: () => void;
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function PromptRefinementChat({ prompt, setPrompt, onComplete, onBack }: PromptRefinementChatProps) {
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    type: 'assistant',
    content: `Let's work together to craft your process prompt. What do you want to accomplish?`,
    timestamp: new Date().toISOString()
  }]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (content: string, type: 'user' | 'assistant') => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        type,
        content,
        timestamp: new Date().toISOString()
      }
    ]);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input, 'user');
    // Simulate AI refinement
    setTimeout(() => {
      const suggestion = `Great! Let's clarify: ${input} (AI might ask for more details here.)`;
      sendMessage(suggestion, 'assistant');
      setPrompt(input); // Update the prompt summary
    }, 600);
    setInput('');
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-900 text-gray-100 w-screen h-screen">
      <div className="w-full bg-gray-800 border-b border-gray-700 p-6 flex flex-col items-center">
        <div className="max-w-2xl w-full">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="flex items-center text-gray-400 hover:text-gray-200 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <div className="text-xs uppercase tracking-widest text-blue-400">Current Prompt</div>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-lg font-semibold text-blue-100 min-h-[48px]">
            {prompt || <span className="text-gray-500">(Your prompt will appear here as you refine it)</span>}
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center overflow-y-auto py-8">
        <div className="w-full max-w-2xl space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`rounded-xl px-4 py-3 max-w-[80%] shadow-md ${msg.type === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-100 border border-gray-700'}`}>
                <div>{msg.content}</div>
                <div className="text-xs mt-2 text-gray-400 text-right">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="w-full bg-gray-800 border-t border-gray-700 p-4 flex items-center justify-center">
        <div className="max-w-2xl w-full flex gap-2">
          <div className="flex-1 flex">
            <input
              className="flex-1 p-3 rounded-xl bg-gray-900 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base outline-none"
              placeholder="Type your reply..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
            />
          </div>
          <button
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg transition-colors"
            onClick={handleSend}
          >
            Send
          </button>
          <button
            className="px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-lg transition-colors"
            onClick={onComplete}
            disabled={!prompt}
          >
            Use this prompt
          </button>
        </div>
      </div>
    </div>
  );
} 