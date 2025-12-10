import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat, Type } from "@google/genai";
import { UserInput } from '../types';
import Card from './Card';
import { getApiKey } from '../services/geminiService';

interface FutureStoryScreenProps {
    userInput: UserInput;
    onReset: () => void;
}

interface StorySegment {
    storyPart: string;
    choices: string[];
}

const FutureStoryScreen: React.FC<FutureStoryScreenProps> = ({ userInput, onReset }) => {
    const [storyParts, setStoryParts] = useState<string[]>([]);
    const [currentChoices, setCurrentChoices] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFinished, setIsFinished] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chatSessionRef = useRef<Chat | null>(null);
    const storyContainerRef = useRef<HTMLDivElement>(null);

    const systemInstruction = `आप हिंदी में 'चुनें अपनी कहानी' वाले एक इंटरैक्टिव गेम के कहानीकार हैं। आपका लक्ष्य एक आकर्षक, शाखाओं वाली कहानी बनाना है।
नियम:
1. उपयोगकर्ता के दिए गए विचार के आधार पर एक आकर्षक शुरुआती दृश्य बनाकर कहानी शुरू करें।
2. प्रत्येक कहानी के हिस्से के बाद, उपयोगकर्ता को ठीक 3 अलग, दिलचस्प विकल्प प्रस्तुत करें जो कहानी के रास्ते को महत्वपूर्ण रूप से बदल देंगे।
3. उपयोगकर्ता द्वारा 3 विकल्प चुनने के बाद (चौथे मोड़ पर), आपको कहानी का समापन करना होगा। अंतिम प्रतिक्रिया एक समापन पैराग्राफ होनी चाहिए जो उनकी यात्रा और भाग्य का सारांश हो, और इसमें कोई और विकल्प नहीं होना चाहिए।
4. आपकी प्रतिक्रियाएं JSON प्रारूप में होनी चाहिए, और इस स्कीमा का सख्ती से पालन करना चाहिए: { "storyPart": "कहानी का टेक्स्ट यहाँ...", "choices": ["विकल्प 1", "विकल्प 2", "विकल्प 3"] }।
5. अंतिम, समापन प्रतिक्रिया के लिए, JSON स्कीमा यह होनी चाहिए: { "storyPart": "समापन कहानी का टेक्स्ट...", "choices": [] }। 'choices' ऐरे खाली होना चाहिए।
6. कहानी को आकर्षक, रचनात्मक और परिवार के अनुकूल रखें।
7. सभी प्रतिक्रियाएं केवल हिंदी में होनी चाहिए।`;

    const storySchema = {
        type: Type.OBJECT,
        properties: {
            storyPart: {
                type: Type.STRING,
                description: "कहानी का अगला भाग हिंदी में।"
            },
            choices: {
                type: Type.ARRAY,
                description: "उपयोगकर्ता के लिए ठीक 3 विकल्पों की एक सूची। कहानी समाप्त होने पर यह खाली होना चाहिए।",
                items: {
                    type: Type.STRING
                }
            }
        },
        required: ["storyPart", "choices"]
    };

    useEffect(() => {
        storyContainerRef.current?.scrollTo({
            top: storyContainerRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }, [storyParts]);

    useEffect(() => {
        const startStory = async () => {
            if (!userInput.storyPremise) {
                setError("कहानी शुरू करने के लिए कोई विचार प्रदान नहीं किया गया।");
                setIsLoading(false);
                return;
            }

            try {
                const ai = new GoogleGenAI({ apiKey: getApiKey() });
                const chat = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    config: {
                        systemInstruction,
                        responseMimeType: "application/json",
                        responseSchema: storySchema,
                        temperature: 0.9,
                    },
                });
                chatSessionRef.current = chat;

                const response = await chat.sendMessage({ message: userInput.storyPremise });
                const parsedResponse: StorySegment = JSON.parse(response.text.trim());

                setStoryParts([parsedResponse.storyPart]);
                setCurrentChoices(parsedResponse.choices);
            } catch (err) {
                console.error("Error starting story:", err);
                setError("कहानी शुरू करने में विफल। कृपया पुनः प्रयास करें।");
            } finally {
                setIsLoading(false);
            }
        };

        startStory();
    }, [userInput.storyPremise]);

    const handleChoice = async (choice: string) => {
        if (!chatSessionRef.current || isLoading) return;

        setIsLoading(true);
        setError(null);
        setCurrentChoices([]); // Hide choices while loading
        setStoryParts(prev => [...prev, `\n> आपने चुना: ${choice}\n`]);

        try {
            const response = await chatSessionRef.current.sendMessage({ message: choice });
            const parsedResponse: StorySegment = JSON.parse(response.text.trim());

            setStoryParts(prev => [...prev, parsedResponse.storyPart]);

            if (parsedResponse.choices.length === 0) {
                setIsFinished(true);
            } else {
                setCurrentChoices(parsedResponse.choices);
            }
        } catch (err) {
            console.error("Error advancing story:", err);
            setError("कहानी को आगे बढ़ाने में विफल। कृपया पुनः प्रयास करें।");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="animate-fade-in w-full max-w-4xl mx-auto">
            <button onClick={onReset} className="absolute top-6 left-6 text-purple-300 hover:text-white transition">&larr; वापस</button>
            <h2 className="text-3xl font-hindi font-bold mb-6 text-center">Your Future Story</h2>

            <div 
                ref={storyContainerRef}
                className="story-container bg-black/20 p-4 rounded-lg border border-white/20 min-h-[300px] max-h-[50vh] overflow-y-auto mb-6"
            >
                {storyParts.map((part, index) => (
                     <p key={index} className="text-lg text-white/90 whitespace-pre-wrap mb-4 animate-fade-in">{part}</p>
                ))}
                 {isLoading && storyParts.length > 0 && (
                    <div className="flex items-center gap-3 text-purple-300">
                        <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                        कहानीकार सोच रहा है...
                    </div>
                 )}
            </div>

            {isLoading && storyParts.length === 0 && (
                 <div className="flex flex-col items-center justify-center text-center p-8 min-h-[300px]">
                    <div className="relative w-16 h-16 mb-4">
                        <div className="absolute inset-0 border-4 border-purple-400/50 rounded-full animate-spin"></div>
                        <div className="absolute inset-2 border-4 border-pink-400/50 rounded-full animate-spin [animation-direction:reverse]"></div>
                    </div>
                    <p className="text-lg text-purple-200">आपकी कहानी की दुनिया बनाई जा रही है...</p>
                </div>
            )}
            
            {error && <p className="text-red-400 my-4 text-center">{error}</p>}

            {!isLoading && !isFinished && currentChoices.length > 0 && (
                <div>
                    <h3 className="text-xl font-hindi font-bold text-purple-300 mb-4 text-center">What will you do now?</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {currentChoices.map((choice, index) => (
                            <button
                                key={index}
                                onClick={() => handleChoice(choice)}
                                className="w-full text-left p-4 bg-white/5 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 transform transition-all duration-300 hover:bg-purple-500/20 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/30"
                            >
                                {choice}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            
            {isFinished && (
                 <div className="text-center p-4 animate-fade-in">
                    <h3 className="text-3xl font-hindi font-bold text-purple-300 mb-4">The End</h3>
                    <p className="text-lg text-white mb-6">आपकी कहानी पूरी हो गई है।</p>
                    <button
                        onClick={onReset}
                        className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 ease-in-out text-lg"
                    >
                        एक नई कहानी शुरू करें
                    </button>
                </div>
            )}

        </Card>
    );
};

export default FutureStoryScreen;
