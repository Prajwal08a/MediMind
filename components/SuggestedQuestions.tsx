import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface SuggestedQuestionsProps {
    questions: string[];
    isLoading: boolean;
    onQuestionClick: (question: string) => void;
}

const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({ questions, isLoading, onQuestionClick }) => {
    if (isLoading) {
        return (
            <div className="mb-4 flex items-center justify-center space-x-2 text-sm text-gray-400">
                <SpinnerIcon className="w-4 h-4 animate-spin" />
                <span>Generating suggestions...</span>
            </div>
        );
    }

    if (questions.length === 0) {
        return null;
    }

    return (
        <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2 px-2" title="AI-generated question suggestions">
                <SparklesIcon className="w-5 h-5 text-blue-500" />
                <h4 className="text-sm font-semibold text-gray-700">Suggested Questions</h4>
            </div>
            <div className="flex flex-wrap gap-2">
                {questions.map((q, i) => (
                    <button
                        key={i}
                        onClick={() => onQuestionClick(q)}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 hover:text-gray-900 transition-colors duration-200 ease-in-out"
                    >
                        {q}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SuggestedQuestions;