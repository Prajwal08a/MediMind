import React from 'react';
import { Message, MessageAuthor, VerificationStatus, BotMessageContent, Voice } from '../types';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';
import { ShieldExclamationIcon } from './icons/ShieldExclamationIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { SpeakerWaveIcon } from './icons/SpeakerWaveIcon';
import { SpeakerXMarkIcon } from './icons/SpeakerXMarkIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface ChatMessageProps {
  message: Message;
  voice: Voice;
}

const getStatusInfo = (status: VerificationStatus) => {
  switch (status) {
    case VerificationStatus.VERIFIED:
      return {
        icon: <CheckCircleIcon className="w-4 h-4 text-green-500" />,
        text: 'Verified',
        textColor: 'text-green-600',
      };
    case VerificationStatus.CORRECTED:
      return {
        icon: <ShieldExclamationIcon className="w-4 h-4 text-orange-500" />,
        text: 'Corrected',
        textColor: 'text-orange-600',
      };
    case VerificationStatus.UNVERIFIED:
       return {
        icon: <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />,
        text: 'Unverified',
        textColor: 'text-yellow-600',
      };
    case VerificationStatus.ERROR:
       return {
        icon: <XCircleIcon className="w-4 h-4 text-red-500" />,
        text: 'Error',
        textColor: 'text-red-600',
      };
    default:
      return { icon: null, text: 'Info', textColor: 'text-gray-500' };
  }
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message, voice }) => {
  if (message.author === MessageAuthor.USER) {
    return (
      <div className="flex items-start justify-end space-x-2 sm:space-x-4">
        <div className="max-w-[90%] sm:max-w-xl p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-md">
          <p className="font-medium">{message.content as string}</p>
        </div>
        <div title="User" className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm">U</div>
      </div>
    );
  }

  const botContent = message.content as BotMessageContent;
  const statusInfo = getStatusInfo(botContent.status);
  const { speechState, toggleSpeech } = useTextToSpeech(botContent.answer, voice);

  const renderSpeechButton = () => {
    let icon;
    let title;
    
    switch (speechState) {
        case 'loading':
            icon = <SpinnerIcon className="w-5 h-5 animate-spin" />;
            title = 'Generating audio...';
            break;
        case 'playing':
            icon = <SpeakerXMarkIcon className="w-5 h-5" />;
            title = 'Stop speech';
            break;
        default:
            icon = <SpeakerWaveIcon className="w-5 h-5" />;
            title = 'Read message aloud';
            break;
    }

    return (
      <button
        onClick={toggleSpeech}
        disabled={speechState === 'loading' || !botContent.answer}
        className="p-1.5 rounded-full text-gray-400 hover:text-blue-600 hover:bg-gray-100 transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60"
        aria-label={title}
        title={title}
      >
        {icon}
      </button>
    );
  };

  const renderStatus = () => {
    if (botContent.isVerifying) {
      return (
        <div className="flex items-center space-x-1.5 text-blue-600" title="Verifying answer...">
          <SpinnerIcon className="w-4 h-4 animate-spin" />
          <span className="font-medium">Verifying...</span>
        </div>
      );
    }
    return (
      <div className={`flex items-center space-x-1.5 ${statusInfo.textColor}`}>
        {statusInfo.icon}
        <span className="font-medium">{statusInfo.text}</span>
      </div>
    );
  };

  return (
    <div className="flex items-start space-x-2 sm:space-x-4">
      <div title="AI Assistant" className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm shadow-sm">AI</div>
      <div className="flex-1 max-w-[90%] sm:max-w-xl">
        <div className="bg-white shadow-sm rounded-2xl border border-gray-200">
          <div className="p-4 prose prose-sm max-w-none text-gray-700 min-h-[4rem]">
            {botContent.answer ? (
                <p>{botContent.answer}</p>
            ) : (
                <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-pulse delay-0"></span>
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-pulse delay-150"></span>
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-pulse delay-300"></span>
                </div>
            )}
          </div>
          {(statusInfo || botContent.reasoning) && (
            <div className="border-t border-gray-200/50 mt-2 px-4 py-2 flex items-center justify-between text-xs text-gray-500">
              <div 
                className="flex items-center space-x-2 group"
                title={botContent.reasoning}
              >
                {renderStatus()}
                {!botContent.isVerifying && botContent.reasoning && <p className="hidden md:block truncate max-w-xs text-gray-400">{botContent.reasoning}</p>}
              </div>

              {renderSpeechButton()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;