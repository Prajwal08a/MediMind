import React from 'react';
import { SummaryFocus, Document } from '../types';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { ClipboardListIcon } from './icons/ClipboardListIcon';
import SummaryFocusSelector from './SummaryFocusSelector';

interface SummarySectionProps {
  summary: string;
  isSummarizing: boolean;
  summaryFocus: SummaryFocus;
  onSummaryFocusChange: (focus: SummaryFocus) => void;
  documentType: Document['type'] | null;
}

const SummarySection: React.FC<SummarySectionProps> = ({
  summary,
  isSummarizing,
  summaryFocus,
  onSummaryFocusChange,
  documentType,
}) => {
  return (
    <div className="h-full flex flex-col">
        <div className="flex items-center space-x-2 p-2" title="A summary of the selected document">
          <ClipboardListIcon className="w-6 h-6 text-blue-500" />
          <h3 className="font-bold text-lg text-gray-800">Document Summary</h3>
        </div>

        <div className="p-2">
            <SummaryFocusSelector selectedFocus={summaryFocus} onFocusChange={onSummaryFocusChange} />
        </div>

        <div className="flex-1 mt-4 p-2 overflow-y-auto">
          {isSummarizing && !summary && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
              <SpinnerIcon className="w-6 h-6 animate-spin text-blue-500" />
              <div>
                <p className="text-md font-semibold text-gray-500">Generating summary...</p>
                {documentType === 'image' && (
                    <p className="text-sm text-gray-400 mt-1">Image analysis may take a moment.</p>
                )}
              </div>
            </div>
          )}

          {summary && (
            <div className="text-sm text-gray-600 prose prose-sm max-w-none">
              <ul className="space-y-2">
                {summary.split('\n').filter(line => line.trim().length > 0).map((line, index) => (
                  <li key={index} className="pl-3 border-l-2 border-blue-500/50">{line.replace(/^- |^\* /, '')}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
    </div>
  );
};

export default SummarySection;