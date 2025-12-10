
import React, { useState, FormEvent, useRef, useEffect } from 'react';
import { DivinationType, UserInput, UserProfile } from '../types';
import Card from './Card';
import { generatePalmImage } from '../services/geminiService';
import { toolCategories } from '../data/tools';
import { useAppContext } from '../App';

interface InputFormProps {
    divinationType: DivinationType;
    onSubmit: (data: UserInput) => void;
    error: string | null;
    onBack: () => void;
    userProfile: UserProfile | null;
}

const base64StringToFile = (base64String: string, filename: string): File => {
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });
    return new File([blob], filename, { type: 'image/jpeg' });
};

const getZodiacSign = (day: number, month: number): { name: string; emoji: string } | null => {
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return { name: 'मेष (Aries)', emoji: '♈' };
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return { name: 'वृषभ (Taurus)', emoji: '♉' };
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return { name: 'मिथुन (Gemini)', emoji: '♊' };
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return { name: 'कर्क (Cancer)', emoji: '♋' };
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return { name: 'सिंह (Leo)', emoji: '♌' };
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return { name: 'कन्या (Virgo)', emoji: '♍' };
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return { name: 'तुला (Libra)', emoji: '♎' };
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return { name: 'वृश्चिक (Scorpio)', emoji: '♏' };
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return { name: 'धनु (Sagittarius)', emoji: '♐' };
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return { name: 'मकर (Capricorn)', emoji: '♑' };
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return { name: 'कुंभ (Aquarius)', emoji: '♒' };
    if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return { name: 'मीन (Pisces)', emoji: '♓' };
    return null;
};

const zodiacs = [
    { name: 'मेष', emoji: '♈' }, { name: 'वृषभ', emoji: '♉' }, { name: 'मिथुन', emoji: '♊' },
    { name: 'कर्क', emoji: '♋' }, { name: 'सिंह', emoji: '♌' }, { name: 'कन्या', emoji: '♍' },
    { name: 'तुला', emoji: '♎' }, { name: 'वृश्चिक', emoji: '♏' }, { name: 'धनु', emoji: '♐' },
    { name: 'मकर', emoji: '♑' }, { name: 'कुंभ', emoji: '♒' }, { name: 'मीन', emoji: '♓' },
];

const months = ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];

