import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob } from "@google/genai";
import Card from './Card';
import { getApiKey } from '../services/geminiService';

interface LiveAstrologerScreenProps {
    onBack: () => void;
}

// Audio Decoding/Encoding Functions (as per guidelines)
function decode(base64: string) {
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

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
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

interface Transcript {
    id: string;
    text: string;
    source: 'user' | 'ai';
    isFinal: boolean;
}

const LiveAstrologerScreen: React.FC<LiveAstrologerScreenProps> = ({ onBack }) => {
    const [status, setStatus] = useState<'idle' | 'connecting' | 'live' | 'error'>('idle');
    const [transcripts, setTranscripts] = useState<Transcript[]>([]);
    const [error, setError] = useState<string | null>(null);

    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const audioResources = useRef<{
        stream: MediaStream | null;
        inputAudioContext: AudioContext | null;
        outputAudioContext: AudioContext | null;
        sources: Set<AudioBufferSourceNode>;
        scriptProcessor: ScriptProcessorNode | null;
        nextStartTime: number;
    }>({ stream: null, inputAudioContext: null, outputAudioContext: null, sources: new Set(), scriptProcessor: null, nextStartTime: 0 });

    const transcriptContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        transcriptContainerRef.current?.scrollTo({
            top: transcriptContainerRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }, [transcripts]);
    
    // Cleanup on component unmount
    useEffect(() => {
        return () => {
            sessionPromiseRef.current?.then(session => session.close());
            audioResources.current.stream?.getTracks().forEach(track => track.stop());
            audioResources.current.inputAudioContext?.close();
            audioResources.current.outputAudioContext?.close();
        };
    }, []);

    const handleStartSession = async () => {
        setStatus('connecting');
        setError(null);
        setTranscripts([]);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioResources.current.stream = stream;
            
            const ai = new GoogleGenAI({ apiKey: getApiKey() });
            
            // Setup audio contexts
            const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
            audioResources.current.inputAudioContext = new AudioCtor({ sampleRate: 16000 });
            audioResources.current.outputAudioContext = new AudioCtor({ sampleRate: 24000 });
            audioResources.current.nextStartTime = 0;
            audioResources.current.sources.clear();

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    systemInstruction: 'आप एक रहस्यमय और बुद्धिमान AI ज्योतिषी हैं। हिंदी में बोलें। उपयोगकर्ताओं के सवालों का ज्योतिषीय ज्ञान के साथ उत्तर दें, मार्गदर्शन और गहरी अंतर्दृष्टि प्रदान करें। अपनी प्रतिक्रियाएं संक्षिप्त और संवादात्मक रखें।',
                },
                callbacks: {
                    onopen: () => {
                        setStatus('live');
                        const inputCtx = audioResources.current.inputAudioContext;
                        if (!inputCtx) return;
                        
                        const source = inputCtx.createMediaStreamSource(stream);
                        const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
                        audioResources.current.scriptProcessor = scriptProcessor;

                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputCtx.destination);
                    },
                    onmessage: (message: LiveServerMessage) => {
                         handleServerMessage(message);
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error("Live session error:", e);
                        setError("एक कनेक्शन त्रुटि हुई।");
                        handleStopSession();
                    },
                    onclose: (e: CloseEvent) => {
                        handleStopSession(false); // Stop without trying to close again
                    },
                },
            });

        } catch (err) {
            console.error('Failed to start session:', err);
            setError("माइक्रोफ़ोन एक्सेस करने में विफल। कृपया अनुमति दें और पुनः प्रयास करें।");
            setStatus('error');
        }
    };
    
    const handleServerMessage = async (message: LiveServerMessage) => {
        const outputCtx = audioResources.current.outputAudioContext;
        if (message.serverContent?.inputTranscription) {
            const { text, isFinal } = message.serverContent.inputTranscription;
            setTranscripts(prev => {
                const last = prev[prev.length - 1];
                if (last?.source === 'user' && !last.isFinal) {
                    return [...prev.slice(0, -1), { ...last, text: last.text + text, isFinal }];
                }
                return [...prev, { id: `user-${Date.now()}`, text, source: 'user', isFinal }];
            });
        }
        if (message.serverContent?.outputTranscription) {
            const { text, isFinal } = message.serverContent.outputTranscription;
            setTranscripts(prev => {
                const last = prev[prev.length - 1];
                if (last?.source === 'ai' && !last.isFinal) {
                    return [...prev.slice(0, -1), { ...last, text: last.text + text, isFinal }];
                }
                return [...prev, { id: `ai-${Date.now()}`, text, source: 'ai', isFinal }];
            });
        }
        
        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
        if (base64Audio && outputCtx) {
            const res = audioResources.current;
            res.nextStartTime = Math.max(res.nextStartTime, outputCtx.currentTime);
            const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
            const source = outputCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputCtx.destination);
            source.addEventListener('ended', () => { res.sources.delete(source); });
            source.start(res.nextStartTime);
            res.nextStartTime += audioBuffer.duration;
            res.sources.add(source);
        }
        
        if (message.serverContent?.interrupted) {
            for (const source of audioResources.current.sources.values()) {
              source.stop();
              audioResources.current.sources.delete(source);
            }
            audioResources.current.nextStartTime = 0;
        }
    };


    const handleStopSession = (closeSession = true) => {
        if (closeSession) {
            sessionPromiseRef.current?.then(session => session.close());
        }
        audioResources.current.stream?.getTracks().forEach(track => track.stop());
        audioResources.current.scriptProcessor?.disconnect();
        audioResources.current.inputAudioContext?.close();
        audioResources.current.outputAudioContext?.close();
        
        // Reset refs
        sessionPromiseRef.current = null;
        audioResources.current = { stream: null, inputAudioContext: null, outputAudioContext: null, sources: new Set(), scriptProcessor: null, nextStartTime: 0 };
        
        setStatus('idle');
    };

    const handleBack = () => {
        if (status === 'live' || status === 'connecting') {
            handleStopSession();
        }
        onBack();
    };

    return (
        <Card className="animate-fade-in max-w-2xl mx-auto">
            <button onClick={handleBack} className="absolute top-6 left-6 text-purple-300 hover:text-white transition">&larr; वापस</button>
            <div className="text-center">
                <h2 className="text-3xl font-hindi font-bold mb-2">लाइव AI ज्योतिषी</h2>
                <p className="text-purple-300 mb-6">
                    {status === 'idle' && "AI ज्योतिषी से सीधे बात करें।"}
                    {status === 'connecting' && "कनेक्ट हो रहा है..."}
                    {status === 'live' && "लाइव: अब आप बोल सकते हैं!"}
                    {status === 'error' && "एक त्रुटि हुई"}
                </p>

                <div className={`relative w-32 h-32 mx-auto mb-6 bg-white/10 rounded-full flex items-center justify-center border-4 border-white/20 ${status === 'live' ? 'mic-icon-pulse' : ''}`}>
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                </div>
                
                <div 
                    ref={transcriptContainerRef}
                    className="h-64 bg-black/20 p-4 rounded-lg border border-white/20 text-left overflow-y-auto mb-6"
                >
                    {transcripts.map(t => (
                        <div key={t.id} className={`transcript-entry max-w-[85%] my-2 ${t.source === 'user' ? 'transcript-user' : 'transcript-ai'}`}>
                            <div className={`p-3 rounded-lg ${t.source === 'user' ? 'bg-purple-800/60' : 'bg-slate-700/60'}`}>
                                <p className="text-white whitespace-pre-wrap">{t.text}</p>
                            </div>
                        </div>
                    ))}
                    {transcripts.length === 0 && (
                        <div className="h-full flex items-center justify-center">
                             <p className="text-purple-300">बातचीत यहाँ दिखाई देगी...</p>
                        </div>
                    )}
                </div>

                {error && <p className="text-red-400 mb-4">{error}</p>}
                
                <button 
                    onClick={status === 'live' || status === 'connecting' ? () => handleStopSession() : handleStartSession}
                    disabled={status === 'connecting'}
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 ease-in-out text-xl disabled:opacity-60"
                >
                    {status === 'live' || status === 'connecting' ? 'सत्र समाप्त करें' : 'सत्र शुरू करें'}
                </button>
            </div>
        </Card>
    );
};

export default LiveAstrologerScreen;