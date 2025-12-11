
import React, { useState, useEffect, useCallback } from 'react';
import { DivinationType, ShowcaseTool } from '../types';
import { useAppContext } from '../App';

interface ToolShowcaseSliderProps {
    onSelect: (type: DivinationType) => void;
}

const showcaseTools: ShowcaseTool[] = [
    {
        type: DivinationType.TANTRA_MANTRA_YANTRA_EBOOK,
        icon: '📕',
        description: 'Vashikaran & Attraction Secrets. Get the PDF now.',
        descriptionHi: 'वशीकरण और आकर्षण के रहस्य। अभी पीडीएफ प्राप्त करें।',
        motivationalText: 'Control your destiny.',
        motivationalTextHi: 'अपनी नियति को नियंत्रित करें।'
    },
    {
        type: DivinationType.MOBILE_ACCESSORIES,
        icon: '🎧',
        description: 'Premium Wireless Earbuds. Deep bass, long battery.',
        descriptionHi: 'प्रीमियम वायरलेस ईयरबड्स। शानदार साउंड, लंबी बैटरी।',
        motivationalText: 'Feel the music.',
        motivationalTextHi: 'संगीत को महसूस करें।'
    },
    {
        type: DivinationType.DIVINATION_STORE,
        icon: '👑',
        description: 'Get VIP Access. Download all E-books for FREE.',
        descriptionHi: 'वीआईपी एक्सेस प्राप्त करें। सभी ई-बुक्स मुफ्त में डाउनलोड करें।',
        motivationalText: 'Join the Premium Club.',
        motivationalTextHi: 'प्रीमियम क्लब में शामिल हों।'
    },
    {
        type: DivinationType.TANTRA_MANTRA_YANTRA_EBOOK,
        icon: '📈',
        description: '80+ Marketing Courses & Softwares. Boom your business.',
        descriptionHi: '80+ मार्केटिंग कोर्स और सॉफ्टवेयर। अपना बिजनेस बढ़ाएं।',
        motivationalText: 'Become a marketing guru.',
        motivationalTextHi: 'मार्केटिंग गुरु बनें।'
    },
    {
        type: DivinationType.MOBILE_ACCESSORIES,
        icon: '🤳',
        description: 'Bluetooth Selfie Stick with Tripod. Capture perfect shots.',
        descriptionHi: 'ब्लूटूथ सेल्फी स्टिक (ट्राइपॉड के साथ)। बेहतरीन फोटो लें।',
        motivationalText: 'Capture every moment.',
        motivationalTextHi: 'हर पल को कैद करें।'
    },
    {
        type: DivinationType.TANTRA_MANTRA_YANTRA_EBOOK,
        icon: '📊',
        description: 'Master the Stock Market. Learn trading strategies.',
        descriptionHi: 'शेयर बाजार में महारत हासिल करें। ट्रेडिंग के तरीके सीखें।',
        motivationalText: 'Build your wealth.',
        motivationalTextHi: 'अपनी दौलत बढ़ाएं।'
    },
    {
        type: DivinationType.LADIES_GENTS_BABY_SHOES,
        icon: '👟',
        description: 'Trendy Shoes for Men & Women. Comfort meets style.',
        descriptionHi: 'पुरुषों और महिलाओं के लिए ट्रेंडी जूते। आराम और स्टाइल।',
        motivationalText: 'Step up your game.',
        motivationalTextHi: 'अपना स्टाइल बढ़ाएं।'
    },
    {
        type: DivinationType.TANTRA_MANTRA_YANTRA_EBOOK,
        icon: '🔢',
        description: 'Numerology Secrets. Predict your future with numbers.',
        descriptionHi: 'अंक ज्योतिष रहस्य। संख्याओं से अपना भविष्य जानें।',
        motivationalText: 'Discover yourself.',
        motivationalTextHi: 'स्वयं को जानें।'
    },
    {
        type: DivinationType.GEMS_JEWELRY,
        icon: '💎',
        description: 'Exquisite Gems & Jewelry. Shine bright like a diamond.',
        descriptionHi: 'बेहतरीन रत्न और आभूषण। हीरे की तरह चमकें।',
        motivationalText: 'Enhance your beauty.',
        motivationalTextHi: 'अपनी सुंदरता बढ़ाएं।'
    },
    {
        type: DivinationType.TANTRA_MANTRA_YANTRA_EBOOK,
        icon: '🏡',
        description: 'Vastu Shastra Complete Guide. Fix home energy.',
        descriptionHi: 'वास्तु शास्त्र सम्पूर्ण गाइड। घर की ऊर्जा ठीक करें।',
        motivationalText: 'Live in harmony.',
        motivationalTextHi: 'सुख-शांति से रहें।'
    },
    {
        type: DivinationType.MOBILE_ACCESSORIES,
        icon: '🦜',
        description: 'Talking Parrot Toy for Kids. Repeats what you say.',
        descriptionHi: 'बच्चों के लिए बोलने वाला तोता। आपकी बातें दोहराता है।',
        motivationalText: 'Fun for kids.',
        motivationalTextHi: 'बच्चों के लिए मजेदार।'
    },
    {
        type: DivinationType.TANTRA_MANTRA_YANTRA_EBOOK,
        icon: '🧘',
        description: 'Yoga & Ayurveda PDF. Ancient health secrets.',
        descriptionHi: 'योग और आयुर्वेद पीडीएफ। प्राचीन स्वास्थ्य रहस्य।',
        motivationalText: 'Health is wealth.',
        motivationalTextHi: 'स्वास्थ्य ही धन है।'
    },
    {
        type: DivinationType.TANTRA_MANTRA_YANTRA_EBOOK,
        icon: '💻',
        description: 'Computer Fundamentals Guide. Basics to Advanced.',
        descriptionHi: 'कंप्यूटर फंडामेंटल्स गाइड। बेसिक से एडवांस तक।',
        motivationalText: 'Upgrade your skills.',
        motivationalTextHi: 'अपना कौशल बढ़ाएं।'
    },
    {
        type: DivinationType.DIVINATION_STORE,
        icon: '⚡',
        description: 'Instant PDF Downloads with Premium Plan. No waiting.',
        descriptionHi: 'प्रीमियम प्लान के साथ तुरंत पीडीएफ डाउनलोड।',
        motivationalText: 'Save time, Learn more.',
        motivationalTextHi: 'समय बचाएं, अधिक सीखें।'
    },
    {
        type: DivinationType.TANTRA_MANTRA_YANTRA_EBOOK,
        icon: '🏢',
        description: 'Real Estate Mastery. Buying and selling secrets.',
        descriptionHi: 'रियल एस्टेट मास्टरी। खरीदने और बेचने के रहस्य।',
        motivationalText: 'Invest smart.',
        motivationalTextHi: 'समझदारी से निवेश करें।'
    },
    {
        type: DivinationType.TANTRA_MANTRA_YANTRA_EBOOK,
        icon: '🗣️',
        description: 'English Speaking Course. Speak fluently today.',
        descriptionHi: 'इंग्लिश स्पीकिंग कोर्स। आज ही फर्राटेदार बोलें।',
        motivationalText: 'Speak with confidence.',
        motivationalTextHi: 'आत्मविश्वास से बोलें।'
    },
    {
        type: DivinationType.TANTRA_MANTRA_YANTRA_EBOOK,
        icon: '🎬',
        description: 'Viral Reels Bundle. Grow your Instagram fast.',
        descriptionHi: 'वायरल रील्स बंडल। अपना इंस्टाग्राम तेजी से बढ़ाएं।',
        motivationalText: 'Go viral today.',
        motivationalTextHi: 'आज ही वायरल हो जाएं।'
    },
    {
        type: DivinationType.TANTRA_MANTRA_YANTRA_EBOOK,
        icon: '💾',
        description: 'Resell Digital Products. Start online business.',
        descriptionHi: 'डिजिटल उत्पाद बेचें। ऑनलाइन बिजनेस शुरू करें।',
        motivationalText: 'Earn passive income.',
        motivationalTextHi: 'पैसे कमाएं।'
    },
    {
        type: DivinationType.TANTRA_MANTRA_YANTRA_EBOOK,
        icon: '✏️',
        description: '500+ Kids Worksheets. Brain development activities.',
        descriptionHi: '500+ बच्चों की वर्कशीट। दिमाग तेज करने वाली गतिविधियां।',
        motivationalText: 'Smart parenting.',
        motivationalTextHi: 'स्मार्ट पेरेंटिंग।'
    },
    {
        type: DivinationType.TANTRA_MANTRA_YANTRA_EBOOK,
        icon: '🕉️',
        description: 'Tantra Mantra Yantra. Ancient spiritual power.',
        descriptionHi: 'तंत्र मंत्र यंत्र। प्राचीन आध्यात्मिक शक्ति।',
        motivationalText: 'Unleash inner power.',
        motivationalTextHi: 'आंतरिक शक्ति को जगाएं।'
    }
];