const languages = [
    { code: 'hi', name: 'हिन्दी' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español (Spanish)' },
    { code: 'fr', name: 'Français (French)' },
    { code: 'de', name: 'Deutsch (German)' },
    { code: 'ja', name: '日本語 (Japanese)' },
    { code: 'zh', name: '中文 (Chinese)' },
    { code: 'ru', name: 'Русский (Russian)' },
    { code: 'ar', name: 'العربية (Arabic)' },
    { code: 'bn', name: 'বাংলা (Bengali)' },
    { code: 'pt', name: 'Português (Portuguese)' },
];

const visualStyles = ['सिनेमैटिक (Cinematic)', 'एनिमे (Anime)', 'वास्तविक (Realistic)', 'काल्पनिक (Fantasy)', 'विंटेज (Vintage)', '3D Animation'];

const InputForm: React.FC<InputFormProps> = ({ divinationType, onSubmit, error, onBack, userProfile }) => {
    const { tDiv } = useAppContext();
    // General State
    const [name, setName] = useState('');
    const [dob, setDob] = useState('');
    const [timeOfBirth, setTimeOfBirth] = useState('');
    const [placeOfBirth, setPlaceOfBirth] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [question, setQuestion] = useState('');
    const [selectedZodiac, setSelectedZodiac] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [targetLanguage, setTargetLanguage] = useState('hi');
    const [formError, setFormError] = useState<string | null>(null);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [zodiacSign, setZodiacSign] = useState<string | null>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    // Disha Shool State
    const [dishaShoolResult, setDishaShoolResult] = useState<{ direction: string; remedy: string; day: string } | null>(null);
    const [selectedDay, setSelectedDay] = useState<string | null>(null);

    // Marriage Compatibility State
    const [boyName, setBoyName] = useState('');
    const [boyDob, setBoyDob] = useState('');
    const [girlName, setGirlName] = useState('');
    const [girlDob, setGirlDob] = useState('');
    
    // Love Compatibility State
    const [name1, setName1] = useState('');
    const [name2, setName2] = useState('');
    
    // Future Story State
    const [storyPremise, setStoryPremise] = useState('');

    // Story to Video State
    const [storyScript, setStoryScript] = useState('');
    const [characters, setCharacters] = useState('');
    const [setting, setSetting] = useState('');
    const [visualStyle, setVisualStyle] = useState('');
    const [musicStyle, setMusicStyle] = useState('');
    const [addVoiceOver, setAddVoiceOver] = useState(false);
    const [addCaptions, setAddCaptions] = useState(false);
    const [desiredDuration, setDesiredDuration] = useState('');
    const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    
    // Text to Voice State
    const [voice, setVoice] = useState<'female' | 'male'>('female');

    // Yoga Guide State
    const [selectedYogaDay, setSelectedYogaDay] = useState(1);
    
    // Route Planner State
    const [startLocation, setStartLocation] = useState('');
    const [endLocation, setEndLocation] = useState('');

    const dishaShoolData: { [key: string]: { direction: string; remedy: string } } = {
        'सोमवार': { direction: 'पूर्व (East)', remedy: 'दर्पण देखकर या दूध पीकर यात्रा करें।' },
        'मंगलवार': { direction: 'उत्तर (North)', remedy: 'गुड़ खाकर यात्रा करें।' },
        'बुधवार': { direction: 'उत्तर (North)', remedy: 'धनिया या तिल खाकर यात्रा करें।' },
        'गुरुवार': { direction: 'दक्षिण (South)', remedy: 'दही खाकर यात्रा करें।' },
        'शुक्रवार': { direction: 'पश्चिम (West)', remedy: 'जौ या दही खाकर यात्रा करें।' },
        'शनिवार': { direction: 'पूर्व (East)', remedy: 'अदरक या उड़द खाकर यात्रा करें।' },
        'रविवार': { direction: 'पश्चिम (West)', remedy: 'घी या पान खाकर यात्रा करें।' }
    };

    const daysOfWeek = Object.keys(dishaShoolData);

    // Pre-populate form from user profile
    useEffect(() => {
        if (userProfile) {
            if (!name && userProfile.name) setName(userProfile.name);
            if (!dob && userProfile.dob) setDob(userProfile.dob);
            if (!timeOfBirth && userProfile.timeOfBirth) setTimeOfBirth(userProfile.timeOfBirth);
            if (!placeOfBirth && userProfile.placeOfBirth) setPlaceOfBirth(userProfile.placeOfBirth);
        }
    }, [userProfile, divinationType]);

    const handleDaySelect = (day: string) => {
        setSelectedDay(day);
        setDishaShoolResult({ ...dishaShoolData[day], day: day });
    };

    useEffect(() => {
        if (divinationType === DivinationType.DAILY_FORTUNE_CARD || divinationType === DivinationType.TRIKAL_GYAN) {
            onSubmit({});
        }
    }, [divinationType, onSubmit]);

    useEffect(() => {
        if ((divinationType === DivinationType.ASTROLOGY || divinationType === DivinationType.NUMEROLOGY || divinationType === DivinationType.BUSINESS_ASTROLOGY) && dob) {
            try {
                const date = new Date(dob);
                // Check if date is valid
                if (!isNaN(date.getTime())) {
                    const day = date.getUTCDate();
                    const month = date.getUTCMonth() + 1;
                    const sign = getZodiacSign(day, month);
                    if (sign) {
                        setZodiacSign(`${sign.name} ${sign.emoji}`);
                    } else {
                        setZodiacSign(null);
                    }
                } else {
                    setZodiacSign(null);
                }
            } catch (e) {
                setZodiacSign(null);
            }
        } else {
            setZodiacSign(null);
        }
    }, [dob, divinationType]);

    const handleHoroscopeSubmit = (type: 'weekly' | 'monthly' | 'daily') => {
        setFormError(null);
        if (!selectedZodiac) {
            setFormError("कृपया एक राशि चुनें।");
            return;
        }
        onSubmit({ selectedZodiac, horoscopeType: type });
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (divinationType === DivinationType.CODE_INSPECTOR) {
             if (!question) {
                setFormError("कृपया निरीक्षण करने के लिए एक टूल चुनें।");
                return;
            }
            onSubmit({ question });
            return;
        }

        if (divinationType === DivinationType.ROUTE_PLANNER) {
            if (!startLocation.trim() || !endLocation.trim()) {
                setFormError("कृपया शुरुआती और गंतव्य स्थान दोनों दर्ज करें।");
                return;
            }
            onSubmit({ startLocation, endLocation });
            return;
        }

        if (divinationType === DivinationType.YOGA_GUIDE_HINDI) {
            onSubmit({ question: selectedYogaDay.toString() });
            return;
        }

        if (divinationType === DivinationType.STORY_TO_VIDEO) {
            if (!storyScript.trim() && !image) {
                setFormError("कृपया वीडियो बनाने के लिए एक स्क्रिप्ट दर्ज करें या एक संदर्भ चित्र अपलोड करें।");
                return;
            }
            const promptParts = [];
            if (storyScript.trim()) promptParts.push(storyScript.trim());
            if (characters.trim()) promptParts.push(`\n\nपात्र (Characters): ${characters.trim()}`);
            if (setting.trim()) promptParts.push(`\n\nसेटिंग (Setting): ${setting.trim()}`);
            if (visualStyle.trim()) promptParts.push(`\n\nदृश्य शैली (Visual Style): ${visualStyle.trim()}`);
            if (musicStyle.trim()) promptParts.push(`\n\nसंगीत (Music): ${musicStyle.trim()}`);
            if (desiredDuration) promptParts.push(`\n\nवांछित वीडियो अवधि (Desired video duration): ${desiredDuration}`);
            if (addVoiceOver) promptParts.push(`\n\nविशेष निर्देश: कहानी का वर्णन करते हुए एक वॉयसओवर शामिल करें।`);
            if (addCaptions) promptParts.push(`\n\nविशेष निर्देश: वीडियो पर हिंदी में सबटाइटल/कैप्शन जोड़ें।`);
            
            const fullPrompt = promptParts.join('');
            onSubmit({ 
                question: fullPrompt, 
                image: image || undefined, 
                resolution, 
                aspectRatio,
                characters,
                setting,
                visualStyle,
                musicStyle,
                addVoiceOver,
                addCaptions,
                desiredDuration
            });
            return;
        }
        
        if (divinationType === DivinationType.FUTURE_STORY) {
            if (!storyPremise.trim()) {
                setFormError("कृपया अपनी कहानी के लिए एक विचार दर्ज करें।");
                return;
            }
            onSubmit({ storyPremise });
            return;
        }
        
        if (divinationType === DivinationType.IMAGE_TO_VIDEO) {
            if (!image) {
                setFormError("कृपया वीडियो बनाने के लिए एक चित्र अपलोड करें।");
                return;
            }
            onSubmit({ question: question, image: image || undefined, resolution, aspectRatio });
            return;
        }
        
        if (divinationType === DivinationType.ASTROLOGY || divinationType === DivinationType.NUMEROLOGY || divinationType === DivinationType.BUSINESS_ASTROLOGY) {
            if (!name || !dob) {
                setFormError("कृपया नाम और जन्म तिथि दोनों दर्ज करें।");
                return;
            }
        }
        if (divinationType === DivinationType.JANAM_KUNDLI) {
            if (!name || !dob || !timeOfBirth || !placeOfBirth) {
                setFormError("कृपया नाम, जन्म तिथि, जन्म समय और जन्म स्थान दर्ज करें।");
                return;
            }
        }
        if (divinationType === DivinationType.PALMISTRY) {
            if (!image) {
                setFormError("कृपया अपनी हथेली का एक चित्र अपलोड करें।");
                return;
            }
        }
        if (divinationType === DivinationType.AI_FACE_READING) {
            if (!image) {
                setFormError("कृपया विश्लेषण के लिए एक चेहरे का चित्र अपलोड करें।");
                return;
            }
        }
        if (divinationType === DivinationType.AI_TIME_MACHINE) {
            if (!image) {
                setFormError("कृपया भविष्य में अपना चेहरा देखने के लिए एक चित्र अपलोड करें।");
                return;
            }
        }
        if (divinationType === DivinationType.OBJECT_COUNTER) {
            if (!image) {
                setFormError("कृपया वस्तुओं का एक चित्र अपलोड करें।");
                return;
            }
            if (!question.trim()) {
                setFormError("कृपया उस वस्तु का नाम दर्ज करें जिसकी गिनती करनी है।");
                return;
            }
        }
        if (divinationType === DivinationType.PRODUCT_SCANNER) {
            if (!image) {
                setFormError("कृपया उत्पाद का एक चित्र अपलोड करें।");
                return;
            }
            if (!question.trim()) {
                setFormError("कृपया संदर्भ वस्तु का नाम दर्ज करें।");
                return;
            }
        }
        if (divinationType === DivinationType.MARRIAGE_COMPATIBILITY) {
            if (!boyName || !boyDob || !girlName || !girlDob) {
                setFormError("कृपया लड़के और लड़की दोनों का नाम और जन्मतिथि दर्ज करें।");
                return;
            }
        }
        if (divinationType === DivinationType.LOVE_COMPATIBILITY) {
            if (!name1 || !name2) {
                setFormError("कृपया दोनों नाम या राशियाँ दर्ज करें।");
                return;
            }
        }
         if (divinationType === DivinationType.SCAN_TRANSLATE) {
            if (!image) {
                setFormError("कृपया स्कैन करने के लिए एक चित्र अपलोड करें।");
                return;
            }
            if (!targetLanguage) {
                setFormError("कृपया अनुवाद के लिए एक भाषा चुनें।");
                return;
            }
        }
        if (divinationType === DivinationType.TEXT_TO_VOICE) {
            if (!question.trim()) {
                setFormError("कृपया ऑडियो में बदलने के लिए कुछ टेक्स्ट दर्ज करें।");
                return;
            }
        } else if (divinationType === DivinationType.TEXT_TO_IMAGE) {
            if (!question && !image) {
                setFormError("कृपया चित्र बनाने के लिए कुछ शब्द दर्ज करें या एक पेज की फोटो अपलोड करें।");
                return;
            }
        } else if (divinationType === DivinationType.STORY_TO_IMAGES) {
             if (!question.trim()) {
                setFormError("कृपया चित्र बनाने के लिए एक कहानी दर्ज करें।");
                return;
            }
        } else if (divinationType === DivinationType.TAROT || divinationType === DivinationType.PILGRIMAGE || divinationType === DivinationType.DREAM || divinationType === DivinationType.TRAVEL || divinationType === DivinationType.MOLE || divinationType === DivinationType.LOVE_RELATIONSHIP || divinationType === DivinationType.ANG_SPHURAN || divinationType === DivinationType.SNEEZING || divinationType === DivinationType.FOOD_COMBINATION || divinationType === DivinationType.RELIGIOUS_RITUALS || divinationType === DivinationType.PRASHNA_PARIKSHA || divinationType === DivinationType.FAMOUS_PLACE_TRAVEL || divinationType === DivinationType.TRAIN_JOURNEY || divinationType === DivinationType.ENGLISH_GURU || divinationType === DivinationType.VASTU_SHASTRA || divinationType === DivinationType.AI_FUTURE_GENERATOR || divinationType === DivinationType.PRODUCT_SCANNER || divinationType === DivinationType.OBJECT_COUNTER || divinationType === DivinationType.AI_CALCULATOR) {
            if (!question) {
                let errorMsg = "कृपया अपना प्रश्न दर्ज करें।";
                if (divinationType === DivinationType.DREAM) errorMsg = "कृपया अपने सपने का वर्णन करें।";
                if (divinationType === DivinationType.TRAVEL) errorMsg = "कृपया अपनी यात्रा का विवरण दर्ज करें।";
                if (divinationType === DivinationType.MOLE) errorMsg = "कृपया तिल का स्थान दर्ज करें।";
                if (divinationType === DivinationType.LOVE_RELATIONSHIP) errorMsg = "कृपया अपने प्रेम संबंध के बारे में एक प्रश्न दर्ज करें।";
                if (divinationType === DivinationType.ANG_SPHURAN) errorMsg = "कृपया फड़कने वाले अंग का वर्णन करें।";
                if (divinationType === DivinationType.SNEEZING) errorMsg = "कृपया छींक का विवरण दर्ज करें।";
                if (divinationType === DivinationType.FOOD_COMBINATION) errorMsg = "कृपया खाद्य पदार्थों की सूची दर्ज करें।";
                if (divinationType === DivinationType.RELIGIOUS_RITUALS) errorMsg = "कृपया अपना प्रश्न दर्ज करें।";
                if (divinationType === DivinationType.FAMOUS_PLACE_TRAVEL) errorMsg = "कृपया उस प्रसिद्ध स्थान का नाम दर्ज करें जिसके बारे में आप जानना चाहते हैं।";
                if (divinationType === DivinationType.TRAIN_JOURNEY) errorMsg = "कृपया प्रारंभिक और गंतव्य स्टेशन दर्ज करें।";
                if (divinationType === DivinationType.ENGLISH_GURU) errorMsg = "कृपया वह हिंदी वाक्य दर्ज करें जिसका आप अनुवाद करना चाहते हैं।";
                if (divinationType === DivinationType.VASTU_SHASTRA) errorMsg = "कृपया वास्तु से संबंधित अपना प्रश्न दर्ज करें।";
                if (divinationType === DivinationType.AI_FUTURE_GENERATOR) errorMsg = "कृपया अपना भविष्य जानने के लिए एक प्रश्न दर्ज करें।";
                if (divinationType === DivinationType.PRODUCT_SCANNER) errorMsg = "कृपया संदर्भ वस्तु का नाम दर्ज करें।";
                if (divinationType === DivinationType.OBJECT_COUNTER) errorMsg = "कृपया उस वस्तु का नाम दर्ज करें जिसकी गिनती करनी है।";
                if (divinationType === DivinationType.AI_CALCULATOR) errorMsg = "कृपया अपना गणित का सवाल दर्ज करें।";
                setFormError(errorMsg);
                return;
            }
        }
        if (divinationType === DivinationType.ZODIAC || divinationType === DivinationType.HOROSCOPE) {
            if (!selectedZodiac) {
                setFormError("कृपया एक राशि चुनें।");
                return;
            }
        }
        if (divinationType === DivinationType.SEASONAL_FOOD) {
            if (!selectedMonth) {
                setFormError("कृपया एक महीना चुनें।");
                return;
            }
        }

        onSubmit({ name, dob, timeOfBirth, placeOfBirth, image: image || undefined, question, zodiacSign: zodiacSign || undefined, selectedZodiac: selectedZodiac || undefined, selectedMonth: selectedMonth || undefined, targetLanguage: targetLanguage || undefined, boyName, boyDob, girlName, girlDob, name1, name2, voice });
    };
    
    const handleGenerateImage = async () => {
        setFormError(null);
        setIsGeneratingImage(true);
        try {
            const base64Data = await generatePalmImage();
            const imageFile = base64StringToFile(base64Data, 'mystical-palm.jpeg');
            setImage(imageFile);
        } catch (err) {
            console.error(err);
            setFormError("रहस्यमय हथेली बनाने में विफल। कृपया पुनः प्रयास करें।");
        } finally {
            setIsGeneratingImage(false);
        }
    };

    const renderFormFields = () => {
        switch (divinationType) {
             case DivinationType.AI_CALCULATOR:
                return (
                     <div className="mb-6">
                        <label htmlFor="question" className="block text-purple-200 text-lg mb-2 text-center">अपना गणित का सवाल लिखें</label>
                        <p className="text-center text-purple-300 mb-4">आप सामान्य भाषा में जटिल प्रश्न पूछ सकते हैं।</p>
                        <textarea id="question" value={question} onChange={(e) => setQuestion(e.target.value)} rows={3} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition" placeholder="उदाहरण: 300 का 25% कितना होता है?"></textarea>
                    </div>
                );
             case DivinationType.CODE_INSPECTOR:
                const allTools = toolCategories.flatMap(cat => cat.tools.map(tool => tool.type)).filter(type => type !== DivinationType.CODE_INSPECTOR);
                return (
                    <div className="mb-6">
                        <label htmlFor="tool-select" className="block text-purple-200 text-lg mb-2">निरीक्षण करने के लिए एक टूल चुनें</label>
                        <select
                            id="tool-select"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition"
                        >
                            <option value="" disabled>-- एक टूल चुनें --</option>
                            {allTools.map(tool => (
                                <option key={tool} value={tool}>{tool}</option>
                            ))}
                        </select>
                    </div>
                );
            case DivinationType.OBJECT_COUNTER:
                return (
                    <>
                        <div className="mb-6 text-center">
                            <label className="block text-purple-200 text-lg mb-4">वस्तुओं का चित्र अपलोड करें</label>
                            <input type="file" accept="image/*" ref={galleryInputRef} onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)} className="hidden" />
                            <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)} className="hidden" />
                            
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button type="button" onClick={() => galleryInputRef.current?.click()} className="w-full bg-white/10 p-4 rounded-lg border border-white/20 hover:border-purple-400 transition flex items-center justify-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    गैलरी से चुनें
                                </button>
                                 <button type="button" onClick={() => cameraInputRef.current?.click()} className="w-full bg-white/10 p-4 rounded-lg border border-white/20 hover:border-purple-400 transition flex items-center justify-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    कैमरा खोलें
                                </button>
                            </div>

                            {image && <div className="mt-4"><p className="text-purple-200 mb-2">चयनित चित्र: {image.name}</p><img src={URL.createObjectURL(image)} alt="Object preview" className="mx-auto max-h-48 rounded-lg shadow-lg" /></div>}
                        </div>
                        <div className="mb-6">
                            <label htmlFor="question" className="block text-purple-200 text-lg mb-2">किस वस्तु की गिनती करनी है?</label>
                            <input type="text" id="question" value={question} onChange={(e) => setQuestion(e.target.value)} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition" placeholder="उदाहरण: सेब, बोतलें, पेंच" />
                        </div>
                    </>
                );
            case DivinationType.ROUTE_PLANNER:
                return (
                    <>
                        <div className="mb-6">
                            <label htmlFor="startLocation" className="block text-purple-200 text-lg mb-2">शुरुआती स्थान</label>
                            <input type="text" id="startLocation" value={startLocation} onChange={(e) => setStartLocation(e.target.value)} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition" placeholder="उदाहरण: इंडिया गेट, दिल्ली" />
                        </div>
                        <div className="mb-6">
                            <label htmlFor="endLocation" className="block text-purple-200 text-lg mb-2">गंतव्य स्थान</label>
                            <input type="text" id="endLocation" value={endLocation} onChange={(e) => setEndLocation(e.target.value)} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition" placeholder="उदाहरण: गेटवे ऑफ इंडिया, मुंबई" />
                        </div>
                    </>
                );
            case DivinationType.ASTROLOGY:
            case DivinationType.NUMEROLOGY:
            case DivinationType.BUSINESS_ASTROLOGY:
                return (
                    <>
                        <div className="mb-6">
                            <label htmlFor="name" className="block text-purple-200 text-lg mb-2">पूरा नाम</label>
                            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition" />
                        </div>
                        <div className="mb-6">
                            <label htmlFor="dob" className="block text-purple-200 text-lg mb-2">जन्म तिथि</label>
                            <input type="date" id="dob" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition" />
                        </div>
                        {zodiacSign && (
                            <div className="text-center mb-6 -mt-2 p-3 bg-white/5 rounded-lg animate-fade-in">
                                <p className="text-lg text-purple-200">आपकी राशि: <span className="font-bold text-white">{zodiacSign}</span></p>
                            </div>
                        )}
                    </>
                );
            case DivinationType.JANAM_KUNDLI:
                return (
                    <>
                        <div className="mb-6">
                            <label htmlFor="name" className="block text-purple-200 text-lg mb-2">पूरा नाम</label>
                            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition" required />
                        </div>
                        <div className="mb-6">
                            <label htmlFor="dob" className="block text-purple-200 text-lg mb-2">जन्म तिथि</label>
                            <input type="date" id="dob" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition" required />
                        </div>
                        <div className="mb-6">
                            <label htmlFor="tob" className="block text-purple-200 text-lg mb-2">जन्म समय</label>
                            <input type="time" id="tob" value={timeOfBirth} onChange={(e) => setTimeOfBirth(e.target.value)} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition" required />
                        </div>
                        <div className="mb-6">
                            <label htmlFor="pob" className="block text-purple-200 text-lg mb-2">जन्म स्थान (शहर, देश)</label>
                            <input type="text" id="pob" value={placeOfBirth} onChange={(e) => setPlaceOfBirth(e.target.value)} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition" placeholder="उदाहरण: दिल्ली, भारत" required />
                        </div>
                    </>
                );
            case DivinationType.YOGA_GUIDE_HINDI:
                return (
                    <div className="mb-6">
                        <label className="block text-purple-200 text-lg mb-4 text-center">अपना दिन चुनें</label>
                        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-96 overflow-y-auto pr-2">
                            {Array.from({ length: 60 }, (_, i) => i + 1).map(day => (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => setSelectedYogaDay(day)}
                                    className={`flex items-center justify-center p-3 aspect-square rounded-lg border-2 transition ${selectedYogaDay === day ? 'bg-purple-600 border-purple-400' : 'bg-white/10 border-white/20 hover:border-purple-400'}`}
                                >
                                    <span className="text-sm font-bold">{day}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case DivinationType.AI_TIME_MACHINE:
            case DivinationType.AI_FACE_READING:
                 return (
                    <div className="mb-6 text-center">
                        <label className="block text-purple-200 text-lg mb-4">
                            {divinationType === DivinationType.AI_TIME_MACHINE ? 'भविष्य में अपना चेहरा देखने के लिए एक स्पष्ट चित्र अपलोड करें' : 'विश्लेषण के लिए चेहरे का एक स्पष्ट चित्र अपलोड करें'}
                        </label>
                        <input type="file" accept="image/*" ref={galleryInputRef} onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)} className="hidden" />
                        <input type="file" accept="image/*" capture="user" ref={cameraInputRef} onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)} className="hidden" />
                        
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button type="button" onClick={() => galleryInputRef.current?.click()} className="w-full bg-white/10 p-4 rounded-lg border border-white/20 hover:border-purple-400 transition flex items-center justify-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                गैलरी से चुनें
                            </button>
                             <button type="button" onClick={() => cameraInputRef.current?.click()} className="w-full bg-white/10 p-4 rounded-lg border border-white/20 hover:border-purple-400 transition flex items-center justify-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                कैमरा खोलें
                            </button>
                        </div>

                        {image && <div className="mt-4"><p className="text-purple-200 mb-2">चयनित चित्र: {image.name}</p><img src={URL.createObjectURL(image)} alt="Face preview" className="mx-auto max-h-48 rounded-lg shadow-lg" /></div>}
                    </div>
                );
            case DivinationType.PALMISTRY:
                return (
                    <div className="mb-6 text-center">
                        {isGeneratingImage ? (
                             <div className="py-12">
                                <div className="relative w-20 h-20 mx-auto mb-4">
                                    <div className="absolute inset-0 border-4 border-purple-400/50 rounded-full animate-spin"></div>
                                    <div className="absolute inset-2 border-4 border-pink-400/50 rounded-full animate-spin [animation-direction:reverse]"></div>
                                </div>
                                <p className="text-lg text-purple-200">आपकी रहस्यमय हथेली बना रहे हैं...</p>
                            </div>
                        ) : (
                            <>
                                <label className="block text-purple-200 text-lg mb-4">अपनी हथेली का एक स्पष्ट चित्र अपलोड करें</label>
                                <input type="file" accept="image/*" ref={galleryInputRef} onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)} className="hidden" />
                                <input type="file" accept="image/*" capture="user" ref={cameraInputRef} onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)} className="hidden" />
                                
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button type="button" onClick={() => galleryInputRef.current?.click()} disabled={isGeneratingImage} className="w-full bg-white/10 p-4 rounded-lg border border-white/20 hover:border-purple-400 transition flex items-center justify-center gap-2 disabled:opacity-50">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        गैलरी से चुनें
                                    </button>
                                     <button type="button" onClick={() => cameraInputRef.current?.click()} disabled={isGeneratingImage} className="w-full bg-white/10 p-4 rounded-lg border border-white/20 hover:border-purple-400 transition flex items-center justify-center gap-2 disabled:opacity-50">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        कैमरा खोलें
                                    </button>
                                </div>

                                {image && <div className="mt-4"><p className="text-purple-200 mb-2">चयनित चित्र: {image.name}</p><img src={URL.createObjectURL(image)} alt="Palm preview" className="mx-auto max-h-48 rounded-lg shadow-lg" /></div>}
            
                                <div className="my-4 flex items-center">
                                    <div className="flex-grow border-t border-white/20"></div>
                                    <span className="flex-shrink mx-4 text-purple-300">या</span>
                                    <div className="flex-grow border-t border-white/20"></div>
                                </div>
            
                                <button
                                    type="button"
                                    onClick={handleGenerateImage}
                                    disabled={isGeneratingImage}
                                    className="w-full bg-gradient-to-r from-purple-800/70 to-pink-700/70 p-3 rounded-lg border border-purple-400/50 hover:from-purple-800 hover:to-pink-700 transition text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                     ✨ एक रहस्यमय हथेली बनाएं
                                </button>
                            </>
                        )}
                    </div>
                );
            case DivinationType.PRODUCT_SCANNER:
                return (
                    <>
                        <div className="mb-6 text-center">
                            <label className="block text-purple-200 text-lg mb-2">उत्पाद का चित्र अपलोड करें</label>
                             <p className="text-purple-300 mb-4">सटीक माप के लिए, कृपया उत्पाद के बगल में एक मानक आकार की वस्तु (जैसे सिक्का या क्रेडिट कार्ड) रखें।</p>
                            <input type="file" accept="image/*" ref={galleryInputRef} onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)} className="hidden" />
                            <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)} className="hidden" />
                            
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button type="button" onClick={() => galleryInputRef.current?.click()} className="w-full bg-white/10 p-4 rounded-lg border border-white/20 hover:border-purple-400 transition flex items-center justify-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    गैलरी से चुनें
                                </button>
                                 <button type="button" onClick={() => cameraInputRef.current?.click()} className="w-full bg-white/10 p-4 rounded-lg border border-white/20 hover:border-purple-400 transition flex items-center justify-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    कैमरा खोलें
                                </button>
                            </div>

                            {image && <div className="mt-4"><p className="text-purple-200 mb-2">चयनित चित्र: {image.name}</p><img src={URL.createObjectURL(image)} alt="Product preview" className="mx-auto max-h-48 rounded-lg shadow-lg" /></div>}
                        </div>
                        <div className="mb-6">
                            <label htmlFor="question" className="block text-purple-200 text-lg mb-2">संदर्भ वस्तु का नाम</label>
                            <input type="text" id="question" value={question} onChange={(e) => setQuestion(e.target.value)} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition" placeholder="उदाहरण: एक रुपये का सिक्का, क्रेडिट कार्ड" />
                        </div>
                    </>
                );
             case DivinationType.SCAN_TRANSLATE:
                return (
                    <>
                        <div className="mb-6 text-center">
                            <label className="block text-purple-200 text-lg mb-4">स्कैन करने के लिए एक चित्र अपलोड करें</label>
                            <input type="file" accept="image/*" ref={galleryInputRef} onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)} className="hidden" />
                            <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)} className="hidden" />
                            
                             <div className="flex flex-col sm:flex-row gap-4">
                                <button type="button" onClick={() => galleryInputRef.current?.click()} className="w-full bg-white/10 p-4 rounded-lg border border-white/20 hover:border-purple-400 transition flex items-center justify-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    गैलरी से चुनें
                                </button>
                                 <button type="button" onClick={() => cameraInputRef.current?.click()} className="w-full bg-white/10 p-4 rounded-lg border border-white/20 hover:border-purple-400 transition flex items-center justify-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    कैमरा खोलें
                                </button>
                            </div>

                            {image && <div className="mt-4"><p className="text-purple-200 mb-2">चयनित चित्र: {image.name}</p><img src={URL.createObjectURL(image)} alt="Scan preview" className="mx-auto max-h-48 rounded-lg shadow-lg" /></div>}
                        </div>
                        <div className="mb-6">
                           <label htmlFor="language" className="block text-purple-200 text-lg mb-2">किस भाषा में अनुवाद करना है?</label>
                            <select
                                id="language"
                                value={targetLanguage}
                                onChange={(e) => setTargetLanguage(e.target.value)}
                                className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition"
                            >
                                {languages.map(lang => (
                                    <option key={lang.code} value={lang.name}>{lang.name}</option>
                                ))}
                            </select>
                        </div>
                    </>
                );
            case DivinationType.AI_FUTURE_GENERATOR:
                return (
                     <div className="mb-6">
                        <label htmlFor="question" className="block text-purple-200 text-lg mb-2 text-center">अपने भविष्य के बारे में पूछें</label>
                        <p className="text-center text-purple-300 mb-4">आपका कोई भी प्रश्न, AI जवाब देगा।</p>
                        <textarea id="question" value={question} onChange={(e) => setQuestion(e.target.value)} rows={3} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition" placeholder="उदाहरण: क्या मैं अपने जीवन में सफल होऊँगा?"></textarea>
                    </div>
                );
            case DivinationType.FUTURE_STORY:
                return (
                     <div className="mb-6">
                        <label htmlFor="storyPremise" className="block text-purple-200 text-lg mb-2 text-center">अपनी कहानी के लिए एक विचार दें</label>
                        <p className="text-center text-purple-300 mb-4">एक पात्र, स्थान या स्थिति का वर्णन करें।</p>
                        <textarea id="storyPremise" value={storyPremise} onChange={(e) => setStoryPremise(e.target.value)} rows={3} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition" placeholder="उदाहरण: एक अंतरिक्ष यात्री जो एक अज्ञात ग्रह पर खो गया है।"></textarea>
                    </div>
                );
            case DivinationType.PRASHNA_PARIKSHA:
            case DivinationType.TAROT:
                return (
                     <div className="mb-6">
                        <label htmlFor="question" className="block text-purple-200 text-lg mb-2 text-center">अपने प्रश्न पर ध्यान केंद्रित करें</label>
                        <p className="text-center text-purple-300 mb-4">जब आप तैयार हों, तो अपना प्रश्न नीचे लिखें।</p>
                        <textarea id="question" value={question} onChange={(e) => setQuestion(e.target.value)} rows={3} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition" placeholder="उदाहरण: मेरे करियर के लिए क्या मार्गदर्शन है?"></textarea>
                    </div>
                );
            case DivinationType.LOVE_RELATIONSHIP:
                 return (
                     <div className="mb-6">
                        <label htmlFor="question" className="block text-purple-200 text-lg mb-2 text-center">अपने प्रेम संबंध के बारे में पूछें</label>
                        <p className="text-center text-purple-300 mb-4">अपने रिश्ते की स्थिति या अपने प्रश्न पर ध्यान केंद्रित करें।</p>
                        <textarea id="question" value={question} onChange={(e) => setQuestion(e.target.value)} rows={4} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition" placeholder="उदाहरण: मेरे और मेरे साथी के बीच भविष्य में संबंध कैसे रहेंगे?"></textarea>
                    </div>
                );
            case DivinationType.MARRIAGE_COMPATIBILITY:
                return (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                            <div className="mb-6">
                                <h3 className="text-xl text-center text-blue-300 font-semibold mb-3">लड़के का विवरण</h3>
                                <label htmlFor="boyName" className="block text-purple-200 text-lg mb-2">पूरा नाम</label>
                                <input type="text" id="boyName" value={boyName} onChange={(e) => setBoyName(e.target.value)} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition" />
                                <label htmlFor="boyDob" className="block text-purple-200 text-lg mb-2 mt-4">जन्म तिथि</label>
                                <input type="date" id="boyDob" value={boyDob} onChange={(e) => setBoyDob(e.target.value)} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition" />
                            </div>
                            <div className="mb-6">
                                <h3 className="text-xl text-center text-pink-300 font-semibold mb-3">लड़की का विवरण</h3>
                                <label htmlFor="girlName" className="block text-purple-200 text-lg mb-2">पूरा नाम</label>
                                <input type="text" id="girlName" value={girlName} onChange={(e) => setGirlName(e.target.value)} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition" />
                                <label htmlFor="girlDob" className="block text-purple-200 text-lg mb-2 mt-4">जन्म तिथि</label>
                                <input type="date" id="girlDob" value={girlDob} onChange={(e) => setGirlDob(e.target.value)} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition" />
                            </div>
                        </div>
                    </>
                );
            case DivinationType.LOVE_COMPATIBILITY:
                return (
                    <>
                        <div className="mb-6">
                            <label htmlFor="name1" className="block text-purple-200 text-lg mb-2">पहला नाम या राशि</label>
                            <input type="text" id="name1" value={name1} onChange={(e) => setName1(e.target.value)} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition" placeholder="उदाहरण: राहुल या मेष"/>
                        </div>
                        <div className="text-center text-4xl font-bold text-pink-400 my-4">+</div>
                        <div className="mb-6">
                            <label htmlFor="name2" className="block text-purple-200 text-lg mb-2">दूसरा नाम या राशि</label>
                            <input type="text" id="name2" value={name2} onChange={(e) => setName2(e.target.value)} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition" placeholder="उदाहरण: प्रिया या तुला"/>
                        </div>
                    </>
                );
            case DivinationType.PILGRIMAGE:
                 return (
                     <div className="mb-6">
                        <label htmlFor="question" className="block text-purple-200 text-lg mb-2">आप किस तीर्थ स्थल या कहानी के बारे में जानना चाहते हैं?</label>
                        <textarea id="question" value={question} onChange={(e) => setQuestion(e.target.value)} rows={4} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition" placeholder="उदाहरण: केदारनाथ मंदिर का इतिहास"></textarea>
                    </div>
                );
            case DivinationType.DREAM:
                 return (
                    <div className="mb-6">
                        <label htmlFor="question" className="block text-purple-200 text-lg mb-2 text-center">अपने सपने का वर्णन करें</label>
                        <textarea id="question" value={question} onChange={(e) => setQuestion(e.target.value)} rows={4} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition" placeholder="उदाहरण: मैंने देखा कि मैं उड़ रहा था..."></textarea>
                    </div>
                );
            case DivinationType.TRAVEL:
                 return (
                     <div className="mb-6">
                        <label htmlFor="question" className="block text-purple-200 text-lg mb-2">अपनी यात्रा का विवरण दर्ज करें</label>
                        <textarea id="question" value={question} onChange={(e) => setQuestion(e.target.value)} rows={3} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition" placeholder="उदाहरण: मैं अगले महीने व्यावसायिक यात्रा के लिए मुंबई जा रहा हूँ।"></textarea>
                    </div>
                );
            case DivinationType.TRAIN_JOURNEY:
                 return (
                     <div className="mb-6">
                        <label htmlFor="question" className="block text-purple-200 text-lg mb-2">प्रारंभिक और गंतव्य स्टेशन दर्ज करें</label>
                        <input type="text" id="question" value={question} onChange={(e) => setQuestion(e.target.value)} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition" placeholder="उदाहरण: दिल्ली से मुंबई" />
                    </div>
                );
            case DivinationType.MOLE:
                 return (
                     <div className="mb-6">
                        <label htmlFor="question" className="block text-purple-200 text-lg mb-2">शरीर पर तिल का स्थान बताएं</label>
                        <input type="text" id="question" value={question} onChange={(e) => setQuestion(e.target.value)} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition" placeholder="उदाहरण: दाहिने हाथ पर" />
                    </div>
                );
            case DivinationType.ANG_SPHURAN:
                 return (
                     <div className="mb-6">
                        <label htmlFor="question" className="block text-purple-200 text-lg mb-2">कौन सा अंग फड़क रहा है?</label>
                        <input type="text" id="question" value={question} onChange={(e) => setQuestion(e.target.value)} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition" placeholder="उदाहरण: पुरुषों के लिए दाहिनी आंख" />
                    </div>
                );
             case DivinationType.SNEEZING:
                 return (
                     <div className="mb-6">
                        <label htmlFor="question" className="block text-purple-200 text-lg mb-2">छींक का विवरण दें</label>
                        <textarea id="question" value={question} onChange={(e) => setQuestion(e.target.value)} rows={3} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition" placeholder="उदाहरण: घर से निकलते समय छींक आना"></textarea>
                    </div>
                );
            case DivinationType.FOOD_COMBINATION:
                 return (
                     <div className="mb-6">
                        <label htmlFor="question" className="block text-purple-200 text-lg mb-2">खाद्य पदार्थों की सूची दर्ज करें</label>
                        <textarea id="question" value={question} onChange={(e) => setQuestion(e.target.value)} rows={3} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition" placeholder="उदाहरण: दूध, केला, दही, मछली"></textarea>
                    </div>
                );
            case DivinationType.RELIGIOUS_RITUALS:
                 return (
                     <div className="mb-6">
                        <label htmlFor="question" className="block text-purple-200 text-lg mb-2">आप किस धार्मिक अनुष्ठान या पाठ के बारे में जानना चाहते हैं?</label>
                        <textarea id="question" value={question} onChange={(e) => setQuestion(e.target.value)} rows={3} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition" placeholder="उदाहरण: हनुमान चालीसा का पाठ, सत्यनारायण पूजा विधि"></textarea>
                    </div>
                );
            case DivinationType.FAMOUS_PLACE_TRAVEL:
                 return (
                     <div className="mb-6">
                        <label htmlFor="question" className="block text-purple-200 text-lg mb-2">किस प्रसिद्ध स्थान के बारे में जानना चाहते हैं?</label>
                        <input type="text" id="question" value={question} onChange={(e) => setQuestion(e.target.value)} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition" placeholder="उदाहरण: ताज महल, आगरा" />
                    </div>
                );
            case DivinationType.ENGLISH_GURU:
                 return (
                     <div className="mb-6">
                        <label htmlFor="question" className="block text-purple-200 text-lg mb-2">हिंदी वाक्य दर्ज करें</label>
                        <textarea id="question" value={question} onChange={(e) => setQuestion(e.target.value)} rows={3} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition" placeholder="उदाहरण: मैं अंग्रेजी सीखना चाहता हूँ।"></textarea>
                    </div>
                );
             case DivinationType.VASTU_SHASTRA:
                 return (
                     <div className="mb-6">
                        <label htmlFor="question" className="block text-purple-200 text-lg mb-2">वास्तु से संबंधित अपना प्रश्न पूछें</label>
                        <textarea id="question" value={question} onChange={(e) => setQuestion(e.target.value)} rows={3} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition" placeholder="उदाहरण: मेरे घर का मुख्य द्वार दक्षिण दिशा में है।"></textarea>
                    </div>
                );
            case DivinationType.TEXT_TO_IMAGE:
                 return (
                    <>
                        <div className="mb-6">
                            <label htmlFor="question" className="block text-purple-200 text-lg mb-2">चित्र बनाने के लिए विवरण लिखें</label>
                            <textarea id="question" value={question} onChange={(e) => setQuestion(e.target.value)} rows={4} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition" placeholder="उदाहरण: एक उड़ता हुआ घोड़ा जो सितारों के बीच दौड़ रहा है..."></textarea>
                        </div>
                        <div className="my-4 flex items-center">
                            <div className="flex-grow border-t border-white/20"></div>
                            <span className="flex-shrink mx-4 text-purple-300">या</span>
                            <div className="flex-grow border-t border-white/20"></div>
                        </div>
                        <div className="mb-6 text-center">
                            <label className="block text-purple-200 text-lg mb-4">चित्र बनाने के लिए लिखे हुए पेज की फोटो अपलोड करें</label>
                            <input type="file" accept="image/*" ref={galleryInputRef} onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)} className="hidden" />
                             <button type="button" onClick={() => galleryInputRef.current?.click()} className="w-full sm:w-auto bg-white/10 p-4 rounded-lg border border-white/20 hover:border-purple-400 transition flex items-center justify-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                गैलरी से चुनें
                            </button>
                            {image && <div className="mt-4"><p className="text-purple-200 mb-2">चयनित चित्र: {image.name}</p><img src={URL.createObjectURL(image)} alt="Scan preview" className="mx-auto max-h-48 rounded-lg shadow-lg" /></div>}
                        </div>
                    </>
                );
            case DivinationType.STORY_TO_IMAGES:
                return (
                    <div className="mb-6">
                        <label htmlFor="question" className="block text-purple-200 text-lg mb-2">अपनी कहानी लिखें (लगभग 100 शब्द)</label>
                        <textarea id="question" value={question} onChange={(e) => setQuestion(e.target.value)} rows={5} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition" placeholder="एक बार की बात है, एक जंगल में..."></textarea>
                    </div>
                );
            case DivinationType.TEXT_TO_VOICE:
                return (
                     <>
                        <div className="mb-6">
                            <label htmlFor="question" className="block text-purple-200 text-lg mb-2">ऑडियो में बदलने के लिए टेक्स्ट दर्ज करें</label>
                            <textarea id="question" value={question} onChange={(e) => setQuestion(e.target.value)} rows={5} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition" placeholder="नमस्ते, आप कैसे हैं?"></textarea>
                        </div>
                        <div className="mb-6">
                             <label className="block text-purple-200 text-lg mb-2">आवाज चुनें</label>
                             <div className="flex gap-4">
                                 <button type="button" onClick={() => setVoice('female')} className={`px-6 py-3 rounded-lg border-2 transition ${voice === 'female' ? 'bg-pink-600 border-pink-400' : 'bg-white/10 border-white/20'}`}>Female</button>
                                 <button type="button" onClick={() => setVoice('male')} className={`px-6 py-3 rounded-lg border-2 transition ${voice === 'male' ? 'bg-blue-600 border-blue-400' : 'bg-white/10 border-white/20'}`}>Male</button>
                             </div>
                        </div>
                     </>
                );
            case DivinationType.STORY_TO_VIDEO:
            case DivinationType.IMAGE_TO_VIDEO:
                 return (
                    <>
                        {divinationType === DivinationType.STORY_TO_VIDEO && (
                            <div className="mb-6">
                                <label htmlFor="storyScript" className="block text-purple-200 text-lg mb-2">कहानी / स्क्रिप्ट</label>
                                <textarea id="storyScript" value={storyScript} onChange={(e) => setStoryScript(e.target.value)} rows={5} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition" placeholder="यहां अपनी कहानी या वीडियो के लिए विस्तृत दृश्य-दर-दृश्य स्क्रिप्ट लिखें..."></textarea>
                            </div>
                        )}
                        <div className="mb-6 text-center">
                            <label className="block text-purple-200 text-lg mb-4">एक संदर्भ चित्र अपलोड करें (वैकल्पिक)</label>
                             <input type="file" accept="image/*" ref={galleryInputRef} onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)} className="hidden" />
                             <button type="button" onClick={() => galleryInputRef.current?.click()} className="w-full sm:w-auto bg-white/10 p-4 rounded-lg border border-white/20 hover:border-purple-400 transition flex items-center justify-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                गैलरी से चुनें
                            </button>
                            {image && <div className="mt-4"><p className="text-purple-200 mb-2">चयनित चित्र: {image.name}</p><img src={URL.createObjectURL(image)} alt="Preview" className="mx-auto max-h-48 rounded-lg shadow-lg" /></div>}
                        </div>
                        {divinationType === DivinationType.IMAGE_TO_VIDEO && (
                             <div className="mb-6">
                                <label htmlFor="question" className="block text-purple-200 text-lg mb-2">अतिरिक्त निर्देश (वैकल्पिक)</label>
                                <textarea id="question" value={question} onChange={(e) => setQuestion(e.target.value)} rows={2} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition" placeholder="उदाहरण: इस चित्र को सिनेमैटिक बनाएं"></textarea>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="mb-4">
                                <label htmlFor="resolution" className="block text-purple-200 text-lg mb-2">रिज़ॉल्यूशन</label>
                                <select id="resolution" value={resolution} onChange={(e) => setResolution(e.target.value as '720p' | '1080p')} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition">
                                    <option value="720p">720p (Fast)</option>
                                    <option value="1080p">1080p (High Quality)</option>
                                </select>
                            </div>
                             <div className="mb-4">
                                <label htmlFor="aspectRatio" className="block text-purple-200 text-lg mb-2">एस्पेक्ट रेश्यो</label>
                                <select id="aspectRatio" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as '16:9' | '9:16')} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition">
                                    <option value="16:9">16:9 (Landscape)</option>
                                    <option value="9:16">9:16 (Portrait)</option>
                                </select>
                            </div>
                        </div>
                         {divinationType === DivinationType.STORY_TO_VIDEO && (
                             <>
                                 <div className="mb-4">
                                     <label htmlFor="visualStyle" className="block text-purple-200 text-lg mb-2">दृश्य शैली (Visual Style)</label>
                                     <select id="visualStyle" value={visualStyle} onChange={(e) => setVisualStyle(e.target.value)} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition">
                                         <option value="">कोई नहीं</option>
                                         {visualStyles.map(style => <option key={style} value={style}>{style}</option>)}
                                     </select>
                                 </div>
                                 <div className="mb-4">
                                     <label htmlFor="musicStyle" className="block text-purple-200 text-lg mb-2">संगीत शैली (Music Style)</label>
                                     <input type="text" id="musicStyle" value={musicStyle} onChange={(e) => setMusicStyle(e.target.value)} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition" placeholder="जैसे: शांत, महाकाव्य, उत्साहित" />
                                 </div>
                                <div className="mb-4">
                                    <label className="block text-purple-200 text-lg mb-2">अतिरिक्त विकल्प</label>
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2">
                                            <input type="checkbox" id="voiceover" checked={addVoiceOver} onChange={(e) => setAddVoiceOver(e.target.checked)} className="h-5 w-5 rounded border-purple-400 text-purple-600 focus:ring-purple-500 bg-transparent" />
                                            <label htmlFor="voiceover" className="text-purple-200">वॉयसओवर जोड़ें</label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input type="checkbox" id="captions" checked={addCaptions} onChange={(e) => setAddCaptions(e.target.checked)} className="h-5 w-5 rounded border-purple-400 text-purple-600 focus:ring-purple-500 bg-transparent" />
                                            <label htmlFor="captions" className="text-purple-200">कैप्शन जोड़ें</label>
                                        </div>
                                    </div>
                                </div>
                             </>
                         )}
                    </>
                );
            case DivinationType.ZODIAC:
            case DivinationType.HOROSCOPE:
            case DivinationType.DAILY_HOROSCOPE:
                return (
                    <div className="mb-6">
                        <label htmlFor="zodiac" className="block text-purple-200 text-lg mb-2 text-center">अपनी राशि चुनें</label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                            {zodiacs.map(z => (
                                <button
                                    key={z.name}
                                    type="button"
                                    onClick={() => setSelectedZodiac(z.name)}
                                    className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition ${selectedZodiac === z.name ? 'bg-purple-600 border-purple-400' : 'bg-white/10 border-white/20 hover:border-purple-400'}`}
                                >
                                    <span className="text-4xl">{z.emoji}</span>
                                    <span className="text-sm mt-1">{z.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case DivinationType.SEASONAL_FOOD:
                return (
                    <div className="mb-6">
                        <label htmlFor="month" className="block text-purple-200 text-lg mb-2 text-center">एक महीना चुनें</label>
                        <select
                            id="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition"
                        >
                            <option value="" disabled>-- महीना चुनें --</option>
                            {months.map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    </div>
                );
            default:
                return (
                    <div className="text-center">
                         <p className="text-lg text-purple-200 mb-6">इस टूल के लिए कोई इनपुट आवश्यक नहीं है या यह अभी तक कॉन्फ़िगर नहीं किया गया है।</p>
                    </div>
                );
        }
    };

    const renderHoroscopeButtons = () => {
        if (divinationType === DivinationType.HOROSCOPE) {
            return (
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                    <button type="button" onClick={() => handleHoroscopeSubmit('daily')} className="w-full px-6 py-3 bg-white/10 text-purple-200 border border-white/20 rounded-full font-bold text-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-white/20">दैनिक</button>
                    <button type="button" onClick={() => handleHoroscopeSubmit('weekly')} className="w-full px-6 py-3 bg-white/10 text-purple-200 border border-white/20 rounded-full font-bold text-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-white/20">साप्ताहिक</button>
                    <button type="button" onClick={() => handleHoroscopeSubmit('monthly')} className="w-full px-6 py-3 bg-white/10 text-purple-200 border border-white/20 rounded-full font-bold text-lg transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-white/20">मासिक</button>
                </div>
            );
        }
        if (divinationType === DivinationType.DAILY_HOROSCOPE) {
             return (
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                    <button type="button" onClick={() => handleHoroscopeSubmit('daily')} className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 ease-in-out text-lg">आज का राशिफल देखें</button>
                </div>
            );
        }
        return null;
    }

    const getTitle = () => {
        const names = tDiv(divinationType);
        return (
            <>
                <span className="block font-sans font-bold text-3xl">{names.en}</span>
                <span className="block font-hindi text-2xl text-purple-300">{names.hi}</span>
            </>
        );
    };

    const getSubmitButtonText = () => {
        if (divinationType === DivinationType.AI_CALCULATOR) return 'गणना करें';
        if (divinationType === DivinationType.ROUTE_PLANNER) return 'मार्ग खोजें';
        if (divinationType === DivinationType.OBJECT_COUNTER) return 'गिनती करें';
        if (divinationType === DivinationType.CODE_INSPECTOR) return 'कोड देखें';
        return 'भविष्यवाणी प्राप्त करें';
    }

    return (
        <Card className="animate-fade-in">
            <button onClick={onBack} className="absolute top-6 left-6 text-purple-300 hover:text-white transition">&larr; वापस</button>
            <div className="mb-8 text-center">
                {getTitle()}
            </div>
            
            {divinationType === DivinationType.DISHA_SHOOL ? (
                <div className="text-center">
                    <p className="text-lg text-purple-200 mb-6">किस दिन के लिए दिशा शूल जानना चाहते हैं?</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {daysOfWeek.map(day => (
                            <button
                                key={day}
                                onClick={() => handleDaySelect(day)}
                                className={`p-4 rounded-lg border-2 transition ${selectedDay === day ? 'bg-purple-600 border-purple-400' : 'bg-white/10 border-white/20 hover:border-purple-400'}`}
                            >
                                {day}
                            </button>
                        ))}
                    </div>
                    {dishaShoolResult && (
                        <div className="bg-black/20 p-6 rounded-lg animate-fade-in">
                            <h3 className="text-2xl font-bold text-white mb-2">{dishaShoolResult.day}</h3>
                            <p className="text-lg text-purple-200">दिशा शूल: <span className="font-semibold text-white">{dishaShoolResult.direction}</span></p>
                            <p className="text-lg text-purple-200 mt-2">उपाय: <span className="font-semibold text-white">{dishaShoolResult.remedy}</span></p>
                        </div>
                    )}
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    {renderFormFields()}

                    {(error || formError) && <p className="text-red-400 mb-4 text-center">{error || formError}</p>}
                    
                    {divinationType === DivinationType.HOROSCOPE || divinationType === DivinationType.DAILY_HOROSCOPE ? (
                        renderHoroscopeButtons()
                    ) : (divinationType !== DivinationType.DAILY_FORTUNE_CARD && divinationType !== DivinationType.TRIKAL_GYAN) && (
                        <div className="text-center mt-6">
                            <button type="submit" className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 ease-in-out text-lg">
                                {getSubmitButtonText()}
                            </button>
                        </div>
                    )}
                </form>
            )}
        </Card>
    );
};

export default InputForm;
