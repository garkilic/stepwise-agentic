import { ReactNode } from 'react';

interface ChatMessageProps {
  type: 'user' | 'assistant';
  content: ReactNode;
  timestamp?: string;
  onEdit?: () => void;
  isEditable?: boolean;
}

export default function ChatMessage({ 
  type, 
  content, 
  timestamp, 
  onEdit,
  isEditable = false 
}: ChatMessageProps) {
  return (
    <div className={`flex ${type === 'user' ? 'justify-end' : 'justify-start'} mb-6 group`}>
      <div className="flex gap-4 max-w-3xl">
        {type === 'assistant' && (
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        <div className="flex-1">
          <div
            className={`
              rounded-2xl p-4 relative
              ${type === 'user' 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-gray-800 text-gray-100 shadow-md border border-gray-700'
              }
              transition-all duration-200 ease-in-out
              hover:shadow-xl
            `}
          >
            <div className="prose prose-sm max-w-none prose-invert">
              {content}
            </div>
            
            <div className="flex items-center justify-between mt-2">
              {timestamp && (
                <div className={`text-xs ${type === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                  {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
              
              {isEditable && type === 'user' && (
                <button
                  onClick={onEdit}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200
                    text-xs text-blue-100 hover:text-white ml-2 px-2 py-1 rounded
                    hover:bg-blue-500/50"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>

        {type === 'user' && (
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
} 