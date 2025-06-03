import React from 'react';
import { Process, Step } from '@/types/process';

interface ProcessReviewProps {
  process: Process;
  onApprove: () => void;
  onEdit: (p: Process) => void;
  onBack: () => void;
}

export default function ProcessReview({ process, onApprove, onBack }: ProcessReviewProps) {
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
      <div className="w-full max-w-2xl bg-gray-800 rounded-xl p-8 border border-gray-700 mb-8">
        <h2 className="text-3xl font-bold mb-4">Review Your Process</h2>
        <div className="mb-6">
          <div className="text-lg font-semibold text-blue-200 mb-2">{process.title}</div>
          <div className="text-gray-300 whitespace-pre-wrap">{process.description}</div>
        </div>
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Steps</h3>
          {process.steps.length === 0 ? (
            <div className="text-gray-500">(No steps generated yet.)</div>
          ) : (
            <ol className="list-decimal list-inside space-y-2">
              {process.steps.map((step: Step, idx: number) => (
                <li key={step.id} className="text-gray-200">{step.title}</li>
              ))}
            </ol>
          )}
        </div>
        <div className="flex gap-4">
          <button
            className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
            onClick={onApprove}
          >
            Looks Good!
          </button>
          {/* Optionally add edit functionality here */}
        </div>
      </div>
    </div>
  );
} 