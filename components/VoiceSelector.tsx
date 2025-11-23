import React from 'react';
import { Voice } from '../types';
import { MusicalNoteIcon } from './icons/MusicalNoteIcon';

interface VoiceSelectorProps {
  selectedVoice: Voice;
  onVoiceChange: (voice: Voice) => void;
}

const voices: { id: Voice; label: string }[] = [
  { id: 'Kore', label: 'Kore' },
  { id: 'Puck', label: 'Puck' },
  { id: 'Charon', label: 'Charon' },
  { id: 'Fenrir', label: 'Fenrir' },
  { id: 'Zephyr', label: 'Zephyr' },
];

const VoiceSelector: React.FC<VoiceSelectorProps> = ({ selectedVoice, onVoiceChange }) => {
  return (
    <div>
      <div className="flex items-center space-x-2 mb-2 px-1" title="Select the AI's voice for audio playback">
        <MusicalNoteIcon className="w-5 h-5 text-gray-400" />
        <h3 className="text-xs font-semibold text-gray-500 tracking-wider uppercase">Voice</h3>
      </div>
      <div className="flex overflow-x-auto space-x-1 rounded-full bg-gray-100 p-1">
        {voices.map((voice) => (
          <button
            key={voice.id}
            onClick={() => onVoiceChange(voice.id)}
            className={`text-center px-3 py-1.5 text-sm font-semibold rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white whitespace-nowrap
              ${selectedVoice === voice.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:bg-white/60'
              }`}
          >
            {voice.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default VoiceSelector;