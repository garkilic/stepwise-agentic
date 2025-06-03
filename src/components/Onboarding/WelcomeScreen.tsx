import React from 'react';

interface WelcomeScreenProps {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-900 text-gray-100 w-screen h-screen">
      <h1 className="text-4xl font-bold mb-6">Welcome to Stepwise Agentic!</h1>
      <p className="text-lg mb-8 max-w-xl text-center text-gray-300">
        We'll work with you to craft the perfect prompt for your process. This prompt will be the foundation for your step-by-step workflow. Let's collaborate to make your process as effective as possible!
      </p>
      <button
        className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg transition-colors shadow-lg"
        onClick={onStart}
      >
        Get Started
      </button>
    </div>
  );
} 