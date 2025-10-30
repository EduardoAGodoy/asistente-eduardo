
import React, { useRef, useEffect } from 'react';
import type { TranscriptionTurn } from '../types';
import { ConversationParticipant } from '../types';
import { Icon } from './Icon';

interface TranscriptionViewProps {
  history: TranscriptionTurn[];
  currentInput: string;
  currentOutput: string;
}

const TurnMessage: React.FC<{ turn: TranscriptionTurn }> = ({ turn }) => {
    const isUser = turn.participant === ConversationParticipant.USER;
    const isBot = turn.participant === ConversationParticipant.BOT;
    const isSystem = turn.participant === ConversationParticipant.SYSTEM;

    if (isSystem) {
        return (
            <div className="flex justify-center items-center my-2">
                <p className="text-xs text-gray-400 italic px-4 py-1 bg-gray-700 rounded-full">{turn.text}</p>
            </div>
        )
    }

    const alignment = isUser ? 'justify-end' : 'justify-start';
    const bgColor = isUser ? 'bg-blue-600' : 'bg-gray-600';
    const iconType = isUser ? 'user' : 'bot';

    return (
        <div className={`flex items-start gap-3 my-4 ${alignment}`}>
            {!isUser && <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0"><Icon type={iconType} className="w-5 h-5 text-gray-300" /></div>}
            <div className={`max-w-md p-3 rounded-lg ${bgColor}`}>
                <p className="text-white">{turn.text}</p>
            </div>
             {isUser && <div className="w-8 h-8 rounded-full bg-blue-800 flex items-center justify-center flex-shrink-0"><Icon type={iconType} className="w-5 h-5 text-gray-200" /></div>}
        </div>
    );
};

export const TranscriptionView: React.FC<TranscriptionViewProps> = ({ history, currentInput, currentOutput }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history, currentInput, currentOutput]);

    return (
        <div ref={scrollRef} className="flex-grow p-4 overflow-y-auto">
            {history.map((turn, index) => (
                <TurnMessage key={index} turn={turn} />
            ))}
            {currentInput && <TurnMessage turn={{ participant: ConversationParticipant.USER, text: currentInput, timestamp: new Date() }} />}
            {currentOutput && <TurnMessage turn={{ participant: ConversationParticipant.BOT, text: currentOutput, timestamp: new Date() }} />}
             <div className="h-1"></div>
        </div>
    );
};
