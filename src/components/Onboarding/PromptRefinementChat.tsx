import React, { useState, useRef, useEffect } from 'react';
import { refinePrompt, getClarificationQuestions, ChatMessage, ChatRole } from '@/services/ai';

interface PromptRefinementChatProps {
  prompt: string;
  setPrompt: (p: string) => void;
  onComplete: () => void;
  onBack: () => void;
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  rationale?: string;
  enhancedPrompt?: string;
}

function parseBestPrompt(content: string): { rationale: string; enhancedPrompt: string } {
  // Try to robustly extract rationale and enhanced prompt
  let rationale = '';
  let enhancedPrompt = '';
  const rationaleMatch = content.match(/RATIONALE\n-([\s\S]*?)(?=\nENHANCED PROMPT|$)/i);
  const enhancedMatch = content.match(/ENHANCED PROMPT\n-([\s\S]*)/i);
  if (rationaleMatch) {
    rationale = rationaleMatch[1].trim();
  } else {
    // Try to find a paragraph before ENHANCED PROMPT
    const fallback = content.split(/ENHANCED PROMPT/i)[0];
    if (fallback) rationale = fallback.trim();
  }
  if (enhancedMatch) {
    enhancedPrompt = enhancedMatch[1].trim();
  } else {
    // Try to find the last paragraph
    const lines = content.split(/\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length > 0) enhancedPrompt = lines[lines.length - 1];
  }
  return { rationale, enhancedPrompt };
}

type Phase = 'initial' | 'clarify' | 'final';

