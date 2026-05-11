import { getGeminiResponse } from "./providers/gemini";
import { getOpenAIResponse } from "./providers/openai";
import { getClaudeResponse } from "./providers/claude";
import { getGrokResponse } from "./providers/grok";

export type AIProvider = 'gemini' | 'openai' | 'claude' | 'grok';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function getChatResponse(
  provider: AIProvider,
  apiKey: string,
  modelName: string,
  systemPrompt: string,
  history: ChatMessage[],
  userMessage: string
): Promise<string> {
  switch (provider) {
    case 'gemini':
      return getGeminiResponse(apiKey, modelName, systemPrompt, history, userMessage);
    case 'openai':
      return getOpenAIResponse(apiKey, modelName, systemPrompt, history, userMessage);
    case 'claude':
      return getClaudeResponse(apiKey, modelName, systemPrompt, history, userMessage);
    case 'grok':
      return getGrokResponse(apiKey, modelName, systemPrompt, history, userMessage);
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}
