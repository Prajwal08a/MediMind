export enum MessageAuthor {
  USER = 'user',
  BOT = 'bot',
}

export enum VerificationStatus {
  VERIFIED = 'verified',
  CORRECTED = 'corrected',
  UNVERIFIED = 'unverified',
  ERROR = 'error',
}

export interface VerificationResult {
  isConsistent: boolean;
  reasoning: string;
  correctedAnswer: string | null;
}

export interface BotMessageContent {
  answer: string;
  status: VerificationStatus;
  reasoning?: string;
}

export interface Message {
  id: string;
  author: MessageAuthor;
  content: string | BotMessageContent;
}

export interface Document {
  type: 'text' | 'image';
  content: string; // text content or base64 data
  mimeType?: string; // for images
}

export interface ManagedDocument extends Document {
  id: string;
  name: string;
}

export type Persona = 'professional' | 'empathetic' | 'concise';

export type SummaryFocus = 'key_points' | 'treatment_plan' | 'diagnosis';

export type Model = 'gemini-2.5-flash' | 'gemini-3-pro-preview' | 'llama3';

export type Voice = 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';