export default function PromptRefinementChat({ prompt, setPrompt, onComplete, onBack }: PromptRefinementChatProps) {
  const [phase, setPhase] = useState<Phase>('initial');
  const [messages, setMessages] = useState<Message[]>([{
    id: `${Date.now()}-init`,
    type: 'assistant',
    content: `Share your process idea, and I'll help clarify and refine it into the best possible prompt.`,
    timestamp: new Date().toISOString(),
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [clarifyQuestions, setClarifyQuestions] = useState<string[]>([]);
  const [clarifyAnswers, setClarifyAnswers] = useState<string[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [finalizedPrompt, setFinalizedPrompt] = useState<{ rationale: string; enhancedPrompt: string } | null>(null);
  const [showFullPrompt, setShowFullPrompt] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [initialIdea, setInitialIdea] = useState('');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, finalizedPrompt, clarifyQuestions, currentQuestionIdx]);

  // Initial idea submit
  const handleInitialSubmit = async () => {
    if (!input.trim() || isLoading) return;
    setError(null);
    const idea = input.trim();
    setInitialIdea(idea);
    setInput('');
    sendMessage(idea, 'user');
    setIsLoading(true);
    try {
      const questions = await getClarificationQuestions(idea);
      if (!questions.length) {
        setError('Sorry, the AI did not return any clarifying questions. Please try again.');
        setIsLoading(false);
        return;
      }
      setClarifyQuestions(questions);
      setClarifyAnswers([]);
      setCurrentQuestionIdx(0);
      setPhase('clarify');
      sendMessage('Here are some clarifying questions to help refine your process.', 'assistant');
    } catch (err) {
      setError('Failed to get clarifying questions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Clarification Q&A
  const handleClarifyAnswer = async () => {
    if (!input.trim() || isLoading) return;
    setError(null);
    const answer = input.trim();
    setInput('');
    sendMessage(clarifyQuestions[currentQuestionIdx], 'assistant');
    sendMessage(answer, 'user');
    setClarifyAnswers(prev => [...prev, answer]);
    if (currentQuestionIdx + 1 < clarifyQuestions.length) {
      setCurrentQuestionIdx(idx => idx + 1);
    } else {
      // All questions answered, move to final phase
      setPhase('final');
      setIsLoading(true);
      try {
        // Compose a summary for the LLM
        const summary = `Process Idea: ${initialIdea}\n\nClarifying Questions and Answers:\n` + clarifyQuestions.map((q, i) => `Q: ${q}\nA: ${clarifyAnswers[i] || answer}`).join('\n');
        const chatMessages: ChatMessage[] = [
          { role: 'user', content: summary }
        ];
        const response = await refinePrompt(chatMessages);
        const { rationale, enhancedPrompt } = parseBestPrompt(response);
        if (!rationale && !enhancedPrompt) {
          setError('Sorry, the AI did not return a valid rationale or prompt. Please try again.');
        }
        sendMessage('', 'assistant', rationale, enhancedPrompt);
        setFinalizedPrompt({ rationale, enhancedPrompt });
        setPrompt(enhancedPrompt);
      } catch (error) {
        setError('Failed to get the final prompt. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Utility
  const sendMessage = (content: string, type: 'user' | 'assistant', rationale?: string, enhancedPrompt?: string) => {
    setMessages(prev => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type,
        content,
        timestamp: new Date().toISOString(),
        rationale,
        enhancedPrompt,
      }
    ]);
  };

  // Allow user to edit, retry, or start over
  const handleEditPrompt = () => {
    setInput(finalizedPrompt?.enhancedPrompt || '');
    setFinalizedPrompt(null);
    setShowFullPrompt(false);
    setPhase('initial');
  };
  const handleTryAgain = () => {
    setFinalizedPrompt(null);
    setShowFullPrompt(false);
    setInput('');
    setPhase('initial');
  };
  const handleStartOver = () => {
    setMessages([{
      id: `${Date.now()}-init`,
      type: 'assistant',
      content: `Share your process idea, and I'll help clarify and refine it into the best possible prompt.`,
      timestamp: new Date().toISOString(),
    }]);
    setInput('');
    setFinalizedPrompt(null);
    setShowFullPrompt(false);
    setError(null);
    setPrompt('');
    setPhase('initial');
    setClarifyQuestions([]);
    setClarifyAnswers([]);
    setCurrentQuestionIdx(0);
    setInitialIdea('');
  };

  // Condensed prompt logic
  const condensedPrompt = finalizedPrompt
    ? finalizedPrompt.enhancedPrompt.length > 120
      ? finalizedPrompt.enhancedPrompt.slice(0, 120) + '...'
      : finalizedPrompt.enhancedPrompt
    : prompt.length > 120
      ? prompt.slice(0, 120) + '...'
      : prompt;

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-900 text-gray-100 w-screen h-screen">
      <div className="w-full bg-gray-800 border-b border-gray-700 p-6 flex flex-col items-center">
        <div className="max-w-2xl w-full">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="flex items-center text-gray-400 hover:text-gray-200 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <div className="text-xs uppercase tracking-widest text-blue-400">Current Prompt</div>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-lg font-semibold text-blue-100 min-h-[48px] flex items-center justify-between overflow-hidden">
            <div className="flex-1 min-w-0">
              {showFullPrompt && finalizedPrompt ? (
                <span className="whitespace-pre-wrap break-words">{finalizedPrompt.enhancedPrompt}</span>
              ) : (
                <span className="truncate block whitespace-nowrap overflow-hidden text-ellipsis">{condensedPrompt || <span className="text-gray-500">(Your prompt will appear here as you refine it)</span>}</span>
              )}
            </div>
            {finalizedPrompt && finalizedPrompt.enhancedPrompt.length > 120 && (
              <button
                className="ml-4 text-blue-400 hover:text-blue-200 text-sm font-semibold focus:outline-none shrink-0"
                onClick={() => setShowFullPrompt(v => !v)}
              >
                {showFullPrompt ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center overflow-y-auto py-8">
        <div className="w-full max-w-2xl space-y-4">
          {error && (
            <div className="w-full bg-red-800 border border-red-500 rounded-xl p-4 text-red-200 font-semibold text-center">
              {error}
            </div>
          )}
          {phase === 'clarify' && clarifyQuestions.length > 0 && (
            <div className="w-full bg-gray-800 border border-blue-500 rounded-xl p-6 shadow-md flex flex-col">
              <div className="mb-4 text-blue-300 font-bold text-lg">Clarification</div>
              <div className="mb-2 text-base text-gray-200">{clarifyQuestions[currentQuestionIdx]}</div>
              <input
                className="w-full mt-2 p-3 rounded-xl bg-gray-900 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base outline-none"
                placeholder="Type your answer..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleClarifyAnswer(); } }}
                disabled={isLoading}
                autoFocus
              />
              <button
                className="mt-4 w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleClarifyAnswer}
                disabled={isLoading || !input.trim()}
              >
                {currentQuestionIdx + 1 < clarifyQuestions.length ? 'Next' : 'Finish'}
              </button>
            </div>
          )}
          {phase === 'final' && finalizedPrompt ? (
            <div className="w-full bg-gray-800 border border-green-500 rounded-xl p-6 shadow-md flex flex-col">
              <div className="mb-4">
                <div className="text-blue-400 font-bold mb-2">Rationale</div>
                <div className="text-base text-gray-200 whitespace-pre-wrap mb-4 max-w-full break-words">{finalizedPrompt.rationale || <span className="italic text-gray-400">(No rationale returned)</span>}</div>
                <div className="text-blue-400 font-bold mb-2">Enhanced Prompt</div>
                <div className="whitespace-pre-wrap text-base text-blue-100 mb-2 max-w-full break-words">{finalizedPrompt.enhancedPrompt || <span className="italic text-gray-400">(No prompt returned)</span>}</div>
              </div>
              <div className="flex flex-col md:flex-row gap-2 mt-4">
                <button
                  className="w-full py-2 px-4 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg transition-colors"
                  onClick={handleEditPrompt}
                >
                  Edit Prompt
                </button>
                <button
                  className="w-full py-2 px-4 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-lg transition-colors"
                  onClick={handleTryAgain}
                >
                  Try Again
                </button>
                <button
                  className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-800 text-gray-200 font-semibold rounded-lg transition-colors"
                  onClick={handleStartOver}
                >
                  Start Over
                </button>
              </div>
            </div>
          ) : null}
          {phase === 'initial' && (
            messages.map(msg => (
              <React.Fragment key={msg.id}>
                <div className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`rounded-xl px-4 py-3 max-w-[80%] shadow-md ${msg.type === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-100 border border-gray-700'}`}>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    <div className="text-xs mt-2 text-gray-400 text-right">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              </React.Fragment>
            ))
          )}
          {isLoading && (
            <div className="flex justify-center py-8">
              <div className="flex items-end gap-2">
                <div className="w-4 h-4 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-4 h-4 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-4 h-4 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                <div className="w-4 h-4 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '450ms' }} />
                <div className="ml-4 text-2xl animate-spin-slow">⚡️</div>
              </div>
              <style jsx>{`
                @keyframes spin-slow {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                  animation: spin-slow 2s linear infinite;
                }
              `}</style>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="w-full bg-gray-800 border-t border-gray-700 p-4 flex items-center justify-center">
        <div className="max-w-2xl w-full flex gap-2">
          <div className="flex-1 flex">
            <input
              className="flex-1 p-3 rounded-xl bg-gray-900 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base outline-none"
              placeholder={phase === 'clarify' && clarifyQuestions.length > 0 ? 'Type your answer...' : 'Share your process idea...'}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (phase === 'initial') handleInitialSubmit();
                  else if (phase === 'clarify') handleClarifyAnswer();
                }
              }}
              disabled={isLoading || (phase === 'final')}
              autoFocus
            />
          </div>
          <button
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={phase === 'initial' ? handleInitialSubmit : handleClarifyAnswer}
            disabled={isLoading || !input.trim() || phase === 'final'}
          >
            {phase === 'clarify' && clarifyQuestions.length > 0 ? (currentQuestionIdx + 1 < clarifyQuestions.length ? 'Next' : 'Finish') : 'Get Suggestions'}
          </button>
        </div>
      </div>
    </div>
  );
} 