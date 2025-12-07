

import React, { useState, useEffect, useCallback } from 'react';
import { DivinationType, ShowcaseTool } from '../types';
import { useAppContext } from '../App';

interface ToolShowcaseSliderProps {
    onSelect: (type: DivinationType) => void;
}

const showcaseTools: ShowcaseTool[] = [
    {
        type: DivinationType.DIVINATION_STORE,
        icon: '',
        description: '',
        motivationalText: '',
        imageUrl: 'https://res.cloudinary.com/de2eehtiy/image/upload/v1764846050/b45263c1-c531-4c89-8541-e17ded96197f_tudswh.png'
    },
    {
        type: DivinationType.MOBILE_ACCESSORIES,
        icon: '📱',
        description: 'नवीनतम मोबाइल एक्सेसरीज़ और इलेक्ट्रॉनिक गैजेट्स की हमारी श्रृंखला देखें।',
        motivationalText: 'अपनी तकनीक को अपग्रेड करें, अपने जीवन को बेहतर बनाएं।',
    },
    {
        type: DivinationType.TANTRA_MANTRA_YANTRA_EBOOK,
        icon: '📚',
        description: 'प्राचीन ज्ञान और आध्यात्मिक रहस्यों से भरी हमारी ई-पुस्तकों का संग्रह खोजें।',
        motivationalText: 'ज्ञान की शक्ति को अनलॉक करें।',
    },
    {
        type: DivinationType.PUJAN_SAMAGRI,
        icon: '🛍️',
        description: 'अपनी सभी पूजा आवश्यकताओं के लिए पवित्र वस्तुओं, मूर्तियों और सामग्रियों की खरीदारी करें।',
        motivationalText: 'अपनी आध्यात्मिक यात्रा को समृद्ध बनाएं।',
    },
    {
        type: DivinationType.GEMS_JEWELRY,
        icon: '💎',
        description: 'सकारात्मक ऊर्जा और सुंदरता के लिए हमारे असली रत्नों और आभूषणों का संग्रह देखें।',
        motivationalText: 'सितारों की शक्ति को पहनें।',
    },
    {
        type: DivinationType.LADIES_GENTS_BABY_SHOES,
        icon: '👟',
        description: 'पूरे परिवार के लिए स्टाइलिश और आरामदायक जूतों की हमारी नवीनतम रेंज खोजें।',
        motivationalText: 'हर कदम में आराम और स्टाइल।',
    },
    {
        type: DivinationType.LADIES_GENTS_ACCESSORIES,
        icon: '👜',
        description: 'अपने लुक को पूरा करने के लिए पर्स, बेल्ट, और अन्य एक्सेसरीज़ की हमारी शानदार कलेक्शन देखें।',
        motivationalText: 'छोटी-छोटी चीजें बड़ा बदलाव लाती हैं।',
    },
];

const ToolShowcaseSlider: React.FC<ToolShowcaseSliderProps> = ({ onSelect }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const { tDiv } = useAppContext();

    const nextSlide = useCallback(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % showcaseTools.length);
    }, []);

    useEffect(() => {
        const slideInterval = setInterval(nextSlide, 7000); // Change slide every 7 seconds
        return () => clearInterval(slideInterval);
    }, [nextSlide]);

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    const currentTool = showcaseTools[currentIndex];
    const toolName = tDiv(currentTool.type);

    return (
        <div className="w-full max-w-4xl mx-auto mb-8 relative">
            <div 
                key={currentIndex} // Re-trigger animation on slide change
                className={`aspect-video bg-white/10 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 transition-all duration-300 hover:shadow-purple-500/20 cursor-pointer overflow-hidden ${currentTool.imageUrl ? 'p-0' : 'p-6 md:p-8 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8'}`}
                onClick={() => onSelect(currentTool.type)}
                role="button"
                tabIndex={0}
                aria-label={`Select ${toolName.en}`}
            >
                {currentTool.imageUrl ? (
                    <img 
                        src={currentTool.imageUrl} 
                        alt="Special Offer" 
                        className="w-full h-full object-fill sm:object-cover"
                    />
                ) : (
                    <>
                        <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-black/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-7xl md:text-8xl icon-glow icon-float">{currentTool.icon}</span>
                        </div>
                        <div className="text-center md:text-left slide-content-anim">
                            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                <span className="block font-sans">{toolName.en}</span>
                                <span className="block font-hindi text-xl text-purple-200/90">{toolName.hi}</span>
                            </h3>
                            <p className="text-base md:text-lg text-purple-200 mb-3">
                                {currentTool.description}
                            </p>
                            <p className="text-base font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-400 italic">
                                "{currentTool.motivationalText}"
                            </p>
                        </div>
                    </>
                )}
            </div>
            
            <div className="flex justify-center gap-2.5 mt-4 absolute -bottom-6 left-1/2 -translate-x-1/2">
                {showcaseTools.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${currentIndex === index ? 'bg-purple-400 scale-125' : 'bg-white/30 hover:bg-white/60'}`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default ToolShowcaseSlider;