
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const banners = [
    {
        id: 'new-banner-1',
        imageUrl: 'https://res.cloudinary.com/de2eehtiy/image/upload/v1764846050/b45263c1-c531-4c89-8541-e17ded96197f_tudswh.png',
        link: '/store',
        alt: 'Special Offer'
    },
    {
        id: 1,
        imageUrl: 'https://res.cloudinary.com/de2eehtiy/image/upload/v1764786407/6_1_nvqj2l.jpg',
        link: '/store',
        alt: 'Electronic Accessories & E-Book Sale'
    },
    {
        id: 2,
        imageUrl: 'https://res.cloudinary.com/de2eehtiy/image/upload/v1764786407/6_3_zvyxts.jpg',
        link: '/store/mobile-accessories',
        alt: 'Mobile Accessories Shop Now'
    },
    {
        id: 3,
        imageUrl: 'https://res.cloudinary.com/de2eehtiy/image/upload/v1764786407/6_2_j9y8fw.jpg',
        link: '/store/ebooks',
        alt: 'E-Books Collection'
    }
];

const BannerSlider: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleBannerClick = (link: string) => {
        navigate(link);
    };

    return (
        <div className="w-full max-w-7xl mx-auto mb-8 relative rounded-2xl overflow-hidden shadow-2xl group border border-white/10">
            <div 
                className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96 transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(0)` }} 
            >
               {/* Using Flex container for sliding */}
               <div 
                    className="absolute top-0 left-0 w-full h-full flex transition-transform duration-700 ease-in-out"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
               >
                   {banners.map((banner) => (
                       <div 
                           key={banner.id} 
                           className="w-full h-full flex-shrink-0 cursor-pointer relative"
                           onClick={() => handleBannerClick(banner.link)}
                       >
                           <img 
                               src={banner.imageUrl} 
                               alt={banner.alt} 
                               className="w-full h-full object-fill sm:object-cover"
                           />
                           {/* Gradient overlay for better text visibility */}
                           <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 hover:opacity-40 transition-opacity duration-300"></div>
                       </div>
                   ))}
               </div>
            </div>

            {/* Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {banners.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 shadow-sm ${
                            index === currentIndex ? 'bg-white scale-125 w-8' : 'bg-white/50 hover:bg-white/80'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
            
            {/* Navigation Arrows */}
             <button 
                onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </button>
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex((prev) => (prev + 1) % banners.length);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
            </button>
        </div>
    );
};

export default BannerSlider;
