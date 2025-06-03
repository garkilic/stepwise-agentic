'use client';

import { useState } from 'react';
import { WelcomeScreen, PromptRefinementChat, ProcessGeneration, ProcessReview } from '@/components/Onboarding';
import StepwiseExecution from '@/components/StepExecution/StepExecution';
import { Process } from '@/types/process';

type Phase = 'welcome' | 'refinement' | 'generating' | 'review' | 'execution';

export default function Home() {
  const [phase, setPhase] = useState<Phase>('welcome');
  const [prompt, setPrompt] = useState('');
  const [process, setProcess] = useState<Process | null>(null);

  const handleBack = () => {
    switch (phase) {
      case 'refinement':
        setPhase('welcome');
        break;
      case 'generating':
        setPhase('refinement');
        break;
      case 'review':
        setPhase('generating');
        break;
      case 'execution':
        setPhase('review');
        break;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 text-gray-100 w-screen h-screen">
      {phase === 'welcome' && (
        <WelcomeScreen onStart={() => setPhase('refinement')} />
      )}
      {phase === 'refinement' && (
        <PromptRefinementChat
          prompt={prompt}
          setPrompt={setPrompt}
          onComplete={() => setPhase('generating')}
          onBack={handleBack}
        />
      )}
      {phase === 'generating' && (
        <ProcessGeneration
          prompt={prompt}
          onGenerated={(proc: Process) => { setProcess(proc); setPhase('review'); }}
          onBack={handleBack}
        />
      )}
      {phase === 'review' && process && (
        <ProcessReview
          process={process}
          onApprove={() => setPhase('execution')}
          onEdit={setProcess}
          onBack={handleBack}
        />
      )}
      {phase === 'execution' && process && (
        <StepwiseExecution process={process} onUpdate={setProcess} />
      )}
    </div>
  );
}
