import { useState } from 'react';
import { Process } from '@/types/process';

interface InitialPromptProps {
  onComplete: (process: Process) => void;
}

export default function InitialPrompt({ onComplete }: InitialPromptProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      const now = new Date().toISOString();
      onComplete({
        id: Date.now().toString(),
        title: input.trim().slice(0, 60),
        description: input.trim(),
        steps: [],
        currentStepId: null,
        status: 'draft',
        createdAt: now,
        updatedAt: now,
      });
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-900 text-gray-100 min-h-screen w-screen">
      <h2 className="text-3xl font-bold mb-8">Describe Your Process</h2>
      <form onSubmit={handleSubmit} className="w-full max-w-xl flex flex-col gap-4">
        <textarea
          className="w-full p-4 rounded-xl bg-gray-800 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px] resize-none"
          placeholder="Describe your process..."
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
        >
          Continue
        </button>
      </form>
    </div>
  );
} 