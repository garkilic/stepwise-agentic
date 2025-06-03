import { useState, useEffect } from 'react';
import { Process, Step } from '@/types/process';
import StepBlock from './StepBlock';
import StepProgress from './StepProgress';
import Card from '../common/Card';

interface StepExecutionProps {
  process: Process;
  onUpdate: (process: Process) => void;
}

export default function StepExecution({ process, onUpdate }: StepExecutionProps) {
  const [currentStep, setCurrentStep] = useState<Step | null>(null);

  useEffect(() => {
    if (process.currentStepId) {
      const step = process.steps.find(s => s.id === process.currentStepId);
      setCurrentStep(step || null);
    }
  }, [process.currentStepId, process.steps]);

  const handleHumanInput = (input: string) => {
    if (!currentStep) return;

    const updatedSteps = process.steps.map(step => 
      step.id === currentStep.id 
        ? { ...step, humanInput: input, status: 'completed' as const }
        : step
    );

    const nextStepId = currentStep.nextSteps[0];
    const updatedProcess: Process = {
      ...process,
      steps: updatedSteps,
      currentStepId: nextStepId,
      status: nextStepId ? 'in_progress' : 'completed',
      updatedAt: new Date().toISOString()
    };

    onUpdate(updatedProcess);
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-900 text-gray-100 min-h-screen w-screen">
      <h2 className="text-3xl font-bold mb-8">Step Execution</h2>
      <div className="w-full max-w-xl bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
        <pre className="whitespace-pre-wrap text-gray-200">{process.description}</pre>
      </div>
      <button
        onClick={() => onUpdate(process)}
        className="w-full max-w-xl py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
      >
        Mark as Complete
      </button>
    </div>
  );
} 