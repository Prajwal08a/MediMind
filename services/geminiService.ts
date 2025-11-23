import type { VerificationResult, Document, Model, Voice } from '../types';

// The new secure way to call our Vercel backend proxy function.
const callProxy = async (action: string, payload: object) => {
    const response = await fetch('/api/gemini-proxy', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, payload }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Proxy request failed with status ${response.status}`);
    }
    
    // For streaming responses, the body is handled directly by the browser's fetch stream consumer.
    if (action === 'generateStream') {
        return response;
    }

    return response.json();
};


export const summarizeDocument = async (document: Document, systemInstruction: string, summaryPrompt: string, modelName: Model): Promise<string> => {
    if (modelName === 'llama3') return "LLaMA 3 is not integrated in this client-side application.";
    
    try {
        const response = await callProxy('summarize', { document, systemInstruction, summaryPrompt, modelName });
        return response.text ?? "Unable to generate a summary for this document.";
    } catch (error) {
        console.error("Error generating summary via proxy:", error);
        return "An error occurred while generating the summary.";
    }
};

export async function* generateAnswerStream(query: string, document: Document, systemInstruction: string, modelName: Model): AsyncGenerator<string> {
    if (modelName === 'llama3') {
        yield "LLaMA 3 is not integrated in this client-side application.";
        return;
    }

    try {
        const response = await callProxy('generateStream', { query, document, systemInstruction, modelName });
        
        if (!response.body) {
            throw new Error("Response body is null");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            yield decoder.decode(value, { stream: true });
        }

    } catch (error) {
        console.error("Error generating answer stream via proxy:", error);
        yield "An error occurred while generating the answer.";
    }
}


export const verifyAnswer = async (answer: string, document: Document): Promise<VerificationResult> => {
    try {
        const response = await callProxy('verify', { answer, document });
        const jsonText = response.text?.trim() ?? '{}';
        const parsedJson = JSON.parse(jsonText);
        return {
            isConsistent: parsedJson.isConsistent,
            reasoning: parsedJson.reasoning,
            correctedAnswer: parsedJson.correctedAnswer || null
        };
    } catch (error) {
        console.error("Error verifying answer via proxy:", error);
        return {
            isConsistent: false,
            reasoning: "An error occurred during verification. The model's response may be unreliable.",
            correctedAnswer: answer,
        };
    }
};

export const generateSuggestedQuestions = async (summary: string, modelName: Model): Promise<string[]> => {
    if (modelName === 'llama3') return [];
    
    try {
        const response = await callProxy('suggestQuestions', { summary, modelName });
        const jsonText = response.text?.trim() ?? '{}';
        const parsedJson = JSON.parse(jsonText);
        
        if (Array.isArray(parsedJson.questions)) {
            return parsedJson.questions.slice(0, 3);
        }
        return [];
    } catch (error) {
        console.error("Error generating suggested questions via proxy:", error);
        return [];
    }
};

export const generateSpeech = async (text: string, voice: Voice): Promise<string | null> => {
    try {
        const response = await callProxy('generateSpeech', { text, voice });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
            return base64Audio;
        }
        return null;
    } catch (error) {
        console.error("Error generating speech via proxy:", error);
        return null;
    }
};