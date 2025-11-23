import { SummaryFocus } from '../types';

export const summaryPrompts: Record<SummaryFocus, string> = {
  key_points: `Summarize the key points of the following medical document in 3-4 bullet points. Focus on the main diagnosis, critical findings, and primary instructions.`,
  treatment_plan: `Extract and summarize the treatment plan from the following medical document. List all medications with dosages, therapies, and follow-up instructions in a clear, itemized format.`,
  diagnosis: `Identify and summarize the diagnosis from the following medical document. State the primary diagnosis clearly and list any secondary or differential diagnoses mentioned.`,
};

export const getSummaryPrompt = (focus: SummaryFocus): string => {
  return summaryPrompts[focus];
};