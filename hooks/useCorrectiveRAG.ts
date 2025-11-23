import { useState, useCallback, useEffect } from 'react';
import { generateAnswerStream, verifyAnswer } from '../services/geminiService';
import { Message, MessageAuthor, VerificationStatus, BotMessageContent, Document, Persona, Model } from '../types';
import { getSystemInstruction } from '../utils/personaInstructions';

export const useCorrectiveRAG = (document: Document, documentId: string, persona: Persona, modelName: Model) => {
  const storageKey = `chatHistory_${documentId}`;

  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== 'undefined' && documentId) {
      try {
        const storedMessages = localStorage.getItem(storageKey);
        return storedMessages ? JSON.parse(storedMessages) : [];
      } catch (error) {
        console.error("Failed to parse chat history from localStorage", error);
        return [];
      }
    }
    return [];
  });
  
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && documentId) {
      if (messages.length > 0) {
        localStorage.setItem(storageKey, JSON.stringify(messages));
      } else {
        localStorage.removeItem(storageKey);
      }
    }
  }, [messages, storageKey, documentId]);

  const sendMessage = useCallback(async (query: string) => {
    if (!query.trim() || !document || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      author: MessageAuthor.USER,
      content: query,
    };
    
    const botMessagePlaceholder: Message = {
      id: (Date.now() + 1).toString(),
      author: MessageAuthor.BOT,
      content: {
        answer: '',
        status: VerificationStatus.UNVERIFIED,
        reasoning: 'Generating response...',
      }
    };

    setMessages(prev => [...prev, userMessage, botMessagePlaceholder]);
    setIsLoading(true);

    let fullAnswer = '';
    try {
      const systemInstruction = getSystemInstruction(persona);
      const stream = generateAnswerStream(query, document, systemInstruction, modelName);

      for await (const chunk of stream) {
        fullAnswer += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === botMessagePlaceholder.id 
          ? { ...msg, content: { ...(msg.content as BotMessageContent), answer: fullAnswer } }
          : msg
        ));
      }
    } catch (error) {
      console.error("Answer generation failed:", error);
      const errorContent: BotMessageContent = {
        answer: "I'm sorry, I was unable to generate a response for your question. Please try rephrasing it, or ask something different about the document.",
        status: VerificationStatus.ERROR,
        reasoning: "Failed to generate an initial answer.",
      };
      setMessages(prev => prev.map(msg => 
        msg.id === botMessagePlaceholder.id 
        ? { ...msg, content: errorContent }
        : msg
      ));
      setIsLoading(false);
      return;
    }

    if (!fullAnswer.trim()) {
        const noAnswerContent: BotMessageContent = {
            answer: "I couldn't find a relevant answer in the document for your question.",
            status: VerificationStatus.ERROR,
            reasoning: "The model did not generate a response.",
        };
        setMessages(prev => prev.map(msg =>
            msg.id === botMessagePlaceholder.id
            ? { ...msg, content: noAnswerContent }
            : msg
        ));
        setIsLoading(false);
        return;
    }

    // Set verifying status after stream is complete
    setMessages(prev => prev.map(msg => 
        msg.id === botMessagePlaceholder.id 
        ? { ...msg, content: { ...(msg.content as BotMessageContent), isVerifying: true, reasoning: "Verifying answer for factual consistency..." } }
        : msg
    ));

    try {
      const verification = await verifyAnswer(fullAnswer, document);

      let finalAnswer: string;
      let status: VerificationStatus;

      if (verification.isConsistent) {
        finalAnswer = fullAnswer;
        status = VerificationStatus.VERIFIED;
      } else {
        finalAnswer = verification.correctedAnswer || fullAnswer;
        status = verification.correctedAnswer ? VerificationStatus.CORRECTED : VerificationStatus.UNVERIFIED;
      }

      const finalBotContent: BotMessageContent = {
        answer: finalAnswer,
        status: status,
        reasoning: verification.reasoning,
        isVerifying: false,
      };
      
      setMessages(prev => prev.map(msg => 
        msg.id === botMessagePlaceholder.id
        ? { ...msg, content: finalBotContent }
        : msg
      ));

    } catch (error) {
        console.error("Answer verification failed:", error);
        const unverifiedContent: BotMessageContent = {
            answer: fullAnswer,
            status: VerificationStatus.UNVERIFIED,
            reasoning: "I generated an answer, but a system error occurred during the verification step. Please use this response with caution and double-check critical information.",
            isVerifying: false,
        };
        setMessages(prev => prev.map(msg => 
          msg.id === botMessagePlaceholder.id
          ? { ...msg, content: unverifiedContent }
          : msg
        ));
    } finally {
        setIsLoading(false);
    }
  }, [document, isLoading, persona, modelName, storageKey]);

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  return { messages, isLoading, sendMessage, clearChat };
};