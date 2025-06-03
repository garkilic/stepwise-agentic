export interface Step {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'waiting_for_human';
  humanInteractionRequired: boolean;
  humanInput?: string;
  nextSteps: string[]; // IDs of next steps
  estimatedTime?: string;
}

export interface Process {
  id: string;
  title: string;
  description: string;
  steps: Step[];
  currentStepId: string | null;
  status: 'draft' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
} 