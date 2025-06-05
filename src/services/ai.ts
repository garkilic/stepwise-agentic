import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only for development
});

export type ChatRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

const CLARIFY_SYSTEM_PROMPT = `You are a friendly, expert process designer helping a user clarify their process idea. Generate 3-5 warm, approachable, easy-to-answer questions. Each question should be specific, concrete, and guide the user on exactly what information to provide (avoid vagueness). Use a friendly, conversational tone, and feel free to add a touch of playfulness or creativity to make the questions more fun to answer! Only return the questions as a numbered list. Do not include any other text.`;

export async function getClarificationQuestions(idea: string): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: 'system', content: CLARIFY_SYSTEM_PROMPT },
        { role: 'user', content: idea }
      ],
      temperature: 0.5,
      max_tokens: 300,
    });
    const text = response.choices[0]?.message?.content || '';
    // Parse numbered list into array
    const questions = text
      .split(/\n+/)
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(Boolean);
    return questions;
  } catch (error) {
    console.error('Error getting clarification questions:', error);
    return [];
  }
}

const SYSTEM_PROMPT = `You are a world-class process prompt engineer. Your job is to help users create the most effective, actionable, and clear process prompts for step-by-step automation.\n\nFor every user input, provide ONLY ONE best-possible enhanced prompt. Before the prompt, provide a concise rationale: explain the key improvements you made and why this is the best approach for the user's goal.\n\nThe rationale MUST be no more than 1-2 sentences and 30 words.\n\nDo not ask questions. Do not provide alternatives.\n\nFormat your response as follows:\n\nRATIONALE\n- (1-2 sentences, max 30 words)\n\nENHANCED PROMPT\n- The improved, ready-to-use process prompt (step-by-step, actionable, clear, and complete)\n\nKeep your response focused, professional, and solution-oriented. Your output should be suitable for direct use in process automation or agentic workflows.`;

export async function refinePrompt(messages: ChatMessage[]): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    return response.choices[0]?.message?.content || 'I apologize, but I need more information to help refine your process.';
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    return 'I apologize, but I encountered an error. Please try again.';
  }
}

const SUMMARY_SYSTEM_PROMPT = `Given the following process prompt, return a short phrase in the format: 'Process to [main goal]'. Make it simple, direct, and user-friendly so the user knows what the process will do. Do not repeat the original prompt verbatim. Example: 'Process to help friends understand Perplexity'.`;

export async function getPromptSummary(prompt: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: 'system', content: SUMMARY_SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 100,
    });
    return response.choices[0]?.message?.content?.trim() || '';
  } catch (error) {
    console.error('Error getting prompt summary:', error);
    return '';
  }
} 