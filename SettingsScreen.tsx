import React from 'react';
import { Link } from 'react-router-dom';
import Card from './Card';
import { useAppContext } from '../App';
import AudioPlayer from './AudioPlayer';

interface SettingsScreenProps {
    audioRef: React.RefObject<HTMLAudioElement>;
}

const themes = [
    { id: 'cosmic', name: 'ब्रह्मांडीय रात्रि', emoji: '🌌' },
    { id: 'sunrise', name: 'गोधूलि बेला', emoji: '🌆' },
    { id: 'forest', name: 'रात्रि वन', emoji: '🌲' },
    { id: 'saffron', name: 'गहरा भगवा', emoji: '🟠' },
    { id: 'light', name: 'सरल सफेद', emoji: '☀️' },
    { id: 'dark', name: 'सरल काला', emoji: '🌑' },
    { id: 'rose', name: 'गुलाबी', emoji: '🌹' },
    { id: 'sky', name: 'आसमानी', emoji: '🌃' },
    { id: 'emerald', name: 'हरा', emoji: '🌿' },
    { id: 'grey', name: 'स्लेटी', emoji: '🌫️' },
];

const SettingsScreen: React.FC<SettingsScreenProps> = ({ audioRef }) => {
    const { language, setLanguage, theme, setTheme, t } = useAppContext();

    return (
        <Card className="animate-fade-in max-w-2xl mx-auto">
            <Link to="/" className="absolute top-6 left-6 text-orange-300 hover:text-white transition">&larr; {t('back')}</Link>
            <h2 className="text-3xl font-hindi font-bold mb-8 text-center">{t('settings')}</h2>

            <div className="space-y-8">
                {/* Music/Sound Control */}
                <div>
                    <label className="block text-orange-200 text-lg mb-3">{t('music')}</label>
                    <div className="flex items-center justify-center p-4 bg-white/10 rounded-lg">
                         <AudioPlayer audioRef={audioRef} size="lg" />
                    </div>
                </div>

                {/* Language Selection */}
                <div>
                    <label className="block text-orange-200 text-lg mb-3">{t('select_language')}</label>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setLanguage('hi')}
                            className={`w-full py-3 rounded-lg border-2 font-semibold transition ${language === 'hi' ? 'bg-orange-600 border-orange-400 text-white' : 'bg-white/10 border-white/20 text-orange-200'}`}
                        >
                            हिन्दी
                        </button>
                        <button 
                            onClick={() => setLanguage('en')}
                            className={`w-full py-3 rounded-lg border-2 font-semibold transition ${language === 'en' ? 'bg-orange-600 border-orange-400 text-white' : 'bg-white/10 border-white/20 text-orange-200'}`}
                        >
                            English
                        </button>
                    </div>
                </div>

                {/* Theme Selection */}
                <div>
                    <label className="block text-orange-200 text-lg mb-3">{t('select_theme')}</label>
                    <div className="grid grid-cols-3 sm:grid-cols-3 gap-4">
                        {themes.map(themeItem => (
                            <button
                                key={themeItem.id}
                                onClick={() => setTheme(themeItem.id)}
                                className={`flex flex-col items-center justify-center p-4 aspect-square rounded-lg border-2 transition ${theme === themeItem.id ? 'bg-orange-600 border-orange-400' : 'bg-white/10 border-white/20 hover:border-orange-400'}`}
                            >
                                <span className="text-3xl mb-2">{themeItem.emoji}</span>
                                <span className="text-sm font-semibold text-center">{themeItem.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/20 text-center">
                <Link to="/terms" className="text-purple-300 hover:text-white underline">{t('terms_and_conditions')}</Link>
                <span className="mx-4 text-purple-400/60">|</span>
                <Link to="/privacy" className="text-purple-300 hover:text-white underline">{t('privacy_policy')}</Link>
            </div>
        </Card>
    );
};

export default SettingsScreen;