const ToolShowcaseSlider: React.FC<ToolShowcaseSliderProps> = ({ onSelect }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const { tDiv } = useAppContext();

    const nextSlide = useCallback(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % showcaseTools.length);
    }, []);

    useEffect(() => {
        const slideInterval = setInterval(nextSlide, 4500); 
        return () => clearInterval(slideInterval);
    }, [nextSlide]);

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    const currentTool = showcaseTools[currentIndex];

    return (
        <div className="w-full max-w-4xl mx-auto mb-6 relative">
            <div 
                key={currentIndex} 
                className={`min-h-[180px] bg-white/10 backdrop-blur-md rounded-xl shadow-lg border border-white/20 transition-all duration-300 hover:shadow-purple-500/20 cursor-pointer overflow-hidden active:bg-amber-500/20 active:border-amber-400 active:shadow-[0_0_20px_rgba(251,191,36,0.3)] ${currentTool.imageUrl ? 'p-0' : 'p-4 flex flex-row items-center justify-start gap-4'}`}
                onClick={() => onSelect(currentTool.type)}
                role="button"
                tabIndex={0}
                aria-label={`Select ${currentTool.description}`}
            >
                {currentTool.imageUrl ? (
                    <img 
                        src={currentTool.imageUrl} 
                        alt="Special Offer" 
                        className="w-full h-full object-fill sm:object-cover"
                    />
                ) : (
                    <>
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-black/20 flex items-center justify-center flex-shrink-0 border border-white/10 self-center">
                            <span className="text-4xl sm:text-5xl icon-glow icon-float">{currentTool.icon}</span>
                        </div>
                        <div className="text-left slide-content-anim flex-grow overflow-hidden flex flex-col justify-center">
                            {/* English Description */}
                            <p className="text-base sm:text-lg text-white font-bold leading-tight line-clamp-2">
                                {currentTool.description}
                            </p>
                            {/* Hindi Description */}
                            <p className="text-sm sm:text-base text-purple-200 leading-snug mt-1 font-hindi">
                                {currentTool.descriptionHi}
                            </p>
                            
                            <div className="mt-2 pt-2 border-t border-white/10">
                                {/* English Motivational */}
                                <p className="text-xs sm:text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-400 italic truncate">
                                    "{currentTool.motivationalText}"
                                </p>
                                {/* Hindi Motivational */}
                                {currentTool.motivationalTextHi && (
                                    <p className="text-xs sm:text-sm text-pink-300/80 font-hindi italic">
                                        "{currentTool.motivationalTextHi}"
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex-shrink-0 text-white/50 self-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </>
                )}
            </div>
            
            <div className="flex justify-center gap-1.5 mt-3 absolute -bottom-5 left-1/2 -translate-x-1/2 w-full overflow-hidden px-4">
                {showcaseTools.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 flex-shrink-0 ${currentIndex === index ? 'bg-purple-400 scale-125' : 'bg-white/30 hover:bg-white/60'}`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default ToolShowcaseSlider;
