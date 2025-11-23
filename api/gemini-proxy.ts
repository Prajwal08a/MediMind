import { GoogleGenAI, Modality, Type } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

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

// Helper to build the 'contents' part of the Gemini request
const buildContents = (document: Document, prompt: string) => {
    if (document.type === 'text') {
        const docContent = `CONTEXT DOCUMENT:\n---\n${document.content}\n---`;
        return `${docContent}\n\nTASK:\n---\n${prompt}\n---`;
    } else if (document.type === 'image' && document.mimeType) {
        return { parts: [{ text: prompt }, { inlineData: { mimeType: document.mimeType, data: document.content } }] };
    }
    throw new Error('Invalid document type or missing mimeType for image.');
};


export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured on server.' });
    }
    const ai = new GoogleGenAI({ apiKey });

    try {
        const { action, payload } = req.body;

        switch (action) {
            case 'summarize': {
                const { document, systemInstruction, summaryPrompt, modelName } = payload;
                const response = await ai.models.generateContent({
                    model: modelName,
                    contents: buildContents(document, summaryPrompt),
                    config: { systemInstruction }
                });
                return res.status(200).json(response);
            }
            case 'generateStream': {
                const { query, document, systemInstruction, modelName } = payload;
                const stream = await ai.models.generateContentStream({
                    model: modelName,
                    contents: buildContents(document, `Based on the context document, answer the following question: ${query}`),
                    config: { systemInstruction }
                });
                
                res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                for await (const chunk of stream) {
                    if (chunk.text) {
                        res.write(chunk.text);
                    }
                }
                return res.end();
            }
            case 'verify': {
                const { answer, document } = payload;
                const prompt = `Review the following "GENERATED ANSWER" and determine if it is factually consistent with the "CONTEXT DOCUMENT". Provide your reasoning and a corrected answer if necessary.\n\nGENERATED ANSWER:\n---\n${answer}\n---`;
                const response = await ai.models.generateContent({
                    model: 'gemini-3-pro-preview',
                    contents: buildContents(document, prompt),
                    config: { responseMimeType: "application/json", responseSchema: verificationSchema }
                });
                return res.status(200).json(response);
            }
            case 'suggestQuestions': {
                 const { summary, modelName } = payload;
                 const prompt = `Based on the following document summary, generate 3 concise and relevant questions a user might want to ask.\n\nSUMMARY:\n---\n${summary}\n---`;
                 const response = await ai.models.generateContent({
                    model: modelName,
                    contents: prompt,
                    config: { responseMimeType: "application/json", responseSchema: suggestedQuestionsSchema }
                });
                 return res.status(200).json(response);
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
                return res.status(200).json(response);
            }
            default:
                return res.status(400).json({ error: 'Invalid action specified.' });
        }
    } catch (error) {
        console.error('Error in Vercel function:', error);
        return res.status(500).json({ error: error.message });
    }
}
