import React from 'react';
import { Model } from '../types';
import { CpuChipIcon } from './icons/CpuChipIcon';

interface ModelSelectorProps {
  selectedModel: Model;
  onModelChange: (model: Model) => void;
}

const models: { id: Model; label: string }[] = [
  { id: 'gemini-2.5-flash', label: 'Gemini Flash' },
  { id: 'gemini-3-pro-preview', label: 'Gemini Pro' },
  { id: 'llama3', label: 'LLaMA 3' },
];

const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onModelChange }) => {
  return (
    <div>
      <div className="flex items-center space-x-2 mb-2 px-1" title="Select the AI model for generating responses">
        <CpuChipIcon className="w-5 h-5 text-gray-400" />
        <h3 className="text-xs font-semibold text-gray-500 tracking-wider uppercase">Model</h3>
      </div>
      <div className="flex space-x-1 rounded-full bg-gray-100 p-1">
        {models.map((model) => (
          <button
            key={model.id}
            onClick={() => onModelChange(model.id)}
            className={`flex-1 text-center px-3 py-1.5 text-sm font-semibold rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white
              ${selectedModel === model.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:bg-white/60'
              }`}
          >
            {model.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ModelSelector;