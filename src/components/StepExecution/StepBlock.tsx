import { Step } from '@/types/process';
import Card from '../common/Card';
import Button from '../common/Button';

interface StepBlockProps {
  step: Step;
  isActive: boolean;
  onHumanInput: (input: string) => void;
}

export default function StepBlock({ step, isActive, onHumanInput }: StepBlockProps) {
  const statusColors = {
    completed: 'bg-green-100 text-green-800',
    in_progress: 'bg-blue-100 text-blue-800',
    waiting_for_human: 'bg-yellow-100 text-yellow-800',
    pending: 'bg-gray-100 text-gray-800',
  };

  return (
    <Card
      className={`
        transition-all duration-200
        ${isActive ? 'border-blue-500 bg-blue-50' : ''}
        ${step.status === 'completed' ? 'opacity-75' : ''}
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
        <span className={`
          px-3 py-1 rounded-full text-sm
          ${statusColors[step.status]}
        `}>
          {step.status.replace('_', ' ')}
        </span>
      </div>
      
      <p className="text-gray-600 mb-4">{step.description}</p>
      
      {step.estimatedTime && (
        <p className="text-sm text-gray-500 mb-4">
          Estimated time: {step.estimatedTime}
        </p>
      )}
      
      {step.humanInteractionRequired && step.status === 'waiting_for_human' && (
        <div className="mt-4 space-y-4">
          <textarea
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your input here..."
            value={step.humanInput || ''}
            onChange={(e) => onHumanInput(e.target.value)}
            rows={4}
          />
          <Button
            onClick={() => onHumanInput(step.humanInput || '')}
            disabled={!step.humanInput}
          >
            Submit
          </Button>
        </div>
      )}
    </Card>
  );
} 