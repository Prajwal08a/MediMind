import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useCorrectiveRAG } from '../hooks/useCorrectiveRAG';
import ChatMessage from './ChatMessage';
import { SendIcon } from './icons/SendIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { TrashIcon } from './icons/TrashIcon';
import { Document, Persona, Model, Voice } from '../types';
import SuggestedQuestions from './SuggestedQuestions';

interface ChatInterfaceProps {
  document: Document;
  documentId: string;
  documentName: string;
  persona: Persona;
  modelName: Model;
  voice: Voice;
  suggestedQuestions: string[];
  isGeneratingSuggestions: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
    document, 
    documentId, 
    documentName, 
    persona, 
    modelName,
    voice,
    suggestedQuestions,
    isGeneratingSuggestions
}) => {
  const { messages, isLoading, sendMessage, clearChat } = useCorrectiveRAG(document, documentId, persona, modelName);
  const [inputValue, setInputValue] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    const textarea = textareaRef.current;
    if (textarea) {
        textarea.style.height = 'auto'; // Reset height to shrink if text is deleted
        textarea.style.height = `${textarea.scrollHeight}px`; // Set to scroll height to grow
    }
  };

  const handleSendMessage = useCallback((message: string) => {
    if (!message.trim()) return;
    sendMessage(message);
    setInputValue('');
    // Reset textarea height after sending
    const textarea = textareaRef.current;
    if (textarea) {
        textarea.style.height = 'auto';
    }
  }, [sendMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 relative">
      <header className="p-3 sm:p-4 border-b border-gray-200 bg-white z-10 flex justify-between items-center">
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">AI Chat Helper</h2>
          <p className="text-xs sm:text-sm text-gray-500 truncate">Chatting about: <span className="font-medium text-gray-700">{documentName}</span></p>
        </div>
        {messages.length > 0 && (
            <button
                onClick={clearChat}
                className="flex items-center space-x-2 p-2 sm:px-4 sm:py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 hover:text-gray-900 transition-all duration-300 ease-in-out flex-shrink-0"
                title="Clear chat history"
                aria-label="Clear chat history"
            >
                <TrashIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Clear history</span>
            </button>
        )}
      </header>
      
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} voice={voice} />
        ))}
        <div ref={chatEndRef} />
      </div>

      <footer className="p-3 sm:p-4 bg-white border-t border-gray-200">
        {!isLoading && messages.length === 0 && (
            <SuggestedQuestions 
                questions={suggestedQuestions}
                isLoading={isGeneratingSuggestions}
                onQuestionClick={handleSendMessage}
            />
        )}
        <form onSubmit={handleSubmit} className="flex items-end space-x-2 sm:space-x-3">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                }
            }}
            placeholder="Start typing..."
            className="flex-1 py-2.5 px-4 bg-gray-100 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 ease-in-out text-gray-800 resize-none overflow-y-hidden"
            disabled={isLoading}
            rows={1}
            style={{ maxHeight: '160px' }}
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-full hover:from-blue-700 hover:to-blue-600 disabled:from-blue-400 disabled:to-blue-300 disabled:cursor-not-allowed transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-100"
            aria-label="Send message"
            title="Send message"
          >
            {isLoading ? <SpinnerIcon className="w-5 sm:w-6 h-5 sm:h-6 animate-spin" /> : <SendIcon className="w-5 sm:w-6 h-5 sm:h-6" />}
          </button>
        </form>
         <p className="text-xs text-center text-gray-400 mt-3">
            AI responses may be inaccurate. Verify important information.
        </p>
      </footer>
    </div>
  );
};

export default ChatInterface;