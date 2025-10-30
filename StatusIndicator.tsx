
import React from 'react';
import { SessionState } from '../types';

interface StatusIndicatorProps {
    state: SessionState;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ state }) => {
    const statusConfig = {
        [SessionState.IDLE]: { text: 'Inactivo', color: 'bg-gray-500' },
        [SessionState.CONNECTING]: { text: 'Conectando...', color: 'bg-yellow-500 animate-pulse' },
        [SessionState.LISTENING]: { text: 'Escuchando...', color: 'bg-green-500 animate-pulse' },
        [SessionState.PROCESSING]: { text: 'Procesando...', color: 'bg-blue-500 animate-pulse' },
        [SessionState.SPEAKING]: { text: 'Hablando...', color: 'bg-purple-500' },
    };

    const { text, color } = statusConfig[state] || statusConfig[SessionState.IDLE];

    return (
        <div className="flex items-center gap-2 mt-2">
            <span className={`w-3 h-3 rounded-full ${color}`}></span>
            <span className="text-sm text-gray-400">{text}</span>
        </div>
    );
};
