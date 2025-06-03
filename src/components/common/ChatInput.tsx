import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import Button from './Button';

interface ChatInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  initialValue?: string;
  onCancel?: () => void;
}

export default function ChatInput({ 
  onSend, 
  placeholder = 'Type your message...', 
  disabled = false,
  initialValue = '',
  onCancel
}: ChatInputProps) {
  const [message, setMessage] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative bg-gray-800 border-t border-gray-700 p-3">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-end">
          <textarea
            ref={textareaRef}
            className="flex-1 p-2 border border-gray-700 rounded-l-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
              text-gray-100 placeholder-gray-400 resize-none bg-gray-900 text-sm
              transition-all duration-200 ease-in-out
              hover:bg-gray-800 focus:bg-gray-800"
            placeholder={placeholder}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={1}
            disabled={disabled}
            style={{ minHeight: '32px', borderRight: 'none' }}
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || disabled}
            className="h-[40px] px-4 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white border border-gray-700 border-l-0 rounded-r-xl transition-colors disabled:opacity-50"
            style={{ minHeight: '32px' }}
            type="button"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={disabled}
              className="ml-2 bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white"
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 