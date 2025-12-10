import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { Reading, DivinationType } from '../types';
import Card from './Card';
import { generateSpeech } from '../services/geminiService';
import { useAppContext } from '../App';

// Audio decoding functions
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
): Promise<AudioBuffer> {
  const sampleRate = 24000;
  const numChannels = 1;
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

// Creates a WAV file blob from raw PCM data.
const pcmToWavBlob = (pcmData: Uint8Array, sampleRate: number, numChannels: number, bitsPerSample: number): Blob => {
    const dataSize = pcmData.length;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    const writeString = (offset: number, str: string) => {
        for (let i = 0; i < str.length; i++) {
            view.setUint8(offset + i, str.charCodeAt(i));
        }
    };

    const blockAlign = (numChannels * bitsPerSample) / 8;
    const byteRate = sampleRate * blockAlign;

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // 1 = PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    const pcmView = new Uint8Array(buffer, 44);
    pcmView.set(pcmData);
    
    return new Blob([view], { type: 'audio/wav' });
};


interface ResultDisplayProps {
    reading: Reading | null;
    divinationType: DivinationType | null;
    onReset: () => void;
    onSave: () => void;
    isSaved: boolean;
}

interface ResultSectionProps {
    title: string;
    content: string;
    icon: string;
    children?: React.ReactNode;
    isSpeakable?: boolean;
    sectionId: string;
    onSpeak: (sectionId: string, content: string) => void;
    activeAudio: string | null;
    isAudioLoading: boolean;
}

const ImageWithLoader: React.FC<{
    src: string;
    alt: string;
    className?: string;
    placeholderClassName?: string;
}> = ({ src, alt, className, placeholderClassName }) => {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <>
            {isLoading && (
                <div className={`flex justify-center items-center bg-black/20 ${placeholderClassName || ''}`}>
                    <div className="image-loading-container">
                        <div className="pulse-ring"></div>
                        <div className="pulse-ring"></div>
                        <div className="pulse-ring"></div>
                        <span className="text-4xl" role="img" aria-label="Loading image">🖼️</span>
                    </div>
                </div>
            )}
            <img
                src={src}
                alt={alt}
                className={`${className || ''} ${isLoading ? 'hidden' : 'block'}`}
                onLoad={() => setIsLoading(false)}
                onError={() => setIsLoading(false)} // Also stop loading on error
            />
        </>
    );
};

const ResultSection: React.FC<ResultSectionProps> = ({ title, content, icon, children, isSpeakable, sectionId, onSpeak, activeAudio, isAudioLoading }) => {
    const isActive = activeAudio === sectionId;
    const isLoading = isActive && isAudioLoading;
    const isPlaying = isActive && !isAudioLoading;

    return (
        <div className="mb-6">
            <div className="flex items-center justify-between gap-2">
                <h3 className="flex items-center gap-3 text-2xl font-hindi font-bold text-purple-300 mb-2">
                    <span className="text-3xl">{icon}</span>
                    {title}
                </h3>
                 {isSpeakable && content && (
                    <button
                        onClick={() => onSpeak(sectionId, content)}
                        disabled={isAudioLoading && !isActive}
                        className="w-10 h-10 flex-shrink-0 bg-white/10 rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-purple-500/30 transition-all duration-300 disabled:opacity-50"
                        aria-label={isPlaying ? "Stop" : "Speak"}
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                        ) : isPlaying ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 10h6v4H9z" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                            </svg>
                        )}
                    </button>
                )}
            </div>
            {content && <p className="text-lg text-white/90 whitespace-pre-wrap">{content}</p>}
            {children}
        </div>
    );
};

