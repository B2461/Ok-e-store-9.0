import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { SavedReading, DivinationType } from '../types';
import Card from './Card';
import { generateSpeech, getApiKey } from '../services/geminiService';
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

const getTitlesForType = (type: DivinationType | null) => {
    if (type === DivinationType.PILGRIMAGE) {
        return { main: 'Details', past: 'History & Significance', present: 'Current Form & Story', future: 'Spiritual Guidance', icons: ['📜', '🏛️', '🕊️'] };
    }
    if (type === DivinationType.ZODIAC) {
        return { main: 'Zodiac Reading', past: 'Nature & Personality', present: 'Positive Traits & Strengths', future: 'Challenges & Areas for Growth', icons: ['👤', '✨', '💪'] };
    }
    if (type === DivinationType.DAILY_HOROSCOPE) {
        return { main: 'Daily Horoscope', past: 'Theme of the Day', present: 'Detailed Horoscope', future: 'Advice for the Day', icons: ['☀️', '🔍', '💡'] };
    }
    if (type === DivinationType.HOROSCOPE) {
        return { main: 'Horoscope', past: 'Overview & Main Theme', present: 'Detailed Horoscope', future: 'Advice & Remedies', icons: ['📅', '🔍', '💡'] };
    }
    if (type === DivinationType.DAILY_FORTUNE_CARD) {
        return { main: 'Fortune Card', past: 'Theme of the Day', present: 'Fortune for Today', future: 'Mantra for the Day', icons: ['🌟', '🥠', '🧘'] };
    }
    if (type === DivinationType.DREAM) {
        return { main: 'Dream Interpretation', past: 'Symbolism of the Dream', present: 'Connection to Current Life', future: 'Guidance for the Future', icons: ['📖', '🧘', '🧭'] };
    }
    if (type === DivinationType.TRAVEL) {
        return { main: 'Travel Forecast', past: 'Pre-Journey Thoughts', present: 'During the Journey', future: 'Outcome of the Journey', icons: ['🎒', '✈️', '✅'] };
    }
     if (type === DivinationType.TRAIN_JOURNEY) {
        return { main: 'Train Journey Details', past: 'Route Information', present: 'List of Trains', future: 'Travel Tips & Ticket Price', icons: ['📜', '🚂', '💰'] };
    }
    if (type === DivinationType.MOLE) {
        return { main: 'Mole Astrology', past: 'General Meaning of the Mole', present: 'Benefits (Fayde)', future: 'Harms (Nuksan)', icons: ['📖', '✅', '❌'] };
    }
    if (type === DivinationType.LOVE_RELATIONSHIP) {
        return { main: 'Love Relationship Analysis', past: 'Past of the Relationship', present: 'Current Situation', future: 'Future Possibilities', icons: ['🌱', '💖', '✨'] };
    }
    if (type === DivinationType.MARRIAGE_COMPATIBILITY) {
        return { main: 'Marriage Compatibility Report', past: 'Core Compatibility & Guna Milan', present: 'Strengths & Weaknesses of the Union', future: 'Future & Remedies', icons: ['📜', '💑', '✨'] };
    }
    if (type === DivinationType.LOVE_COMPATIBILITY) {
        return { main: 'Love Compatibility Report', past: 'Basis of Attraction', present: 'Current Relationship', future: 'Future Potential', icons: ['💕', '📊', '💖'] };
    }
     if (type === DivinationType.TAROT) {
        return { main: 'Reading', past: 'Your Past', present: 'Your Present', future: 'Your Future', icons: ['📜', '🔮', '✨'] };
    }
    if (type === DivinationType.JANAM_KUNDLI) {
        return { main: 'Kundli Analysis', past: 'Personality & Planetary Positions', present: 'Current Dasha & Effects', future: 'Predictions & Remedies', icons: ['👤', '⏳', '✨'] };
    }
    if (type === DivinationType.SEASONAL_FOOD) {
        return { main: 'Food Guide', past: 'What to Eat', present: 'What to Avoid', future: 'General Health Tips', icons: ['🥗', '🚫', '❤️'] };
    }
    if (type === DivinationType.ANG_SPHURAN) {
        return { main: 'Body Twitching Results', past: 'General Meaning (Male-Female)', present: 'Auspicious Results', future: 'Inauspicious Results', icons: ['📖', '👍', '👎'] };
    }
    if (type === DivinationType.SNEEZING) {
        return { main: 'Sneeze Interpretation', past: 'General Meaning of Sneeze', present: 'Beneficial Results', future: 'Harmful Results', icons: ['🤧', '✅', '❌'] };
    }
    if (type === DivinationType.BUSINESS_ASTROLOGY) {
        return { main: 'Business Astrology Analysis', past: 'Your Business Potential', present: 'Suitable Business Sectors', future: 'Tips for Success', icons: ['👤', '💼', '💡'] };
    }
    if (type === DivinationType.FOOD_COMBINATION) {
        return { main: 'Food Combination Analysis', past: 'What to Eat Together', present: 'What Not to Eat Together', future: 'General Health Tips', icons: ['✅', '❌', '❤️'] };
    }
    if (type === DivinationType.RELIGIOUS_RITUALS) {
        return { main: 'Religious Information', past: 'History & Significance', present: 'Method / Text', future: 'Benefits & Spiritual Gain', icons: ['📜', '📖', '✨'] };
    }
    if (type === DivinationType.PRASHNA_PARIKSHA) {
        return { main: 'Analysis', past: 'Context of the Past', present: 'Current Situation', future: 'Indication for the Future', icons: ['📜', '🤔', '✨'] };
    }
    if (type === DivinationType.PRASHNA_CHAKRA) {
        return { main: 'Answer', past: 'Your Question', present: "The Chakra's Answer", future: 'Guidance', icons: ['❓', '☸️', '💡'] };
    }
    if (type === DivinationType.FAMOUS_PLACE_TRAVEL) {
        return { main: 'Travel Information', past: 'History & Significance of the Place', present: 'Travel Information', future: 'Tips & Advice', icons: ['📜', '🗺️', '💡'] };
    }
    if (type === DivinationType.ENGLISH_GURU) {
        return { main: 'Analysis', past: 'English Translation', present: 'Grammar Explanation', future: 'Vocabulary and Tips', icons: ['🇬🇧', '📖', '💡'] };
    }
    if (type === DivinationType.SCAN_TRANSLATE) {
        return { main: 'Translation Result', past: 'Original Text', present: 'Translated Text', future: 'Notes', icons: ['📝', '🌐', '💡'] };
    }
    if (type === DivinationType.TEXT_TO_IMAGE) {
        return { main: 'Image', past: 'Description', present: 'Your Prompt', future: 'Next Steps', icons: ['🖼️', '✍️', '💡'] };
    }
    if (type === DivinationType.STORY_TO_VIDEO) {
        return { main: 'Story Video', past: 'Your Script', present: 'Generated Video', future: 'Next Steps', icons: ['📜', '🎬', '💡'] };
    }
    if (type === DivinationType.IMAGE_TO_VIDEO) {
        return { main: 'Video', past: 'Your Original Image', present: 'Generated Video', future: 'Next Steps', icons: ['🖼️', '🎬', '💡'] };
    }
    if (type === DivinationType.VASTU_SHASTRA) {
        return { main: 'Vastu Analysis', past: 'Vastu Principles', present: 'Analysis of Your Situation', future: 'Suggestions & Remedies', icons: ['📜', '🏡', '💡'] };
    }
    if (type === DivinationType.AI_FACE_READING) {
        return { main: 'Face Analysis', past: 'Personality & Nature', present: 'Strengths & Weaknesses', future: 'Potential & Guidance', icons: ['👤', '💪', '💡'] };
    }
    if (type === DivinationType.AI_TIME_MACHINE) {
        return { main: 'Time Machine', past: 'Based on your current image', present: 'Your future in 10 years', future: 'Guidance', icons: ['👤', '⏳', '💡'] };
    }
    if (type === DivinationType.AI_FUTURE_GENERATOR) {
        return { main: 'Prediction', past: 'Origin of the Question', present: 'Current Energies', future: 'Guidance for the Future', icons: ['❓', '⚡', '🌟'] };
    }
    return { main: 'Reading', past: 'Your Past', present: 'Your Present', future: 'Your Future', icons: ['📜', '🔮', '✨'] };
};

