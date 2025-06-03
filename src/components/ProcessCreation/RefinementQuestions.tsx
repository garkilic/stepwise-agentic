import { useState, useRef, useEffect } from 'react';
import { Process } from '@/types/process';
import Card from '../common/Card';
import ChatMessage from '../common/ChatMessage';
import ChatInput from '../common/ChatInput';

interface RefinementQuestionsProps {
  process: Process;
  onComplete: (process: Process) => void;
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface SavedInfo {
  id: string;
  title: string;
  content: string;
  timestamp: string;
}

export default function RefinementQuestions({ process, onComplete }: RefinementQuestionsProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [savedInfo, setSavedInfo] = useState<SavedInfo[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add initial assistant message
    setMessages([
      {
        id: '1',
        type: 'assistant',
        content: `I'll help you refine your process: "${process.description}". Let's make it more specific and actionable. What aspects would you like to clarify or improve?`,
        timestamp: new Date().toISOString()
      }
    ]);
  }, [process]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (editingMessageId) {
      // Update existing message
      setMessages(prev => prev.map(msg => 
        msg.id === editingMessageId 
          ? { ...msg, content, timestamp: new Date().toISOString() }
          : msg
      ));
      setEditingMessageId(null);
    } else {
      // Add new message
      const userMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, userMessage]);
    }

    setIsLoading(true);

    try {
      // TODO: Replace with actual API call to LLM
      // Simulating LLM response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const suggestions = [
        "Consider adding specific timeframes for each step",
        "What resources will you need for this process?",
        "How will you measure success at each step?",
        "Are there any potential roadblocks to consider?"
      ];

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Here are some suggestions to improve your process:\n\n${suggestions.map(s => `• ${s}`).join('\n')}\n\nWould you like to address any of these points or discuss something else?`,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Save important information
      if (content.length > 20) { // Only save substantial responses
        setSavedInfo(prev => [...prev, {
          id: Date.now().toString(),
          title: content.slice(0, 50) + '...',
          content,
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('Error getting suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditMessage = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      setEditingMessageId(messageId);
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
  };

  const handleComplete = () => {
    const updatedProcess: Process = {
      ...process,
      description: `${process.description}\n\nRefined Details:\n${messages
        .filter(m => m.type === 'user')
        .map(m => m.content)
        .join('\n')}`,
      updatedAt: new Date().toISOString()
    };
    
    onComplete(updatedProcess);
  };

  return (
    <div className="fixed inset-0 flex bg-gray-900 overflow-hidden w-screen h-screen">
      {/* Sidebar */}
      <div className={`${showSidebar ? 'w-80' : 'w-0'} transition-all duration-300 ease-in-out overflow-hidden bg-gray-800 border-r border-gray-700 h-screen`}>
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-gray-100">Saved Information</h3>
        </div>
        <div className="overflow-y-auto h-[calc(100vh-64px)]">
          {savedInfo.map(info => (
            <div key={info.id} className="p-4 border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
              <h4 className="font-medium text-gray-100 mb-1">{info.title}</h4>
              <p className="text-sm text-gray-300">{info.content}</p>
              <div className="text-xs text-gray-400 mt-2">
                {new Date(info.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Header */}
        <div className="h-16 border-b border-gray-700 bg-gray-800 flex items-center justify-between px-4">
          <h2 className="text-xl font-semibold text-gray-100">Process Refinement</h2>
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-gray-900 p-4 h-[calc(100vh-64px)]">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map(message => (
              <ChatMessage
                key={message.id}
                type={message.type}
                content={message.content}
                timestamp={message.timestamp}
                isEditable={message.type === 'user'}
                onEdit={() => handleEditMessage(message.id)}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-700 bg-gray-800">
          <div className="max-w-3xl mx-auto">
            <ChatInput
              onSend={handleSendMessage}
              placeholder="Type your message..."
              disabled={isLoading}
              initialValue={editingMessageId ? messages.find(m => m.id === editingMessageId)?.content : ''}
              onCancel={editingMessageId ? handleCancelEdit : undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 