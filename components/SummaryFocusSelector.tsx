import React from 'react';
import { SummaryFocus } from '../types';
import { AdjustmentsHorizontalIcon } from './icons/AdjustmentsHorizontalIcon';

interface SummaryFocusSelectorProps {
  selectedFocus: SummaryFocus;
  onFocusChange: (focus: SummaryFocus) => void;
}

const focuses: { id: SummaryFocus; label: string }[] = [
  { id: 'key_points', label: 'Key Points' },
  { id: 'treatment_plan', label: 'Treatment' },
  { id: 'diagnosis', label: 'Diagnosis' },
];

const SummaryFocusSelector: React.FC<SummaryFocusSelectorProps> = ({ selectedFocus, onFocusChange }) => {
  return (
    <div>
      <div className="flex items-center space-x-2 mb-2" title="Change the focus of the document summary">
        <AdjustmentsHorizontalIcon className="w-5 h-5 text-gray-400" />
        <h3 className="text-xs font-semibold text-gray-500">Summary Focus</h3>
      </div>
      <div className="flex space-x-1 rounded-full bg-gray-100 p-1">
        {focuses.map((focus) => (
          <button
            key={focus.id}
            onClick={() => onFocusChange(focus.id)}
            className={`w-full text-center px-2 py-1 text-xs font-semibold rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white
              ${selectedFocus === focus.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:bg-white/60'
              }`}
          >
            {focus.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SummaryFocusSelector;