const ResultSection: React.FC<{ title: string; content: string; icon: string; }> = ({ title, content, icon }) => (
    <div className="mb-6">
        <h3 className="flex items-center gap-3 text-2xl font-hindi font-bold text-purple-300 mb-2">
            <span className="text-3xl">{icon}</span>
            {title}
        </h3>
        <p className="text-lg text-white/90 whitespace-pre-wrap">{content}</p>
    </div>
);

const dummyComments = [
    { author: 'आकाश', text: 'वाह, यह बहुत सटीक था! धन्यवाद!' },
    { author: 'प्रिया', text: 'यह बहुत दिलचस्प है। मुझे सोचने के लिए बहुत कुछ मिला।' }
];

const PastReadingDetail: React.FC<{ savedReading: SavedReading, onDelete: (id: string) => void }> = ({ savedReading, onDelete }) => {
    const [isCopied, setIsCopied] = useState(false);
    const { reading, divinationType, id } = savedReading;
    const titles = getTitlesForType(divinationType);
    const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    
    const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null);
    const [isLoadingVideo, setIsLoadingVideo] = useState(false);
    const [videoError, setVideoError] = useState<string | null>(null);

    // Like & Comment state
    const [isLiked, setIsLiked] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<{ author: string; text: string }[]>([]);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        let objectUrl: string | undefined;

        const fetchVideo = async () => {
            if ((divinationType === DivinationType.STORY_TO_VIDEO || divinationType === DivinationType.IMAGE_TO_VIDEO) && reading.videoDownloadUrl) {
                setIsLoadingVideo(true);
                setVideoError(null);
                try {
                    const apiKey = getApiKey();
                    const downloadUrlWithKey = `${reading.videoDownloadUrl}&key=${apiKey}`;
                    const response = await fetch(downloadUrlWithKey);
                    if (!response.ok) {
                        throw new Error(`Failed to fetch video: ${response.statusText}`);
                    }
                    const blob = await response.blob();
                    objectUrl = URL.createObjectURL(blob);
                    setVideoBlobUrl(objectUrl);
                } catch (error) {
                    console.error("Could not load past video:", error);
                    setVideoError("वीडियो लोड करने में विफल। API कुंजी कॉन्फ़िगर नहीं हो सकती है।");
                } finally {
                    setIsLoadingVideo(false);
                }
            }
        };

        fetchVideo();
        
        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [reading.videoDownloadUrl, divinationType]);

    useEffect(() => {
        return () => {
            if (audioSourceRef.current) {
                audioSourceRef.current.stop();
            }
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
        };
    }, []);

    const handleSpeak = async () => {
        if (isSpeaking && audioSourceRef.current) {
            audioSourceRef.current.stop();
            setIsSpeaking(false);
            return;
        }

        if (isGeneratingSpeech) return;

        setIsGeneratingSpeech(true);
        try {
            const cardInfo = (divinationType === DivinationType.TAROT && reading.cardName) ? `Your Card: ${reading.cardName}.` : '';
            const textToSpeak = [
                cardInfo,
                `${titles.past}. ${reading.past}.`,
                `${titles.present}. ${reading.present}.`,
                `${titles.future}. ${reading.future}.`
            ].filter(Boolean).join(' ');
            
            const base64Audio = await generateSpeech(textToSpeak);
            
            if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                // Fix: Cast window to any to access webkitAudioContext without TypeScript errors.
                const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                audioContextRef.current = new AudioContext({ sampleRate: 24000 });
            }
            
            const audioBuffer = await decodeAudioData(decode(base64Audio), audioContextRef.current);
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            
            source.onended = () => {
                setIsSpeaking(false);
                audioSourceRef.current = null;
            };

            source.start();
            audioSourceRef.current = source;
            setIsSpeaking(true);

        } catch (err) {
            console.error("Failed to play audio:", err);
            alert("ऑडियो चलाने में विफल रहा।");
        } finally {
            setIsGeneratingSpeech(false);
        }
    };
    
    const handlePostComment = (e: FormEvent) => {
        e.preventDefault();
        if (newComment.trim()) {
            setComments(prev => [...prev, { author: 'आप', text: newComment.trim() }]);
            setNewComment('');
        }
    };

    const handleShare = async () => {
        const cardInfo = divinationType === DivinationType.TAROT && reading.cardName ? `My Card: ${reading.cardName}\n\n` : '';
        const textToShare = `
My ${divinationType} ${titles.main}:
${cardInfo}
${titles.icons[0]} ${titles.past}
${reading.past}
---
${titles.icons[1]} ${titles.present}
${divinationType === DivinationType.STORY_TO_VIDEO || divinationType === DivinationType.IMAGE_TO_VIDEO ? 'See the generated video.' : reading.present}
---
${titles.icons[2]} ${titles.future}
${reading.future}
---
Get your own reading from Ok shoppy Store 9.0!
        `.trim();

        const shareData: ShareData = {
            title: `My ${divinationType} ${titles.main}`,
            text: textToShare,
        };

        try {
            let fileToShare: File | null = null;

            if (videoBlobUrl) {
                const response = await fetch(videoBlobUrl);
                const blob = await response.blob();
                fileToShare = new File([blob], 'bhavishya-video.mp4', { type: 'video/mp4' });
            } else if (reading.imageUrl) {
                const response = await fetch(reading.imageUrl);
                const blob = await response.blob();
                fileToShare = new File([blob], 'bhavishya-image.jpg', { type: 'image/jpeg' });
            }

            if (fileToShare && navigator.canShare && navigator.canShare({ files: [fileToShare] })) {
                shareData.files = [fileToShare];
            }

            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                throw new Error('Navigator.share not supported');
            }
        } catch (err) {
            console.error('Share failed, falling back to clipboard:', err);
            navigator.clipboard.writeText(textToShare).then(() => {
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2500);
            }).catch(clipboardErr => {
                console.error('Could not copy text: ', clipboardErr);
                alert("साझा करने या कॉपी करने में विफल।");
            });
        }
    };

    const handleDownload = () => {
        if (!reading || !divinationType) return;
    
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.style.display = 'none';
    
        try {
            if (reading.imageUrl) {
                a.href = reading.imageUrl;
                a.download = `ok-shoppy-store-9.0-${divinationType}.jpeg`;
                a.click();
            } else if (videoBlobUrl) {
                a.href = videoBlobUrl;
                a.download = `ok-shoppy-store-9.0-${divinationType}.mp4`;
                a.click();
            } else {
                const isTarot = divinationType === DivinationType.TAROT;
                const cardInfo = (isTarot && reading.cardName) ? `My Card: ${reading.cardName}\n\n` : '';
                const textToDownload = `
My ${divinationType} ${titles.main}:
${cardInfo}
--------------------
${titles.past}:
${reading.past}

--------------------
${titles.present}:
${reading.present}

--------------------
${titles.future}:
${reading.future}

---
Generated by 'Ok shoppy Store 9.0'
                `.trim();
        
                const blob = new Blob([textToDownload], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                a.href = url;
                a.download = `ok-shoppy-store-9.0-${divinationType}.txt`;
                a.click();
                URL.revokeObjectURL(url);
            }
        } finally {
            document.body.removeChild(a);
        }
    };
    
    return (
        <Card className="max-w-4xl mx-auto w-full">
            <div className="flex items-center justify-center gap-4 mb-2">
                <h2 className="text-4xl font-hindi font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                    Your {divinationType} {titles.main}
                </h2>
                <button
                    onClick={handleSpeak}
                    disabled={isGeneratingSpeech}
                    className="w-14 h-14 flex-shrink-0 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-lg border border-white/20 hover:bg-purple-500/30 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50 disabled:cursor-wait"
                    aria-label={isSpeaking ? "पढ़ना बंद करें" : "परिणाम पढ़कर सुनाएं"}
                >
                    {isGeneratingSpeech ? (
                         <div className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                    ) : isSpeaking ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 10h6v4H9z" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                        </svg>
                    )}
                </button>
            </div>
            <p className="text-center text-purple-300 mb-6">{new Date(savedReading.date).toLocaleString('hi-IN')}</p>

            {divinationType === DivinationType.LOVE_COMPATIBILITY && reading.compatibilityPercentage !== undefined && (
                <div className="my-6 flex flex-col items-center">
                    <h3 className="text-2xl font-hindi font-bold text-white mb-4">Your Compatibility</h3>
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
                        <img 
                            src={reading.imageUrl} 
                            alt={`Tarot card for ${reading.cardName}`}
                            className="mx-auto rounded-lg shadow-2xl w-full max-w-xs"
                        />
                    )}
                </div>
            )}
            
            {divinationType !== DivinationType.TAROT && reading.imageUrl && (
                <img src={reading.imageUrl} alt="Generated" className="my-6 mx-auto rounded-lg shadow-2xl w-full max-w-lg"/>
            )}
            
            {(divinationType === DivinationType.STORY_TO_VIDEO || divinationType === DivinationType.IMAGE_TO_VIDEO) && (
                <div className="my-6 mx-auto rounded-lg shadow-2xl w-full max-w-lg bg-black/20 min-h-[200px] flex items-center justify-center">
                    {isLoadingVideo && <p className="text-center text-purple-200">वीडियो लोड हो रहा है...</p>}
                    {videoError && <p className="text-center text-red-400 p-4">{videoError}</p>}
                    {videoBlobUrl && !isLoadingVideo && !videoError && (
                        <video src={videoBlobUrl} controls className="w-full h-full rounded-lg" />
                    )}
                </div>
            )}

            <ResultSection title={titles.past} content={reading.past} icon={titles.icons[0]} />
            <div className="border-t border-white/20 my-6"></div>
            <ResultSection title={titles.present} content={reading.present} icon={titles.icons[1]} />
            <div className="border-t border-white/20 my-6"></div>
            <ResultSection title={titles.future} content={reading.future} icon={titles.icons[2]} />
            
            <div className="mt-8 pt-6 border-t border-white/20 flex items-center justify-around">
                <button onClick={() => setIsLiked(!isLiked)} className={`flex flex-col items-center gap-1 text-purple-300 hover:text-white transition-colors duration-200 ${isLiked ? 'like-btn-liked' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 transition-transform duration-300 ${isLiked ? 'like-animation' : ''}`} viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    <span className="text-xs font-semibold">पसंद</span>
                </button>
                 <button onClick={() => setShowComments(!showComments)} className="flex flex-col items-center gap-1 text-purple-300 hover:text-white transition-colors duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span className="text-xs font-semibold">टिप्पणी</span>
                </button>
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

             <div className="text-center mt-8 flex flex-wrap items-center justify-center gap-4">
                 <button
                    onClick={handleDownload}
                    className="px-6 py-3 bg-white/10 text-purple-200 border border-white/20 rounded-full font-bold text-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-white/20"
                >
                    डाउनलोड करें
                </button>
                <button
                    onClick={handleShare}
                    disabled={isCopied}
                    className={`px-6 py-3 rounded-full font-bold text-lg transition-all duration-300 ease-in-out transform hover:scale-105 ${
                        isCopied
                            ? 'bg-green-600 text-white shadow-lg cursor-default'
                            : 'bg-white/10 text-purple-200 border border-white/20 hover:bg-white/20'
                    }`}
                >
                    {isCopied ? 'कॉपी हो गया!' : 'साझा करें'}
                </button>
                 <button
                    onClick={() => onDelete(id)}
                    className="px-6 py-3 bg-red-800/20 text-red-300 border border-red-400/30 rounded-full font-bold text-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-red-800/40"
                >
                    हटाएं
                </button>
            </div>
        </Card>
    );
};

