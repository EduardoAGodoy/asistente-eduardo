
// Fix: Module '"@google/genai"' has no exported member 'LiveSession' or 'ToolCall'.
import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type, Blob } from '@google/genai';
import { TranscriptionTurn } from '../types';

// --- AUDIO HELPER FUNCTIONS ---

function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}


// --- FUNCTION DECLARATIONS ---

const functionDeclarations: FunctionDeclaration[] = [
    {
        name: 'searchWeb',
        parameters: {
            type: Type.OBJECT,
            description: 'Realiza una búsqueda en internet.',
            properties: {
                query: { type: Type.STRING, description: 'La pregunta o términos a buscar.' },
            },
            required: ['query'],
        }
    }
];

// --- GEMINI SERVICE CLASS ---

export class GeminiService {
    private ai: GoogleGenAI;
    // Fix: 'LiveSession' is not an exported member of '@google/genai'. Using 'any' as a workaround.
    private sessionPromise: Promise<any> | null = null;
    // Fix: 'LiveSession' is not an exported member of '@google/genai'. Using 'any' as a workaround.
    private onSessionCreated: (session: any) => void;

    // Audio Playback state
    private outputAudioContext: AudioContext;
    private nextStartTime = 0;
    private audioSources = new Set<AudioBufferSourceNode>();


    // Fix: 'LiveSession' is not an exported member of '@google/genai'. Using 'any' as a workaround.
    constructor(ai: GoogleGenAI, onSessionCreated: (session: any) => void) {
        this.ai = ai;
        this.onSessionCreated = onSessionCreated;
        this.outputAudioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
    }

    public async startSession(onMessage: (message: LiveServerMessage) => void): Promise<void> {
        this.sessionPromise = this.ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: () => console.log('Session opened.'),
                onmessage: (message: LiveServerMessage) => {
                    onMessage(message);
                    this.handleAudioPlayback(message);
                },
                onerror: (e: ErrorEvent) => console.error('Session error:', e),
                onclose: (e: CloseEvent) => console.log('Session closed.'),
            },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                systemInstruction: 'Eres Claudia, una asistente de IA personal, amigable y muy eficiente. Tu objetivo es ayudar al usuario a organizar su vida digital y personal. Responde en español. Sé concisa y proactiva. Al dar asistencia psicológica, sé empática y ofrece estructurar los pensamientos del usuario en proyectos o tareas manejables.',
                inputAudioTranscription: {},
                outputAudioTranscription: {},
                tools: [{ functionDeclarations: functionDeclarations }],
            },
        });
        
        const session = await this.sessionPromise;
        this.onSessionCreated(session);
    }
    
    private async handleAudioPlayback(message: LiveServerMessage) {
        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
        if (base64Audio) {
            this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
            const audioBuffer = await decodeAudioData(decode(base64Audio), this.outputAudioContext, 24000, 1);
            const source = this.outputAudioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(this.outputAudioContext.destination);
            source.addEventListener('ended', () => {
                this.audioSources.delete(source);
            });
            source.start(this.nextStartTime);
            this.nextStartTime += audioBuffer.duration;
            this.audioSources.add(source);
        }

        if (message.serverContent?.interrupted) {
            this.stopPlayback();
        }
    }
    
    public stopPlayback() {
        for (const source of this.audioSources.values()) {
            source.stop();
        }
        this.audioSources.clear();
        this.nextStartTime = 0;
    }

    public sendAudio(audioData: Float32Array) {
        if (!this.sessionPromise) return;
        const pcmBlob = createBlob(audioData);
        this.sessionPromise.then(session => {
            session.sendRealtimeInput({ media: pcmBlob });
        }).catch(err => console.error("Error sending audio:", err));
    }
    
    // Fix: 'ToolCall' is not an exported member of '@google/genai'. Using 'any' as a workaround.
    public async handleToolCall(toolCall: any, transcriptionHistory: TranscriptionTurn[]) {
        if (!this.sessionPromise) return;

        for (const fc of toolCall.functionCalls) {
            console.log(`Tool call received: ${fc.name}`, fc.args);
            
            let result: string;
            try {
                switch(fc.name) {
                    case 'searchWeb':
                         result = `Resultado simulado de búsqueda web para "${fc.args.query}": El primer resultado indica que...`;
                        break;
                    default:
                        result = `Herramienta ${fc.name} no reconocida.`;
                }
            } catch (error: any) {
                console.error(`Error executing tool ${fc.name}:`, error);
                result = `Lo siento, hubo un error al usar la herramienta ${fc.name}. El error fue: ${error.message || 'Error desconocido'}`;
            }

            const session = await this.sessionPromise;
            session.sendToolResponse({
                functionResponses: {
                    id: fc.id,
                    name: fc.name,
                    response: { result: result },
                }
            });
        }
    }
}
