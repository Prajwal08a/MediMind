import React from 'react';
import { LogoIcon } from './icons/LogoIcon';

export const WelcomeScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gray-50">
      <div className="mb-6">
        <LogoIcon className="w-20 h-20" />
      </div>
      <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
        MediMind AI Assistant
      </h2>
      <p className="max-w-md text-gray-500">
        Please upload a medical document from the sidebar to begin. The chatbot will use its content to answer your questions with high factual accuracy.
      </p>
    </div>
  );
};