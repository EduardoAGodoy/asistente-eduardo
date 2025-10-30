
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage } from '@google/genai';
import { Header } from './components/Header';
import { TranscriptionView } from './components/TranscriptionView';
import { ProjectsPanel } from './components/ProjectsPanel';
import { MicrophoneButton } from './components/MicrophoneButton';
import { StatusIndicator } from './components/StatusIndicator';
import { SaveInteractionModal } from './components/SaveInteractionModal';
import { GeminiService } from './services/geminiService';
import { SessionState, TranscriptionTurn, ConversationParticipant, Project } from './types';

// Código del AudioWorklet en memoria.
// Esto evita tener un archivo separado y previene posibles errores de carga.
const audioWorkletCode = `
/**
 * AudioWorkletProcessor para capturar y enviar audio en tiempo real.
 * Este procesador se ejecuta en un hilo separado del hilo principal de la UI,
 * lo que previene bloqueos y reduce la latencia.
 */
class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    // Tamaño del búfer de audio antes de enviarlo al hilo principal.
    // 1024 muestras a 16000Hz = 64ms de audio por paquete.
    // Un buen equilibrio entre latencia y eficiencia de la red.
    this.bufferSize = 1024;
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
  }

  /**
   * Se llama cada vez que hay un nuevo bloque de datos de audio disponible (generalmente 128 muestras).
   * @param {Float32Array[][]} inputs - Array de entradas de audio.
   */
  process(inputs) {
    const input = inputs[0];
    // Asegurarse de que hay un canal de audio de entrada.
    if (input && input.length > 0) {
      const inputChannel = input[0];
      
      // Llenar nuestro búfer personalizado con los datos entrantes.
      for (let i = 0; i < inputChannel.length; i++) {
        this.buffer[this.bufferIndex++] = inputChannel[i];
        
        // Una vez que el búfer está lleno, se envía al hilo principal.
        if (this.bufferIndex === this.bufferSize) {
          // Se envía una copia del búfer al hilo principal.
          // Si se enviara el búfer directamente, se transferiría y el worklet
          // perdería el acceso a él, causando errores.
          this.port.postMessage(this.buffer.slice(0));
          this.bufferIndex = 0; // Reiniciar el índice para el siguiente paquete.
        }
      }
    }
    // Devolver true para mantener vivo el procesador.
    return true;
  }
}

// Registrar el procesador para que pueda ser instanciado desde el hilo principal.
registerProcessor('audio-processor', AudioProcessor);
`;

