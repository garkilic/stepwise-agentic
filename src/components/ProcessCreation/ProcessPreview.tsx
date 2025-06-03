import { Process } from '@/types/process';

interface ProcessPreviewProps {
  process: Process;
  onStart: () => void;
}

export default function ProcessPreview({ process, onStart }: ProcessPreviewProps) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-900 text-gray-100 min-h-screen w-screen">
      <h2 className="text-3xl font-bold mb-8">Process Preview</h2>
      <div className="w-full max-w-xl bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
        <pre className="whitespace-pre-wrap text-gray-200">{process.description}</pre>
      </div>
      <button
        onClick={onStart}
        className="w-full max-w-xl py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
      >
        Start Execution
      </button>
    </div>
  );
} 