const CodeSnippet: React.FC<{ file: string; code: string; language: string }> = ({ file, code, language }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    return (
        <div className="mb-6 bg-black/30 rounded-lg border border-white/20 overflow-hidden">
            <div className="flex justify-between items-center bg-white/10 px-4 py-2">
                <p className="font-mono text-purple-300">{file}</p>
                <button onClick={handleCopy} className="px-3 py-1 bg-white/10 rounded-md text-sm text-white hover:bg-white/20 transition">
                    {isCopied ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <pre className="p-4 text-sm text-left overflow-x-auto">
                <code className={`language-${language}`}>{code}</code>
            </pre>
        </div>
    );
};


const getTitlesForType = (type: DivinationType | null) => {
    if (type === DivinationType.TRIKAL_GYAN) {
        return {
            main: 'ज्ञान',
            past: 'आपका अतीत',
            present: 'आपका वर्तमान',
            future: 'आपका भविष्य',
            resetButton: 'पुनः प्रयास करें',
            icons: ['📜', '🧘', '✨']
        };
    }
    if (type === DivinationType.AI_CALCULATOR) {
        return {
            main: 'AI Calculator',
            past: 'समाधान के चरण',
            present: 'अंतिम उत्तर',
            future: 'निष्कर्ष',
            resetButton: 'नई गणना करें',
            icons: ['📝', '✅', '💡']
        };
    }
    if (type === DivinationType.ROUTE_PLANNER) {
        return {
            main: 'मार्ग योजना',
            past: 'मार्ग सारांश',
            present: 'दूरी और समय',
            future: 'दिशा-निर्देश',
            resetButton: 'नई खोज करें',
            icons: ['📝', '⏱️', '🧭']
        };
    }
    if (type === DivinationType.OBJECT_COUNTER) {
        return {
            main: 'गिनती का परिणाम',
            past: 'वस्तु',
            present: 'कुल गिनती',
            future: 'सारांश',
            resetButton: 'नई गिनती करें',
            icons: ['🧐', '🔢', '📝']
        };
    }
    if (type === DivinationType.YOGA_GUIDE_HINDI) {
        return {
            main: '',
            past: 'सुबह का सत्र',
            present: 'मुख्य आसन और प्राणायाम',
            future: 'शाम का सत्र और प्रेरणा',
            resetButton: 'दूसरा दिन चुनें',
            icons: ['☀️', '🧘‍♀️', '🌙']
        };
    }
    if (type === DivinationType.PRODUCT_SCANNER) {
        return {
            main: 'Product Scan',
            past: 'Object Description',
            present: 'Estimated Dimensions',
            future: 'Potential Uses',
            resetButton: 'नया उत्पाद स्कैन करें',
            icons: ['📦', '📏', '💡']
        };
    }
    if (type === DivinationType.PILGRIMAGE) {
        return {
            main: 'Details',
            past: 'History & Significance',
            present: 'Current Form & Story',
            future: 'Spiritual Guidance',
            resetButton: 'नई खोज करें',
            icons: ['📜', '🏛️', '🕊️']
        };
    }
    if (type === DivinationType.ZODIAC) {
        return {
            main: 'Zodiac Reading',
            past: 'Nature & Personality',
            present: 'Positive Traits & Strengths',
            future: 'Challenges & Areas for Growth',
            resetButton: 'नई राशि चुनें',
            icons: ['👤', '✨', '💪']
        };
    }
    if (type === DivinationType.DAILY_HOROSCOPE) {
        return {
            main: 'Daily Horoscope',
            past: 'Theme of the Day',
            present: 'Detailed Horoscope',
            future: 'Advice for the Day',
            resetButton: 'नया भविष्यफल देखें',
            icons: ['☀️', '🔍', '💡']
        };
    }
     if (type === DivinationType.HOROSCOPE) {
        return {
            main: 'Horoscope',
            past: 'Overview & Main Theme',
            present: 'Detailed Horoscope',
            future: 'Advice & Remedies',
            resetButton: 'नया भविष्यफल देखें',
            icons: ['📅', '🔍', '💡']
        };
    }
    if (type === DivinationType.DAILY_FORTUNE_CARD) {
        return {
            main: 'Fortune Card',
            past: 'Theme of the Day',
            present: 'Fortune for Today',
            future: 'Mantra for the Day',
            resetButton: 'नई भविष्यवाणी करें',
            icons: ['🌟', '🥠', '🧘']
        };
    }
    if (type === DivinationType.DREAM) {
        return {
            main: 'Dream Interpretation',
            past: 'Symbolism of the Dream',
            present: 'Connection to Current Life',
            future: 'Guidance for the Future',
            resetButton: 'नया स्वप्न दर्ज करें',
            icons: ['📖', '🧘', '🧭']
        };
    }
    if (type === DivinationType.TRAVEL) {
        return {
            main: 'Travel Forecast',
            past: 'Pre-Journey Thoughts',
            present: 'During the Journey',
            future: 'Outcome of the Journey',
            resetButton: 'नई यात्रा देखें',
            icons: ['🎒', '✈️', '✅']
        };
    }
     if (type === DivinationType.TRAIN_JOURNEY) {
        return {
            main: 'Train Journey Details',
            past: 'Route Information',
            present: 'List of Trains',
            future: 'Travel Tips & Ticket Price',
            resetButton: 'नई यात्रा खोजें',
            icons: ['📜', '🚂', '💰']
        };
    }
    if (type === DivinationType.MOLE) {
        return {
            main: 'Mole Astrology',
            past: 'General Meaning of the Mole',
            present: 'Benefits (Fayde)',
            future: 'Harms (Nuksan)',
            resetButton: 'नए तिल का विचार करें',
            icons: ['📖', '✅', '❌']
        };
    }
    if (type === DivinationType.LOVE_RELATIONSHIP) {
        return {
            main: 'Love Relationship Analysis',
            past: 'Past of the Relationship',
            present: 'Current Situation',
            future: 'Future Possibilities',
            resetButton: 'नया प्रश्न पूछें',
            icons: ['🌱', '💖', '✨']
        };
    }
    if (type === DivinationType.MARRIAGE_COMPATIBILITY) {
        return {
            main: 'Marriage Compatibility Report',
            past: 'Core Compatibility & Guna Milan',
            present: 'Strengths & Weaknesses of the Union',
            future: 'Future & Remedies',
            resetButton: 'नई जांच करें',
            icons: ['📜', '💑', '✨']
        };
    }
    if (type === DivinationType.LOVE_COMPATIBILITY) {
        return {
            main: 'Love Compatibility Report',
            past: 'Basis of Attraction',
            present: 'Current Relationship',
            future: 'Future Potential',
            resetButton: 'नई जांच करें',
            icons: ['💕', '📊', '💖']
        };
    }
     if (type === DivinationType.TAROT) {
        return {
            main: 'Reading',
            past: 'Your Past',
            present: 'Your Present',
            future: 'Your Future',
            resetButton: 'नया कार्ड निकालें',
            icons: ['📜', '🔮', '✨']
        };
    }
    if (type === DivinationType.JANAM_KUNDLI) {
        return {
            main: 'Kundli Analysis',
            past: 'Personality & Planetary Positions',
            present: 'Current Dasha & Effects',
            future: 'Predictions & Remedies',
            resetButton: 'नई कुंडली बनाएं',
            icons: ['👤', '⏳', '✨']
        };
    }
    if (type === DivinationType.SEASONAL_FOOD) {
        return {
            main: 'Food Guide',
            past: 'What to Eat',
            present: 'What to Avoid',
            future: 'General Health Tips',
            resetButton: 'दूसरा महीना चुनें',
            icons: ['🥗', '🚫', '❤️']
        };
    }
    if (type === DivinationType.ANG_SPHURAN) {
        return {
            main: 'Body Twitching Results',
            past: 'General Meaning (Male-Female)',
            present: 'Auspicious Results',
            future: 'Inauspicious Results',
            resetButton: 'नया अंग दर्ज करें',
            icons: ['📖', '👍', '👎']
        };
    }
    if (type === DivinationType.SNEEZING) {
        return {
            main: 'Sneeze Interpretation',
            past: 'General Meaning of Sneeze',
            present: 'Beneficial Results',
            future: 'Harmful Results',
            resetButton: 'नई छींक का विचार करें',
            icons: ['🤧', '✅', '❌']
        };
    }
    if (type === DivinationType.BUSINESS_ASTROLOGY) {
        return {
            main: 'Business Astrology Analysis',
            past: 'Your Business Potential',
            present: 'Suitable Business Sectors',
            future: 'Tips for Success',
            resetButton: 'नई गणना करें',
            icons: ['👤', '💼', '💡']
        };
    }
    if (type === DivinationType.FOOD_COMBINATION) {
        return {
            main: 'Food Combination Analysis',
            past: 'What to Eat Together',
            present: 'What Not to Eat Together',
            future: 'General Health Tips',
            resetButton: 'नई सूची जांचें',
            icons: ['✅', '❌', '❤️']
        };
    }
    if (type === DivinationType.RELIGIOUS_RITUALS) {
        return {
            main: 'Religious Information',
            past: 'History & Significance',
            present: 'Method / Text',
            future: 'Benefits & Spiritual Gain',
            resetButton: 'नई खोज करें',
            icons: ['📜', '📖', '✨']
        };
    }
    if (type === DivinationType.PRASHNA_PARIKSHA) {
        return {
            main: 'Analysis',
            past: 'Context of the Past',
            present: 'Current Situation',
            future: 'Indication for the Future',
            resetButton: 'नया प्रश्न पूछें',
            icons: ['📜', '🤔', '✨']
        };
    }
     if (type === DivinationType.PRASHNA_CHAKRA) {
        return {
            main: 'Answer',
            past: 'Your Question',
            present: "The Chakra's Answer",
            future: 'Guidance',
            resetButton: 'नया प्रश्न पूछें',
            icons: ['❓', '☸️', '💡']
        };
    }
    if (type === DivinationType.FAMOUS_PLACE_TRAVEL) {
        return {
            main: 'Travel Information',
            past: 'History & Significance of the Place',
            present: 'Travel Information',
            future: 'Tips & Advice',
            resetButton: 'नई जगह खोजें',
            icons: ['📜', '🗺️', '💡']
        };
    }
    if (type === DivinationType.ENGLISH_GURU) {
        return {
            main: 'Analysis',
            past: 'English Translation',
            present: 'Grammar Explanation',
            future: 'Vocabulary and Tips',
            resetButton: 'नया वाक्य अनुवाद करें',
            icons: ['🇬🇧', '📖', '💡']
        };
    }
    if (type === DivinationType.SCAN_TRANSLATE) {
        return {
            main: 'Translation Result',
            past: 'Original Text',
            present: 'Translated Text',
            future: 'Notes',
            resetButton: 'नया स्कैन करें',
            icons: ['📝', '🌐', '💡']
        };
    }
    if (type === DivinationType.TEXT_TO_IMAGE) {
        return {
            main: 'Image',
            past: 'Description',
            present: 'Your Prompt',
            future: 'Next Steps',
            resetButton: 'नया चित्र बनाएं',
            icons: ['🖼️', '✍️', '💡']
        };
    }
    if (type === DivinationType.STORY_TO_IMAGES) {
        return {
            main: 'Images',
            past: 'आपकी कहानी',
            present: 'कहानी के चित्र',
            future: 'अगले कदम',
            resetButton: 'नई कहानी से चित्र बनाएं',
            icons: ['📖', '🖼️', '💡']
        };
    }
    if (type === DivinationType.TEXT_TO_VOICE) {
        return {
            main: 'Voice Generator',
            past: 'Your Text',
            present: 'Generated Audio',
            future: 'Next Steps',
            resetButton: 'नया ऑडियो बनाएं',
            icons: ['✍️', '🔊', '💡']
        };
    }
    if (type === DivinationType.STORY_TO_VIDEO) {
        return {
            main: 'Story Video',
            past: 'Your Script',
            present: 'Generated Video',
            future: 'Next Steps',
            resetButton: 'नया वीडियो बनाएं',
            icons: ['📜', '🎬', '💡']
        };
    }
     if (type === DivinationType.IMAGE_TO_VIDEO) {
        return {
            main: 'Video',
            past: 'Your Original Image',
            present: 'Generated Video',
            future: 'Next Steps',
            resetButton: 'नया वीडियो बनाएं',
            icons: ['🖼️', '🎬', '💡']
        };
    }
    if (type === DivinationType.VASTU_SHASTRA) {
        return {
            main: 'Vastu Analysis',
            past: 'Vastu Principles',
            present: 'Analysis of Your Situation',
            future: 'Suggestions & Remedies',
            resetButton: 'नया प्रश्न पूछें',
            icons: ['📜', '🏡', '💡']
        };
    }
    if (type === DivinationType.AI_FACE_READING) {
        return {
            main: 'Face Analysis',
            past: 'Personality & Nature',
            present: 'Strengths & Weaknesses',
            future: 'Potential & Guidance',
            resetButton: 'नया चेहरा विश्लेषण करें',
            icons: ['👤', '💪', '💡']
        };
    }
     if (type === DivinationType.AI_TIME_MACHINE) {
        return {
            main: 'Time Machine',
            past: 'Based on your current image',
            present: 'Your future in 10 years',
            future: 'Guidance',
            resetButton: 'फिर से कोशिश करें',
            icons: ['👤', '⏳', '💡']
        };
    }
     if (type === DivinationType.AI_FUTURE_GENERATOR) {
        return {
            main: 'Prediction',
            past: 'Origin of the Question',
            present: 'Current Energies',
            future: 'Guidance for the Future',
            resetButton: 'नया प्रश्न पूछें',
            icons: ['❓', '⚡', '🌟']
        };
    }
    if (type === DivinationType.CODE_INSPECTOR) {
        return {
            main: 'Code Inspector',
            past: '',
            present: '',
            future: '',
            resetButton: 'दूसरा टूल जांचें',
            icons: ['','','']
        };
    }
    return {
        main: 'Reading',
        past: 'Your Past',
        present: 'Your Present',
        future: 'Your Future',
        resetButton: 'नई भविष्यवाणी करें',
        icons: ['📜', '🔮', '✨']
    };
};

const dummyComments = [
    { author: 'आकाश', text: 'वाह, यह बहुत सटीक था! धन्यवाद!' },
    { author: 'प्रिया', text: 'यह बहुत दिलचस्प है। मुझे सोचने के लिए बहुत कुछ मिला।' }
];

const ResultDisplay: React.FC<ResultDisplayProps> = ({ reading, divinationType, onReset, onSave, isSaved }) => {
    const { isAuthenticated } = useAppContext();
    const [activeAudio, setActiveAudio] = useState<string | null>(null);
    const [isAudioLoading, setIsAudioLoading] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const [audioDownloadUrl, setAudioDownloadUrl] = useState<string | null>(null);
    const [storyImages, setStoryImages] = useState<string[] | null>(null);
    
    // Like, Share, Comment State
    const [isLiked, setIsLiked] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<{ author: string; text: string }[]>([]);
    const [newComment, setNewComment] = useState('');


    useEffect(() => {
        return () => {
            // Cleanup on component unmount
            if (audioSourceRef.current) {
                audioSourceRef.current.stop();
            }
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
            if (audioDownloadUrl) {
                URL.revokeObjectURL(audioDownloadUrl);
            }
        };
    }, [audioDownloadUrl]);
    
    useEffect(() => {
        if (reading?.audioBase64) {
             const rawPcmData = decode(reading.audioBase64);
             const wavBlob = pcmToWavBlob(rawPcmData, 24000, 1, 16);
             const url = URL.createObjectURL(wavBlob);
             setAudioDownloadUrl(url);
        }
    }, [reading?.audioBase64]);

    useEffect(() => {
        if (divinationType === DivinationType.STORY_TO_IMAGES && reading?.present) {
            try {
                const images = JSON.parse(reading.present);
                if (Array.isArray(images) && images.every(item => typeof item === 'string')) {
                    setStoryImages(images);
                }
            } catch (e) {
                console.error("Failed to parse story images:", e);
                setStoryImages(null);
            }
        } else {
            setStoryImages(null);
        }
    }, [reading, divinationType]);

    const handleSpeak = async (sectionId: string, content: string) => {
        if (activeAudio === sectionId && audioSourceRef.current) {
            audioSourceRef.current.stop();
            setActiveAudio(null);
            return;
        }

        if (isAudioLoading) return;

        setActiveAudio(sectionId);
        setIsAudioLoading(true);

        try {
            const base64Audio = await generateSpeech(content);
            if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                audioContextRef.current = new AudioContext({ sampleRate: 24000 });
            }
            
            const audioBuffer = await decodeAudioData(decode(base64Audio), audioContextRef.current);
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            
            source.onended = () => {
                if (activeAudio === sectionId) {
                     setActiveAudio(null);
                }
                audioSourceRef.current = null;
            };

            source.start();
            audioSourceRef.current = source;

        } catch (err) {
            console.error("Failed to play audio:", err);
            alert("ऑडियो चलाने में विफल रहा।");
            setActiveAudio(null);
        } finally {
            setIsAudioLoading(false);
        }
    };

    const handleShare = async () => {
        if (!reading || !divinationType) return;
        const titles = getTitlesForType(divinationType);
        const cardInfo = divinationType === DivinationType.TAROT && reading.cardName ? `My Card: ${reading.cardName}\n\n` : '';
        const textToShare = `My ${divinationType} ${titles.main}:\n${cardInfo}\n\n${titles.icons[0]} ${titles.past}\n${reading.past}\n---\n${titles.icons[1]} ${titles.present}\n${divinationType === DivinationType.STORY_TO_VIDEO || divinationType === DivinationType.IMAGE_TO_VIDEO ? 'See the generated video.' : reading.present}\n---\n${titles.icons[2]} ${titles.future}\n${reading.future}\n---\nGet your own reading from Ok shoppy Store 9.0!`.trim();

        const shareData: ShareData = {
            title: `My ${divinationType} ${titles.main}`,
            text: textToShare,
            url: window.location.href,
        };

        try {
            let fileToShare: File | null = null;
            const fileUrl = reading.videoUrl || reading.imageUrl;

            if (fileUrl) {
                const response = await fetch(fileUrl);
                const blob = await response.blob();
                const fileType = blob.type;
                const extension = fileType.split('/')[1];
                fileToShare = new File([blob], `bhavishya-media.${extension}`, { type: fileType });
            }

            if (fileToShare && navigator.canShare && navigator.canShare({ files: [fileToShare] })) {
                shareData.files = [fileToShare];
            }

            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                throw new Error('Web Share API not supported');
            }
        } catch (err) {
            console.error('Share failed, falling back to clipboard:', err);
            navigator.clipboard.writeText(`${textToShare}\n\n${window.location.href}`).then(() => {
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2500);
            }).catch(clipboardErr => {
                console.error('Could not copy text: ', clipboardErr);
                alert("साझा करने या कॉपी करने में विफल।");
            });
        }
    };
    
    const handlePostComment = (e: FormEvent) => {
        e.preventDefault();
        if (newComment.trim()) {
            setComments(prev => [...prev, { author: 'आप', text: newComment.trim() }]);
            setNewComment('');
        }
    };

    if (!reading) {
        return (
            <Card className="text-center animate-fade-in">
                <h2 className="text-2xl font-bold text-red-400">कोई परिणाम नहीं</h2>
                <p className="text-lg mt-4">क्षमा करें, हम आपके लिए कोई परिणाम प्राप्त नहीं कर सके।</p>
                <button
                    onClick={onReset}
                    className="mt-8 px-6 py-2 bg-purple-600 text-white font-bold rounded-full hover:bg-purple-700 transition"
                >
                    पुनः प्रयास करें
                </button>
            </Card>
        );
    }
    
    if (divinationType === DivinationType.CODE_INSPECTOR && reading.codeSnippets) {
        return (
            <Card className="animate-fade-in max-w-4xl mx-auto">
                <h2 className="text-4xl font-hindi font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                    कोड इंस्पेक्टर
                </h2>
                {reading.codeSnippets.map((snippet, index) => (
                    <CodeSnippet key={index} {...snippet} />
                ))}
                <div className="text-center mt-8">
                    <button
                        onClick={onReset}
                        className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 ease-in-out text-lg"
                    >
                        दूसरा टूल जांचें
                    </button>
                </div>
            </Card>
        );
    }

    const titles = getTitlesForType(divinationType);
    const mainTitle = divinationType === DivinationType.YOGA_GUIDE_HINDI 
        ? `${divinationType} - दिन ${reading.past.match(/\d+/)?.[0] || ''}` 
        : `Your ${divinationType} ${titles.main}`;

    return (
        <Card className="animate-fade-in">
            <h2 className="text-4xl font-hindi font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                {mainTitle}
            </h2>
            
             {divinationType === DivinationType.ROUTE_PLANNER && reading.startLocation && reading.endLocation && (
                <div className="my-6">
                    <iframe
                        className="w-full h-96 border-0 rounded-lg shadow-lg"
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(reading.startLocation)} to ${encodeURIComponent(reading.endLocation)}&output=embed`}
                        loading="lazy"
                        allowFullScreen
                    ></iframe>
                     <div className="text-center mt-4">
                        <a 
                            href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(reading.startLocation)}&destination=${encodeURIComponent(reading.endLocation)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-6 py-3 bg-blue-600 text-white font-bold rounded-full shadow-lg hover:bg-blue-700 transition"
                        >
                            Google Maps में खोलें
                        </a>
                    </div>
                </div>
            )}


            {divinationType === DivinationType.LOVE_COMPATIBILITY && reading.compatibilityPercentage !== undefined && (
                <div className="my-6 flex flex-col items-center">
                    <h3 className="text-2xl font-hindi font-bold text-white mb-4">आपकी अनुकूलता</h3>
                    <div className="relative w-40 h-40">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle className="text-white/10" strokeWidth="8" stroke="currentColor" fill="transparent" r="42" cx="50" cy="50" />
                            <circle
                                className="text-pink-400"
                                strokeWidth="8"
                                strokeDasharray={2 * Math.PI * 42}
                                strokeDashoffset={(2 * Math.PI * 42) * (1 - reading.compatibilityPercentage! / 100)}
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="transparent"
                                r="42"
                                cx="50"
                                cy="50"
                                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-bold text-white">{reading.compatibilityPercentage}%</span>
                        </div>
                    </div>
                </div>
            )}

            {divinationType === DivinationType.TAROT && reading.cardName && (
                <div className="text-center my-6">
                    <h3 className="text-3xl font-bold font-hindi text-white mb-4">{reading.cardName}</h3>
                    {reading.imageUrl && (
                        <ImageWithLoader
                            src={reading.imageUrl}
                            alt={`Tarot card for ${reading.cardName}`}
                            className="mx-auto rounded-lg shadow-2xl w-full max-w-xs"
                            placeholderClassName="mx-auto rounded-lg w-full max-w-xs aspect-[9/16]"
                        />
                    )}
                </div>
            )}
            
            {divinationType !== DivinationType.TAROT && reading.imageUrl && !storyImages && (
                 <ImageWithLoader
                    src={reading.imageUrl}
                    alt="Generated"
                    className="my-6 mx-auto rounded-lg shadow-2xl w-full max-w-lg"
                    placeholderClassName="my-6 mx-auto rounded-lg w-full max-w-lg aspect-square"
                />
            )}
            
            {reading.videoUrl && (
                <div className="my-6 mx-auto rounded-lg shadow-2xl w-full max-w-lg bg-black/30">
                     <video src={reading.videoUrl} controls autoPlay className="w-full h-full rounded-lg" />
                     {reading.videoDownloadUrl && (
                        <div className="text-center p-2">
                             <a 
                                href={reading.videoDownloadUrl}
                                download={`ok-future-zone-${divinationType}.mp4`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block px-4 py-2 bg-purple-600/80 text-white text-sm font-semibold rounded-full hover:bg-purple-600 transition-colors"
                            >
                                वीडियो डाउनलोड करें
                            </a>
                        </div>
                     )}
                </div>
            )}
            
            {reading.audioBase64 && (
                 <div className="my-6 mx-auto rounded-lg shadow-2xl w-full max-w-lg bg-black/30 p-4">
                     <audio src={audioDownloadUrl || undefined} controls className="w-full" />
                      {audioDownloadUrl && (
                        <div className="text-center p-2 mt-2">
                             <a 
                                href={audioDownloadUrl}
                                download={`ok-future-zone-${divinationType}.wav`}
                                className="inline-block px-4 py-2 bg-purple-600/80 text-white text-sm font-semibold rounded-full hover:bg-purple-600 transition-colors"
                            >
                                ऑडियो डाउनलोड करें
                            </a>
                        </div>
                     )}
                </div>
            )}

            <ResultSection title={titles.past} content={reading.past} icon={titles.icons[0]} isSpeakable={!reading.audioBase64} sectionId="past" onSpeak={handleSpeak} activeAudio={activeAudio} isAudioLoading={isAudioLoading} />
            <div className="border-t border-white/20 my-6"></div>

            {storyImages ? (
                <div className="mb-6">
                    <h3 className="flex items-center gap-3 text-2xl font-hindi font-bold text-purple-300 mb-4">
                        <span className="text-3xl">{titles.icons[1]}</span>
                        {titles.present}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {storyImages.map((imgSrc, index) => (
                            <div key={index} className="bg-black/20 p-2 rounded-lg border border-white/20">
                                 <ImageWithLoader
                                    src={imgSrc}
                                    alt={`Story scene ${index + 1}`}
                                    className="w-full rounded-md shadow-lg"
                                    placeholderClassName="w-full rounded-md aspect-[16/9]"
                                />
                                <p className="text-center font-semibold text-purple-200 mt-2">चरण {index + 1}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <ResultSection title={titles.present} content={reading.present} icon={titles.icons[1]} isSpeakable={!reading.audioBase64} sectionId="present" onSpeak={handleSpeak} activeAudio={activeAudio} isAudioLoading={isAudioLoading} />
            )}

            <div className="border-t border-white/20 my-6"></div>
            <ResultSection title={titles.future} content={reading.future} icon={titles.icons[2]} isSpeakable={!reading.audioBase64} sectionId="future" onSpeak={handleSpeak} activeAudio={activeAudio} isAudioLoading={isAudioLoading} />

            <div className="mt-8 pt-6 border-t border-white/20 flex items-center justify-around">
                <button onClick={() => setIsLiked(!isLiked)} className={`flex flex-col items-center gap-1 text-purple-300 hover:text-white transition-colors duration-200 ${isLiked ? 'like-btn-liked' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 transition-transform duration-300 ${isLiked ? 'like-animation' : ''}`} viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    <span className="text-xs font-semibold">पसंद</span>
                </button>
                 <button onClick={handleShare} className="flex flex-col items-center gap-1 text-purple-300 hover:text-white transition-colors duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                      <polyline points="16 6 12 2 8 6"></polyline>
                      <line x1="12" y1="2" x2="12" y2="15"></line>
                    </svg>
                    <span className="text-xs font-semibold">{isCopied ? 'कॉपी हुआ!' : 'साझा करें'}</span>
                </button>
                 <button onClick={() => setShowComments(!showComments)} className="flex flex-col items-center gap-1 text-purple-300 hover:text-white transition-colors duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span className="text-xs font-semibold">टिप्पणी</span>
                </button>
                {!isAuthenticated && !isSaved && (
                    <button onClick={onSave} className="flex flex-col items-center gap-1 text-purple-300 hover:text-white transition-colors duration-200">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        <span className="text-xs font-semibold">सहेजें</span>
                    </button>
                )}
            </div>
            
            {showComments && (
                <div className="mt-6 pt-6 border-t border-white/20 animate-fade-in">
                    <h4 className="text-xl font-hindi font-bold text-white mb-4 text-left">टिप्पणियाँ</h4>
                    <form onSubmit={handlePostComment} className="flex gap-2 mb-4">
                        <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="अपनी टिप्पणी लिखें..." rows={1} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition"></textarea>
                        <button type="submit" className="px-4 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition">पोस्ट</button>
                    </form>
                    <div className="space-y-4 max-h-60 overflow-y-auto pr-2 text-left">
                        {comments.map((comment, index) => (
                             <div key={`user-${index}`} className="bg-white/10 p-3 rounded-lg">
                                <p className="font-bold text-pink-300 text-sm">{comment.author}</p>
                                <p className="text-white/90">{comment.text}</p>
                            </div>
                        ))}
                         {dummyComments.map((comment, index) => (
                             <div key={`dummy-${index}`} className="bg-white/5 p-3 rounded-lg">
                                <p className="font-bold text-purple-300 text-sm">{comment.author}</p>
                                <p className="text-white/80">{comment.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            <div className="text-center mt-8">
                <button
                    onClick={onReset}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 ease-in-out text-lg"
                >
                    {titles.resetButton}
                </button>
            </div>
        </Card>
    );
};

export default ResultDisplay;