const App: React.FC = () => {
    const [apiKeyError, setApiKeyError] = useState<string | null>(null);
    const [sessionState, setSessionState] = useState<SessionState>(SessionState.IDLE);
    const [transcriptionHistory, setTranscriptionHistory] = useState<TranscriptionTurn[]>([]);
    const [currentInput, setCurrentInput] = useState('');
    const [currentOutput, setCurrentOutput] = useState('');
    const [projects, setProjects] = useState<Project[]>([
        { id: '1', name: 'Lanzamiento Q3', description: 'Coordinar el lanzamiento de la nueva función.', tasks: [], lastUpdated: 'Ayer' },
        { id: '2', name: 'Vacaciones Familiares', description: 'Planificar viaje a la costa.', tasks: [], lastUpdated: 'Hace 3 días' },
    ]);
    const [showSaveModal, setShowSaveModal] = useState(false);

    const geminiServiceRef = useRef<GeminiService | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioWorkletNodeRef = useRef<AudioWorkletNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const geminiSessionRef = useRef<any>(null);

    const currentInputRef = useRef('');
    const currentOutputRef = useRef('');
    const transcriptionHistoryRef = useRef<TranscriptionTurn[]>([]);
    const sessionStateRef = useRef(sessionState);

    useEffect(() => { currentInputRef.current = currentInput; }, [currentInput]);
    useEffect(() => { currentOutputRef.current = currentOutput; }, [currentOutput]);
    useEffect(() => { transcriptionHistoryRef.current = transcriptionHistory; }, [transcriptionHistory]);
    useEffect(() => { sessionStateRef.current = sessionState; }, [sessionState]);

    // Cleanup AudioContext on unmount
    useEffect(() => {
        return () => {
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
        };
    }, []);
    
    const addSystemMessage = useCallback((text: string) => {
        setTranscriptionHistory(prev => [...prev, { participant: ConversationParticipant.SYSTEM, text, timestamp: new Date() }]);
    }, []);
    
    const handleGeminiMessage = useCallback((message: LiveServerMessage) => {
        if (message.serverContent) {
            if (message.serverContent.inputTranscription) {
                const text = message.serverContent.inputTranscription.text;
                setCurrentInput(prev => prev + text);
                if (sessionStateRef.current !== SessionState.PROCESSING && sessionStateRef.current !== SessionState.SPEAKING) {
                    setSessionState(SessionState.PROCESSING);
                }
            }
            if (message.serverContent.outputTranscription) {
                const text = message.serverContent.outputTranscription.text;
                setCurrentOutput(prev => prev + text);
                setSessionState(SessionState.SPEAKING);
            }
            if (message.serverContent.turnComplete) {
                const finalInput = currentInputRef.current;
                const finalOutput = currentOutputRef.current;

                setTranscriptionHistory(prev => {
                    const newHistory = [...prev];
                    if (finalInput.trim()) {
                       newHistory.push({ participant: ConversationParticipant.USER, text: finalInput, timestamp: new Date() });
                    }
                    if (finalOutput.trim()) {
                        newHistory.push({ participant: ConversationParticipant.BOT, text: finalOutput, timestamp: new Date() });
                    }
                    return newHistory;
                });
                
                setCurrentInput('');
                setCurrentOutput('');
                setSessionState(SessionState.LISTENING);
            }
        }

        if (message.toolCall && geminiServiceRef.current) {
             geminiServiceRef.current.handleToolCall(message.toolCall, transcriptionHistoryRef.current);
             const toolName = message.toolCall.functionCalls[0].name;
             addSystemMessage(`Ejecutando herramienta: ${toolName}...`);
        }
    }, [addSystemMessage]);

    useEffect(() => {
        if (!process.env.API_KEY) {
            console.error("Gemini API Key is not set.");
            setApiKeyError("Falta la clave de API de Gemini. Asegúrate de que esté configurada.");
            return;
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        geminiServiceRef.current = new GeminiService(ai, (session) => {
            geminiSessionRef.current = session;
        });
    }, []);

    const startAudioRecording = useCallback(async () => {
        let workletURL: string | null = null;
        try {
            if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                 audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
            }
            const audioContext = audioContextRef.current;
            if(audioContext.state === 'suspended') {
                await audioContext.resume();
            }
    
            const workletBlob = new Blob([audioWorkletCode], { type: 'application/javascript' });
            workletURL = URL.createObjectURL(workletBlob);
            await audioContext.audioWorklet.addModule(workletURL);
            
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
            mediaStreamSourceRef.current = audioContext.createMediaStreamSource(stream);
            
            audioWorkletNodeRef.current = new AudioWorkletNode(audioContext, 'audio-processor');
            
            audioWorkletNodeRef.current.port.onmessage = (event) => {
                geminiServiceRef.current?.sendAudio(event.data);
            };
            
            mediaStreamSourceRef.current.connect(audioWorkletNodeRef.current);
            audioWorkletNodeRef.current.connect(audioContext.destination); // Connect to destination to keep it alive
        } catch (error) {
            console.error("Error setting up audio recording:", error);
            addSystemMessage("Error al acceder al micrófono. Por favor, concede los permisos necesarios.");
            setSessionState(SessionState.IDLE);
        } finally {
            if (workletURL) {
                URL.revokeObjectURL(workletURL); // Liberar el objeto URL para limpiar memoria
            }
        }
    }, [addSystemMessage]);

    const stopAudioRecording = () => {
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        if (mediaStreamSourceRef.current) {
            mediaStreamSourceRef.current.disconnect();
            mediaStreamSourceRef.current = null;
        }
        if (audioWorkletNodeRef.current) {
             audioWorkletNodeRef.current.port.close();
             audioWorkletNodeRef.current.disconnect();
             audioWorkletNodeRef.current = null;
        }
    };
    
    const startConversation = useCallback(async () => {
        if (!geminiServiceRef.current) return;
        setSessionState(SessionState.CONNECTING);
        try {
            await geminiServiceRef.current.startSession(handleGeminiMessage);
            await startAudioRecording();
            setSessionState(SessionState.LISTENING);
            addSystemMessage("Sesión iniciada. ¿En qué puedo ayudarte?");
        } catch (error) {
            console.error("Error starting session:", error);
            setSessionState(SessionState.IDLE);
            addSystemMessage("Error al iniciar la sesión. Inténtalo de nuevo.");
        }
    }, [addSystemMessage, handleGeminiMessage, startAudioRecording]);

    const resetConversationState = () => {
        setTranscriptionHistory([]);
        setCurrentInput('');
        setCurrentOutput('');
    };

    const stopConversation = useCallback(async () => {
        stopAudioRecording();
        geminiSessionRef.current?.close();
        geminiSessionRef.current = null;
        setSessionState(SessionState.IDLE);
        geminiServiceRef.current?.stopPlayback();

        if (transcriptionHistoryRef.current.some(t => t.participant !== ConversationParticipant.SYSTEM)) {
           setShowSaveModal(true);
        } else {
            resetConversationState();
        }
    }, []);
    
    const handleMicClick = useCallback(async () => {
        if (sessionState === SessionState.IDLE) {
            await startConversation();
        } else {
            await stopConversation();
        }
    }, [sessionState, startConversation, stopConversation]);

    const handleSaveModalClose = async (shouldSave: boolean) => {
        setShowSaveModal(false);
        if (shouldSave) {
             addSystemMessage(`La función de guardar la conversación no está implementada.`);
        }
        resetConversationState();
    };

    if (apiKeyError) {
        return (
            <div className="bg-gray-900 text-white h-screen flex items-center justify-center text-center p-4">
                <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{apiKeyError}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 text-white h-screen flex flex-col font-sans">
            <Header />
            <main className="flex-grow flex overflow-hidden">
                <div className="flex-grow flex flex-col p-4">
                    <div className="flex-grow bg-gray-800/50 rounded-lg flex flex-col overflow-hidden shadow-inner">
                        <TranscriptionView history={transcriptionHistory} currentInput={currentInput} currentOutput={currentOutput} />
                    </div>
                    <div className="flex-shrink-0 pt-6 flex flex-col items-center justify-center">
                        <MicrophoneButton state={sessionState} onClick={handleMicClick} />
                        <StatusIndicator state={sessionState} />
                    </div>
                </div>
                <aside className="w-80 flex-shrink-0 p-4 hidden md:block">
                     <ProjectsPanel projects={projects} />
                </aside>
            </main>
             {showSaveModal && <SaveInteractionModal onClose={handleSaveModalClose} />}
        </div>
    );
};

export default App;
