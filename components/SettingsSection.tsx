import React, { useState } from 'react';
import { CogIcon } from './icons/CogIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface SettingsSectionProps {
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false); // Default to closed

  return (
    <div className="border-t border-gray-200 pt-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left p-2 rounded-lg hover:bg-gray-100"
        title={isOpen ? 'Collapse AI settings' : 'Expand AI settings'}
      >
        <div className="flex items-center space-x-2">
          <CogIcon className="w-5 h-5 text-gray-500" />
          <h3 className="font-semibold text-sm text-gray-700">AI Settings</h3>
        </div>
        <ChevronDownIcon
          className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="mt-2 pt-2 space-y-4 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
};

export default SettingsSection;