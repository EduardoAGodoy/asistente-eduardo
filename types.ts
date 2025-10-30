export enum ConversationParticipant {
  USER = 'user',
  BOT = 'bot',
  SYSTEM = 'system',
}

export interface TranscriptionTurn {
  participant: ConversationParticipant;
  text: string;
  timestamp: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  tasks: string[];
  lastUpdated: string;
}

export enum SessionState {
    IDLE = 'IDLE',
    CONNECTING = 'CONNECTING',
    LISTENING = 'LISTENING',
    PROCESSING = 'PROCESSING',
    SPEAKING = 'SPEAKING',
}

// Add Google API types for global scope
declare global {
    interface Window {
        webkitAudioContext: typeof AudioContext;
    }
}