interface PastReadingsScreenProps {
    readings: SavedReading[];
    onDelete: (id: string) => void;
}

const PastReadingsScreen: React.FC<PastReadingsScreenProps> = ({ readings, onDelete }) => {
    const { isAuthenticated, showAuth } = useAppContext();
    const [selectedReading, setSelectedReading] = useState<SavedReading | null>(null);

    useEffect(() => {
        if (selectedReading && !readings.find(r => r.id === selectedReading.id)) {
            setSelectedReading(null);
        }
    }, [readings, selectedReading]);

    if (selectedReading) {
        return (
            <div className="animate-fade-in w-full">
                <button onClick={() => setSelectedReading(null)} className="mb-6 text-purple-300 hover:text-white transition">&larr; सभी रीडिंग्स पर वापस जाएं</button>
                <PastReadingDetail savedReading={selectedReading} onDelete={onDelete} />
            </div>
        );
    }
    
    if (!isAuthenticated) {
        return (
             <Card className="animate-fade-in max-w-2xl mx-auto text-center">
                <Link to="/" className="absolute top-6 left-6 text-purple-300 hover:text-white transition">&larr; वापस</Link>
                <h2 className="text-3xl font-hindi font-bold mb-4">My Readings</h2>
                <p className="text-purple-200 text-lg mb-6">अपनी सहेजी गई रीडिंग्स देखने के लिए कृपया लॉगिन करें।</p>
                <button
                    onClick={() => showAuth()}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 ease-in-out text-lg"
                >
                    लॉगिन करें
                </button>
            </Card>
        )
    }

    return (
        <Card className="animate-fade-in max-w-4xl mx-auto">
            <Link to="/" className="absolute top-6 left-6 text-purple-300 hover:text-white transition">&larr; वापस</Link>
            <h2 className="text-3xl font-hindi font-bold mb-8 text-center">My Readings</h2>
            
            {readings.length === 0 ? (
                <p className="text-center text-purple-200 text-lg py-8">आपने अभी तक कोई रीडिंग नहीं सहेजी है।</p>
            ) : (
                <div className="space-y-4">
                    {[...readings].reverse().map(savedReading => (
                        <button
                            key={savedReading.id}
                            onClick={() => setSelectedReading(savedReading)}
                            className="w-full text-left bg-white/5 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 transform transition-all duration-300 hover:bg-purple-500/20 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/30"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-hindi text-white font-semibold">{savedReading.divinationType}</h3>
                                    <p className="text-purple-300 text-sm mt-1">
                                        {new Date(savedReading.date).toLocaleDateString('hi-IN', {
                                            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                <span className="text-2xl text-purple-300">&rarr;</span>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </Card>
    );
};

export default PastReadingsScreen;