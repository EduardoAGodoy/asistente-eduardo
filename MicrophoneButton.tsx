
import React from 'react';
import { Icon } from './Icon';
import { SessionState } from '../types';

interface MicrophoneButtonProps {
    state: SessionState;
    onClick: () => void;
}

export const MicrophoneButton: React.FC<MicrophoneButtonProps> = ({ state, onClick }) => {
    const isIdle = state === SessionState.IDLE;
    const isConnecting = state === SessionState.CONNECTING;
    const isActive = state === SessionState.LISTENING || state === SessionState.PROCESSING || state === SessionState.SPEAKING;

    const getButtonClasses = () => {
        let classes = 'relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out shadow-lg focus:outline-none focus:ring-4';
        if (isIdle) {
            classes += ' bg-blue-600 hover:bg-blue-700 focus:ring-blue-500/50';
        } else if (isConnecting) {
             classes += ' bg-yellow-500 cursor-wait focus:ring-yellow-400/50';
        } else { // Active
            classes += ' bg-red-600 hover:bg-red-700 focus:ring-red-500/50';
        }
        return classes;
    };
    
    const getIcon = () => {
        if(isConnecting) return <Icon type="loader" className="w-8 h-8 text-white animate-spin"/>
        return <Icon type="mic" className="w-8 h-8 text-white"/>
    }

    return (
        <button onClick={onClick} className={getButtonClasses()} aria-label={isIdle ? 'Start Listening' : 'Stop Listening'}>
            {isActive && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            )}
            {getIcon()}
        </button>
    );
};
