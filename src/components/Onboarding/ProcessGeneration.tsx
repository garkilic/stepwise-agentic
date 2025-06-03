import React, { useEffect } from 'react';
import { Process } from '@/types/process';

interface ProcessGenerationProps {
  prompt: string;
  onGenerated: (process: Process) => void;
  onBack: () => void;
}

export default function ProcessGeneration({ prompt, onGenerated, onBack }: ProcessGenerationProps) {
  useEffect(() => {
    const timeout = setTimeout(() => {
      const now = new Date().toISOString();
      onGenerated({
        id: Date.now().toString(),
        title: prompt.slice(0, 60),
        description: prompt + '\n\n(AI-generated steps would go here)',
        steps: [],
        currentStepId: null,
        status: 'draft',
        createdAt: now,
        updatedAt: now,
      });
    }, 1800);
    return () => clearTimeout(timeout);
  }, [prompt, onGenerated]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-900 text-gray-100 w-screen h-screen">
      <button
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center text-gray-400 hover:text-gray-200 transition-colors"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-8" />
      <h2 className="text-2xl font-bold mb-2">Creating your process...</h2>
      <p className="text-gray-400">Analyzing your prompt and generating actionable steps.</p>
    </div>
  );
} 