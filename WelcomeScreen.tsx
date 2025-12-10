
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from './Card';
import { useAppContext } from '../App';

interface WelcomeScreenProps {
    onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
    const { t } = useAppContext();
    const [agreed, setAgreed] = useState(false);
    
    return (
        <div className="flex flex-col items-center justify-center text-center animate-fade-in min-h-screen py-4 sm:py-8">
            <Card className="max-w-2xl w-full">
                <h2 className="text-3xl sm:text-4xl font-hindi font-bold text-white mb-2">{t('welcome_greeting')}</h2>
                <p className="text-base sm:text-lg text-purple-200 mb-4 sm:mb-6">{t('welcome_subtitle')}</p>
                <p className="text-base sm:text-lg text-purple-200 mb-6">
                    {t('welcome_intro')}
                </p>

                {/* Promotional Video Section - Now placed before the agreement */}
                <div className="w-full rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-black/40 mb-6 relative group">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"></div>
                    <video 
                        src="https://res.cloudinary.com/de2eehtiy/video/upload/v1764095597/5_6129929173419956762_1_hd1rpt.mp4"
                        controls
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-auto object-cover"
                        style={{ maxHeight: '400px' }}
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>

                {/* Agreement Section - Placed below video */}
                <div className="mb-6 bg-white/5 p-4 rounded-lg border border-white/10">
                    <label htmlFor="agree-checkbox" className="flex items-start sm:items-center justify-center gap-3 text-sm text-purple-200 cursor-pointer select-none text-left sm:text-center">
                        <input
                            id="agree-checkbox"
                            type="checkbox"
                            checked={agreed}
                            onChange={() => setAgreed(!agreed)}
                            className="mt-1 sm:mt-0 h-5 w-5 rounded border-purple-400 text-purple-600 focus:ring-purple-500 bg-transparent flex-shrink-0"
                        />
                        <span className="leading-tight">
                            {t('agree_to_terms_privacy_part1')}&nbsp;
                            <Link to="/terms" className="underline hover:text-white transition text-pink-300 font-semibold">{t('terms_and_conditions')}</Link>
                            &nbsp;{t('agree_to_terms_privacy_part2')}&nbsp;
                            <Link to="/privacy" className="underline hover:text-white transition text-pink-300 font-semibold">{t('privacy_policy')}</Link>
                            {t('agree_to_terms_privacy_part3')}
                        </span>
                    </label>
                </div>

                <button
                    onClick={onStart}
                    disabled={!agreed}
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 ease-in-out text-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 w-full sm:w-auto"
                >
                    {t('start_journey')}
                </button>
            </Card>
        </div>
    );
};

export default WelcomeScreen;
