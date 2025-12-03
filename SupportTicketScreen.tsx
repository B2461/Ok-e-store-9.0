import React, { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from './Card';
import { SupportTicket } from '../types';
import { useAppContext } from '../App';

interface SupportTicketScreenProps {
    onCreateTicket: (ticket: Omit<SupportTicket, 'id' | 'status' | 'createdAt'>) => void;
}

const ticketCategories = [
    'उत्पाद डिलीवरी', 'उत्पाद वापसी', 'टूल काम नहीं कर रहा है', 'सदस्यता समस्या', 'भुगतान समस्या', 'अन्य'
];

const SupportTicketScreen: React.FC<SupportTicketScreenProps> = ({ onCreateTicket }) => {
    const { t, currentUser } = useAppContext();
    const navigate = useNavigate();

    const [userName, setUserName] = useState('');
    const [userPhone, setUserPhone] = useState('');
    const [category, setCategory] = useState(ticketCategories[0]);
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        if (currentUser) {
            setUserName(currentUser.name || '');
            setUserPhone(currentUser.phone || '');
        }
    }, [currentUser]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!userName.trim() || !userPhone.trim() || !description.trim()) {
            setError('कृपया सभी आवश्यक फ़ील्ड भरें।');
            return;
        }
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(userPhone)) {
            setError('कृपया एक मान्य 10-अंकीय फ़ोन नंबर दर्ज करें।');
            return;
        }
        
        onCreateTicket({ userName, userPhone, category, description });
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <Card className="animate-fade-in text-center max-w-lg mx-auto">
                 <div className="w-24 h-24 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-16 h-16 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-3xl font-hindi font-bold text-white mb-2">{t('ticket_submitted_success_title')}</h2>
                <p className="text-lg text-purple-200 mb-8">
                    {t('ticket_submitted_success_message')}
                </p>
                <button
                    onClick={() => navigate('/settings')}
                    className="mt-4 inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 ease-in-out text-lg"
                >
                    {t('back')}
                </button>
            </Card>
        );
    }


    return (
        <Card className="animate-fade-in max-w-2xl mx-auto">
            <button onClick={() => navigate('/settings')} className="absolute top-6 left-6 text-purple-300 hover:text-white transition">&larr; {t('back')}</button>
            <h2 className="text-3xl font-hindi font-bold mb-8 text-center">{t('raise_ticket')}</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="category" className="block text-purple-200 text-lg mb-2">{t('ticket_category')}</label>
                    <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition"
                    >
                        {ticketCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="description" className="block text-purple-200 text-lg mb-2">{t('describe_issue')}</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={5}
                        className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition"
                        placeholder="कृपया अपनी समस्या के बारे में विस्तार से बताएं..."
                        required
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="userName" className="block text-purple-200 text-lg mb-2">आपका नाम</label>
                        <input
                            type="text"
                            id="userName"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="userPhone" className="block text-purple-200 text-lg mb-2">आपका फ़ोन नंबर</label>
                        <input
                            type="tel"
                            id="userPhone"
                            value={userPhone}
                            onChange={(e) => setUserPhone(e.target.value.replace(/\D/g, ''))}
                            className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition"
                            required
                            pattern="\d{10}"
                            maxLength={10}
                        />
                    </div>
                </div>

                {error && <p className="text-red-400 text-center">{error}</p>}
                
                <div className="text-center pt-4">
                    <button
                        type="submit"
                        className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 ease-in-out text-lg"
                    >
                        {t('submit_ticket')}
                    </button>
                </div>
            </form>
        </Card>
    );
};

export default SupportTicketScreen;