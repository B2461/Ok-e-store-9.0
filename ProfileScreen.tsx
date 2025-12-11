
import React, { useState, FormEvent, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from './Card';
import { UserProfile } from '../types';
import { useAppContext } from '../App';

interface ProfileScreenProps {
    userProfile: UserProfile | null;
    onUpdateProfile: (profile: UserProfile) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({ userProfile, onUpdateProfile }) => {
    const { logout, deleteCurrentUser, t } = useAppContext();
    const [formData, setFormData] = useState<UserProfile>(userProfile || {});
    const [isSaved, setIsSaved] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    
    useEffect(() => {
        setFormData(userProfile || {});
    }, [userProfile]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                const base64 = await fileToBase64(file);
                setFormData({ ...formData, profilePicture: base64 });
            } catch (error) {
                console.error("Error converting file to base64", error);
            }
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onUpdateProfile(formData);
        setIsSaved(true);
        setTimeout(() => {
            setIsSaved(false);
        }, 2000);
    };
    
    const handleDeleteAccount = () => {
        if (window.confirm("क्या आप वाकई अपना खाता और उससे जुड़ा सारा डेटा स्थायी रूप से हटाना चाहते हैं? इस क्रिया को पूर्ववत नहीं किया जा सकता।")) {
            deleteCurrentUser();
            alert("आपका खाता और डेटा हटा दिया गया है।");
            navigate('/'); // Redirect to home after deletion
        }
    };

    return (
        <Card className="animate-fade-in max-w-2xl mx-auto">
            <Link to="/" className="absolute top-6 left-6 text-purple-300 hover:text-white transition">&larr; वापस</Link>
            <h2 className="text-3xl font-hindi font-bold mb-8 text-center">प्रोफ़ाइल सेटिंग</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-32 h-32 rounded-full bg-white/10 border-2 border-purple-400/50 flex items-center justify-center overflow-hidden">
                        {formData.profilePicture ? (
                            <img src={formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        )}
                    </div>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-white/10 text-purple-200 border border-white/20 rounded-full font-semibold hover:bg-white/20 transition">
                        चित्र बदलें
                    </button>
                </div>
                <div>
                    <label htmlFor="email" className="block text-purple-200 text-lg mb-2">ईमेल</label>
                    <input type="email" id="email" name="email" value={formData.email || ''} readOnly className="w-full bg-black/20 p-3 rounded-lg border border-white/20 focus:ring-0 focus:outline-none cursor-not-allowed" />
                </div>
                <div>
                    <label htmlFor="name" className="block text-purple-200 text-lg mb-2">पूरा नाम</label>
                    <input type="text" id="name" name="name" value={formData.name || ''} onChange={handleInputChange} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition" />
                </div>
                <div>
                    <label htmlFor="phone" className="block text-purple-200 text-lg mb-2">फ़ोन नंबर</label>
                    <input type="tel" id="phone" name="phone" value={formData.phone || ''} onChange={handleInputChange} pattern="\d{10}" maxLength={10} placeholder="10 अंकों का फ़ोन नंबर" className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition" />
                    <p className="text-xs text-purple-300 mt-1">यह फ़ोन नंबर ऑर्डर और सहायता के लिए उपयोग किया जाएगा।</p>
                </div>
                <div>
                    <label htmlFor="dob" className="block text-purple-200 text-lg mb-2">जन्म तिथि</label>
                    <input type="date" id="dob" name="dob" value={formData.dob || ''} onChange={handleInputChange} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition" />
                </div>
                <div>
                    <label htmlFor="timeOfBirth" className="block text-purple-200 text-lg mb-2">जन्म समय</label>
                    <input type="time" id="timeOfBirth" name="timeOfBirth" value={formData.timeOfBirth || ''} onChange={handleInputChange} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition" />
                </div>
                <div>
                    <label htmlFor="placeOfBirth" className="block text-purple-200 text-lg mb-2">जन्म स्थान (शहर, देश)</label>
                    <input type="text" id="placeOfBirth" name="placeOfBirth" value={formData.placeOfBirth || ''} onChange={handleInputChange} placeholder="उदाहरण: दिल्ली, भारत" className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition" />
                </div>

                <div className="text-center pt-4 flex flex-col gap-4">
                    <button type="submit" className={`w-full sm:w-auto mx-auto px-8 py-3 font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 ease-in-out text-lg ${isSaved ? 'bg-green-600 text-white' : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'}`}>
                        {isSaved ? 'सहेजा गया!' : 'प्रोफ़ाइल सहेजें'}
                    </button>
                    <button type="button" onClick={logout} className="w-full sm:w-auto mx-auto px-8 py-3 bg-red-800/20 text-red-300 border border-red-400/30 font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 ease-in-out text-lg">
                        लॉगआउट
                    </button>
                </div>
            </form>

            <div className="mt-8 pt-6 border-t border-red-500/20 text-center">
                <button
                    type="button"
                    onClick={handleDeleteAccount}
                    className="text-red-400 hover:text-red-300 font-semibold"
                >
                    खाता हटाएं
                </button>
                <p className="text-xs text-purple-400 mt-2">
                    खाता हटाने से आपके ऑर्डर इतिहास और प्रोफ़ाइल सहित सभी डेटा स्थायी रूप से हट जाएगा।
                </p>
            </div>

             <div className="mt-8 text-center text-sm">
                <Link to="/terms" className="text-purple-300 hover:text-white underline">{t('terms_and_conditions')}</Link>
                <span className="mx-2 text-purple-400">|</span>
                <Link to="/privacy" className="text-purple-300 hover:text-white underline">{t('privacy_policy')}</Link>
            </div>
        </Card>
    );
};

export default ProfileScreen;
