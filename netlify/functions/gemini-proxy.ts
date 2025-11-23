import { GoogleGenAI, Modality, Type } from "@google/genai";

// Re-define types needed for the function
type Document = { type: 'text' | 'image'; content: string; mimeType?: string; };
type Voice = 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';

// Schemas are moved here to keep them off the client-side
const verificationSchema = {
  type: Type.OBJECT,
  properties: {
    isConsistent: { type: Type.BOOLEAN },
    reasoning: { type: Type.STRING },
    correctedAnswer: { type: Type.STRING },
  },
  required: ["isConsistent", "reasoning", "correctedAnswer"],
};

const suggestedQuestionsSchema = {
    type: Type.OBJECT,
    properties: {
        questions: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        }
    },
    required: ["questions"]
};

// Netlify serverless function handler
export const handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured on server.' }) };
    }
    const ai = new GoogleGenAI({ apiKey });

    try {
        const { action, payload } = JSON.parse(event.body);

        switch (action) {
            case 'summarize': {
                const { document, systemInstruction, summaryPrompt, modelName } = payload;
                const response = await ai.models.generateContent({
                    model: modelName,
                    contents: buildContents(document, summaryPrompt),
                    config: { systemInstruction }
                });
                return { statusCode: 200, body: JSON.stringify(response) };
            }
            case 'generateStream': {
                const { query, document, systemInstruction, modelName } = payload;
                const stream = await ai.models.generateContentStream({
                    model: modelName,
                    contents: buildContents(document, `QUESTION: ${query}`),
                    config: { systemInstruction }
                });
                
                const readableStream = new ReadableStream({
                    async start(controller) {
                        for await (const chunk of stream) {
                            if (chunk.text) {
                                controller.enqueue(new TextEncoder().encode(chunk.text));
                            }
                        }
                        controller.close();
                    },
                });

                return new Response(readableStream, {
                    headers: { "Content-Type": "text/plain; charset=utf-8" },
                });
            }
            case 'verify': {
                const { answer, document } = payload;
                const response = await ai.models.generateContent({
                    model: 'gemini-3-pro-preview',
                    contents: buildContents(document, `GENERATED ANSWER:\n---\n${answer}\n---`),
                    config: { responseMimeType: "application/json", responseSchema: verificationSchema }
                });
                return { statusCode: 200, body: JSON.stringify(response) };
            }
            case 'suggestQuestions': {
                 const { summary, modelName } = payload;
                 const response = await ai.models.generateContent({
                    model: modelName,
                    contents: `SUMMARY:\n---\n${summary}\n---`,
                    config: { responseMimeType: "application/json", responseSchema: suggestedQuestionsSchema }
                });
                 return { statusCode: 200, body: JSON.stringify(response) };
            }
            case 'generateSpeech': {
                const { text, voice } = payload;
                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash-preview-tts",
                    contents: [{ parts: [{ text }] }],
                    config: {
                        responseModalities: [Modality.AUDIO],
                        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
                    },
                });
                return { statusCode: 200, body: JSON.stringify(response) };
            }
            default:
                return { statusCode: 400, body: JSON.stringify({ error: 'Invalid action specified.' }) };
        }
    } catch (error) {
        console.error('Error in gemini-proxy:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};

// Helper to build the 'contents' part of the Gemini request
const buildContents = (document: Document, prompt: string) => {
    if (document.type === 'text') {
        return `${prompt}\n\nDOCUMENT:\n---\n${document.content}\n---`;
    } else if (document.type === 'image' && document.mimeType) {
        return { parts: [{ text: prompt }, { inlineData: { mimeType: document.mimeType, data: document.content } }] };
    }
    throw new Error('Invalid document type');
};
