import React from 'react';
import { Persona } from '../types';
import { UserCircleIcon } from './icons/UserCircleIcon';

interface PersonaSelectorProps {
  selectedPersona: Persona;
  onPersonaChange: (persona: Persona) => void;
}

const personas: { id: Persona; label: string }[] = [
  { id: 'professional', label: 'Professional' },
  { id: 'empathetic', label: 'Empathetic' },
  { id: 'concise', label: 'Concise' },
];

const PersonaSelector: React.FC<PersonaSelectorProps> = ({ selectedPersona, onPersonaChange }) => {
  return (
    <div>
      <div className="flex items-center space-x-2 mb-2 px-1" title="Select the AI's personality and tone">
        <UserCircleIcon className="w-5 h-5 text-gray-400" />
        <h3 className="text-xs font-semibold text-gray-500 tracking-wider uppercase">Chat Persona</h3>
      </div>
      <div className="flex space-x-1 rounded-full bg-gray-100 p-1">
        {personas.map((persona) => (
          <button
            key={persona.id}
            onClick={() => onPersonaChange(persona.id)}
            className={`flex-1 text-center px-3 py-1.5 text-sm font-semibold rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white
              ${selectedPersona === persona.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:bg-white/60'
              }`}
          >
            {persona.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PersonaSelector;