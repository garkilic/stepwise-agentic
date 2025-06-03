interface StepProgressProps {
  totalSteps: number;
  completedSteps: number;
}

export default function StepProgress({ totalSteps, completedSteps }: StepProgressProps) {
  const progress = (completedSteps / totalSteps) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-gray-600">
        <span>Progress</span>
        <span>{completedSteps} of {totalSteps} steps completed</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
} 