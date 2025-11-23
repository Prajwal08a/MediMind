import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { VerificationResult, Document, Model, Voice } from '../types';

if (!process.env.API_KEY) {
    // In a real application, you'd want to handle this more gracefully.
    // Perhaps showing an error message to the user.
    // For this example, we'll throw an error if the API key is not set.
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const verificationModel = 'gemini-3-pro-preview'; // Always use a powerful model for verification

const verificationSchema = {
  type: Type.OBJECT,
  properties: {
    isConsistent: {
      type: Type.BOOLEAN,
      description: "Whether the answer is factually consistent with the source document.",
    },
    reasoning: {
      type: Type.STRING,
      description: "A brief explanation for why the answer is consistent or not.",
    },
    correctedAnswer: {
      type: Type.STRING,
      description: "If inconsistent, a corrected answer based ONLY on the source. Otherwise, null.",
    },
  },
  required: ["isConsistent", "reasoning", "correctedAnswer"],
};

const suggestedQuestionsSchema = {
    type: Type.OBJECT,
    properties: {
        questions: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING,
                description: "A relevant question a user might ask about the provided summary."
            }
        }
    },
    required: ["questions"]
}

export const summarizeDocument = async (document: Document, systemInstruction: string, summaryPrompt: string, modelName: Model): Promise<string> => {
    let contents: any;

    if (modelName === 'llama3') return "LLaMA 3 is not integrated in this client-side application.";

    if (document.type === 'text') {
        const prompt = `
            ${summaryPrompt}

            DOCUMENT:
            ---
            ${document.content}
            ---
        `;
        contents = prompt;
    } else if (document.type === 'image' && document.mimeType) {
        const prompt = `
            ${summaryPrompt} from this image of a medical document (like a prescription or clinical notes).
        `;
        contents = {
            parts: [
                { text: prompt },
                {
                    inlineData: {
                        mimeType: document.mimeType,
                        data: document.content,
                    }
                }
            ]
        };
    } else {
        return "Could not summarize: Invalid document type provided.";
    }

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
            }
        });
        return response.text ?? "Unable to generate a summary for this document.";
    } catch (error) {
        console.error("Error generating summary:", error);
        return "An error occurred while generating the summary.";
    }
};

export async function* generateAnswerStream(query: string, document: Document, systemInstruction: string, modelName: Model): AsyncGenerator<string> {
    let contents: any;

    if (modelName === 'llama3') {
        yield "LLaMA 3 is not integrated in this client-side application.";
        return;
    }

    if (document.type === 'text') {
        const prompt = `
            Based STRICTLY on the following document, answer the user's question.
            Do not use any external knowledge. If the answer is not in the document, say so.

            DOCUMENT:
            ---
            ${document.content}
            ---

            QUESTION: ${query}
        `;
        contents = prompt;
    } else if (document.type === 'image' && document.mimeType) {
        const prompt = `
            Based STRICTLY on the following image of a medical document (like a prescription), answer the user's question.
            First, analyze the image to understand its content. Then, answer the question based ONLY on information visible in the image.
            Do not use any external knowledge. If the answer is not in the document image, say so.

            QUESTION: ${query}
        `;
        contents = {
            parts: [
                { text: prompt },
                {
                    inlineData: {
                        mimeType: document.mimeType,
                        data: document.content,
                    }
                }
            ]
        };
    } else {
        yield "Invalid document type provided.";
        return;
    }

    try {
        const responseStream = await ai.models.generateContentStream({
            model: modelName,
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
            }
        });

        for await (const chunk of responseStream) {
            if (chunk.text) {
                yield chunk.text;
            }
        }
    } catch (error) {
        console.error("Error generating answer stream:", error);
        yield "An error occurred while generating the answer.";
    }
}


export const verifyAnswer = async (answer: string, document: Document): Promise<VerificationResult> => {
    let contents: any;

    const basePrompt = `
        You are a meticulous fact-checker for a medical chatbot. Your task is to verify a generated ANSWER against a SOURCE document.
        - Determine if the ANSWER is factually consistent with the SOURCE.
        - Do not use any external knowledge. Your judgment must be based solely on the provided SOURCE.
        - If the ANSWER is inconsistent, provide a corrected version based strictly on the SOURCE.
    `;

    if (document.type === 'text') {
        const prompt = `
            ${basePrompt}

            SOURCE DOCUMENT:
            ---
            ${document.content}
            ---

            GENERATED ANSWER:
            ---
            ${answer}
            ---

            Now, provide your verification as a JSON object.
        `;
        contents = prompt;
    } else if (document.type === 'image' && document.mimeType) {
        const prompt = `
            ${basePrompt}

            The SOURCE is an image of a medical document. Analyze it carefully.

            GENERATED ANSWER:
            ---
            ${answer}
            ---

            Now, provide your verification as a JSON object based on the SOURCE image.
        `;
        contents = {
            parts: [
                { text: prompt },
                {
                    inlineData: {
                        mimeType: document.mimeType,
                        data: document.content,
                    }
                }
            ]
        };
    } else {
        return {
            isConsistent: false,
            reasoning: "Invalid document type for verification.",
            correctedAnswer: answer,
        };
    }

    try {
        const response = await ai.models.generateContent({
            model: verificationModel,
            contents: contents,
            config: {
                responseMimeType: "application/json",
                responseSchema: verificationSchema
            }
        });

        const jsonText = response.text?.trim() ?? '{}';
        const parsedJson = JSON.parse(jsonText);

        // Validate the parsed JSON against the expected structure
        if (typeof parsedJson.isConsistent !== 'boolean' || typeof parsedJson.reasoning !== 'string') {
            throw new Error("Invalid JSON structure from verification model");
        }

        return {
            isConsistent: parsedJson.isConsistent,
            reasoning: parsedJson.reasoning,
            correctedAnswer: parsedJson.correctedAnswer || null
        };

    } catch (error) {
        console.error("Error verifying answer:", error);
        return {
            isConsistent: false,
            reasoning: "An error occurred during verification. The model's response may be unreliable.",
            correctedAnswer: answer,
        };
    }
};

export const generateSuggestedQuestions = async (summary: string, modelName: Model): Promise<string[]> => {
    if (modelName === 'llama3') return [];
    
    const prompt = `
        Based on the following medical summary, generate 3 relevant and insightful questions a user might want to ask.
        The questions should be concise and directly related to the information in the summary.

        SUMMARY:
        ---
        ${summary}
        ---

        Return the questions in a JSON object.
    `;

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: suggestedQuestionsSchema,
            }
        });

        const jsonText = response.text?.trim() ?? '{}';
        const parsedJson = JSON.parse(jsonText);
        
        if (Array.isArray(parsedJson.questions)) {
            return parsedJson.questions.slice(0, 3); // Return at most 3 questions
        }
        return [];
    } catch (error) {
        console.error("Error generating suggested questions:", error);
        return []; // Return empty array on error
    }
};

export const generateSpeech = async (text: string, voice: Voice): Promise<string | null> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voice },
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
            return base64Audio;
        }
        return null;
    } catch (error) {
        console.error("Error generating speech:", error);
        return null;
    }
};