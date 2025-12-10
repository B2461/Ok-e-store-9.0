import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import Card from './Card';
import { getApiKey } from '../services/geminiService';

interface Place {
    name: string;
    address: string;
}

const LocalMarketingScreen: React.FC = () => {
    const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [places, setPlaces] = useState<Place[]>([]);
    const [searchType, setSearchType] = useState<'स्कूल' | 'दुकान' | null>(null);

    const handleGetLocation = () => {
        setIsLoading(true);
        setError(null);
        setPlaces([]);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                });
                setIsLoading(false);
            },
            (err) => {
                setError("स्थान तक पहुंचने में असमर्थ। कृपया ब्राउज़र में स्थान की अनुमति सक्षम करें।");
                setIsLoading(false);
            }
        );
    };

    const parsePlaces = (text: string): Place[] => {
        const foundPlaces: Place[] = [];
        const lines = text.split('\n').filter(line => line.trim() !== '');
        let currentPlace: Partial<Place> = {};

        for (const line of lines) {
            if (line.toLowerCase().startsWith('name:')) {
                if (currentPlace.name && currentPlace.address) {
                    foundPlaces.push({ ...currentPlace } as Place);
                }
                currentPlace = { name: line.substring(5).trim() };
            } else if (line.toLowerCase().startsWith('address:')) {
                if (currentPlace.name) {
                    currentPlace.address = line.substring(8).trim();
                }
            }
        }
        if (currentPlace.name && currentPlace.address) {
            foundPlaces.push({ ...currentPlace } as Place);
        }
        return foundPlaces;
    };


    const handleFindPlaces = async (type: 'स्कूल' | 'दुकान') => {
        if (!location) {
            setError("कृपया पहले अपना स्थान प्राप्त करें।");
            return;
        }
        setIsLoading(true);
        setError(null);
        setPlaces([]);
        setSearchType(type);

        try {
            const ai = new GoogleGenAI({ apiKey: getApiKey() });
            const prompt = `मेरे 5 किलोमीटर के दायरे में 10 ${type} खोजें। प्रत्येक के लिए, नाम और पता इस प्रारूप में प्रदान करें: 'Name: [नाम]\\nAddress: [पता]'। केवल सूची प्रदान करें, कोई अतिरिक्त टेक्स्ट नहीं।`;

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    tools: [{ googleMaps: {} }],
                    toolConfig: {
                        retrievalConfig: {
                            latLng: {
                                latitude: location.lat,
                                longitude: location.lon
                            }
                        }
                    }
                },
            });
            
            const foundPlaces = parsePlaces(response.text);
            if (foundPlaces.length === 0) {
                 setError(`आपके क्षेत्र में कोई ${type} नहीं मिला।`);
            }
            setPlaces(foundPlaces);

        } catch (err) {
            console.error(err);
            setError(`आस-पास के ${type} खोजने में विफल। कृपया पुनः प्रयास करें।`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = (placeName: string) => {
        const appLink = "https://play.google.com/store/apps/details?id=com.okshoppy.store";
        const message = `नमस्ते! ${placeName} के पास स्थित हमारे नए ऐप Ok shoppy Store 9.0 को देखें। आप पूजन सामग्री, इलेक्ट्रॉनिक्स और भी बहुत कुछ खरीद सकते हैं। लिंक: ${appLink}`;
        const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <Card className="animate-fade-in max-w-2xl mx-auto">
            <h2 className="text-3xl font-hindi font-bold mb-4 text-center">स्थानीय विपणन</h2>
            <p className="text-purple-300 text-center mb-8">अपने आस-पास के स्कूलों और दुकानों को अपने ऐप का लिंक भेजें।</p>

            {error && <p className="text-red-400 text-center mb-4">{error}</p>}

            {!location && (
                <div className="text-center">
                    <button
                        onClick={handleGetLocation}
                        disabled={isLoading}
                        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 ease-in-out text-xl disabled:opacity-60"
                    >
                        {isLoading ? 'स्थान प्राप्त हो रहा है...' : 'मेरा स्थान प्राप्त करें'}
                    </button>
                </div>
            )}

            {location && (
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button onClick={() => handleFindPlaces('स्कूल')} disabled={isLoading} className="w-full px-6 py-4 bg-white/10 text-purple-200 border border-white/20 rounded-full font-bold text-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-white/20 disabled:opacity-60">आस-पास के स्कूल खोजें</button>
                        <button onClick={() => handleFindPlaces('दुकान')} disabled={isLoading} className="w-full px-6 py-4 bg-white/10 text-purple-200 border border-white/20 rounded-full font-bold text-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-white/20 disabled:opacity-60">आस-पास की दुकानें खोजें</button>
                    </div>
                    {isLoading && (
                        <div className="text-center p-8">
                             <div className="relative w-16 h-16 mx-auto mb-4">
                                <div className="absolute inset-0 border-4 border-purple-400/50 rounded-full animate-spin"></div>
                             </div>
                             <p className="text-lg text-purple-200">{searchType} खोजे जा रहे हैं...</p>
                         </div>
                    )}
                    {!isLoading && places.length > 0 && (
                        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                            <h3 className="text-xl font-hindi font-bold text-white">परिणाम:</h3>
                            {places.map((place, index) => (
                                <div key={index} className="bg-white/5 p-4 rounded-lg border border-white/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <h4 className="font-bold text-lg text-white">{place.name}</h4>
                                        <p className="text-purple-200">{place.address}</p>
                                    </div>
                                    <button
                                        onClick={() => handleSendMessage(place.name)}
                                        className="flex-shrink-0 w-full sm:w-auto px-4 py-2 bg-green-600/80 text-white text-sm font-semibold rounded-full hover:bg-green-600 transition-colors"
                                    >
                                        व्हाट्सएप पर भेजें
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
};

export default LocalMarketingScreen;