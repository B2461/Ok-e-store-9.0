
import React, { useState, FormEvent } from 'react';
import { UserProfile } from '../types';

interface LoginScreenProps {
    onClose: () => void;
    onLogin: (email: string, password: string) => Promise<string | null>;
    onSignup: (profile: UserProfile) => Promise<boolean>;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onClose, onLogin, onSignup }) => {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLoginSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        
        const cleanEmail = email.trim();
        
        if (!cleanEmail || !password) {
            setError('कृपया ईमेल और पासवर्ड दोनों दर्ज करें।');
            return;
        }
        
        // Basic Email Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanEmail)) {
             setError('कृपया एक मान्य ईमेल पता दर्ज करें।');
             return;
        }

        setIsLoading(true);
        const errorMessage = await onLogin(cleanEmail, password);
        setIsLoading(false);
        
        if (errorMessage) {
            setError(errorMessage);
        }
    };

    const handleSignupSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        
        const cleanEmail = email.trim();
        const cleanName = name.trim();
        const cleanPhone = phone.trim().replace(/\D/g, ''); // Remove non-digits

        if (!cleanName || !cleanEmail || !password || !cleanPhone) {
            setError('कृपया सभी फ़ील्ड भरें।');
            return;
        }
        
        if (password !== confirmPassword) {
            setError('पासवर्ड मेल नहीं खाते।');
            return;
        }
        
        // Email Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanEmail)) {
             setError('कृपया एक मान्य ईमेल पता दर्ज करें।');
             return;
        }

        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(cleanPhone)) {
            setError('कृपया एक मान्य 10-अंकीय फ़ोन नंबर दर्ज करें।');
            return;
        }
        
        setIsLoading(true);
        const success = await onSignup({ name: cleanName, email: cleanEmail, password, phone: cleanPhone });
        setIsLoading(false);
        if (!success) {
            setError('साइन अप विफल रहा (शायद ईमेल पहले से उपयोग में है)।');
        }
    };

    const fillDemoCredentials = () => {
        setEmail('demo@example.com');
        setPassword('password');
    };

    const renderLoginForm = () => (
        <form onSubmit={handleLoginSubmit} className="space-y-4">
            <h2 className="text-2xl font-hindi font-bold text-white mb-4 text-center">लॉगिन करें</h2>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ईमेल" required className="w-full bg-white/10 p-3 rounded-lg border border-white/20"/>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="पासवर्ड" required className="w-full bg-white/10 p-3 rounded-lg border border-white/20"/>
            
            {error && <p className="text-red-400 text-center text-sm p-2 bg-red-900/30 rounded">{error}</p>}
            
            <button type="submit" disabled={isLoading} className="w-full mt-4 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-lg disabled:opacity-60">
                {isLoading ? 'प्रतीक्षा करें...' : 'लॉगिन करें'}
            </button>

            <div className="text-center mt-4">
                <button type="button" onClick={fillDemoCredentials} className="text-xs text-purple-300 hover:text-white underline">
                    डेमो लॉगिन (Testing)
                </button>
            </div>
        </form>
    );

    const renderSignupForm = () => (
        <form onSubmit={handleSignupSubmit} className="space-y-4">
            <h2 className="text-2xl font-hindi font-bold text-white mb-4 text-center">नया खाता बनाएं</h2>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="पूरा नाम" required className="w-full bg-white/10 p-3 rounded-lg border border-white/20"/>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ईमेल" required className="w-full bg-white/10 p-3 rounded-lg border border-white/20"/>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={10} placeholder="10-अंकीय फ़ोन नंबर" required className="w-full bg-white/10 p-3 rounded-lg border border-white/20"/>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="पासवर्ड" required className="w-full bg-white/10 p-3 rounded-lg border border-white/20"/>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="पासवर्ड की पुष्टि करें" required className="w-full bg-white/10 p-3 rounded-lg border border-white/20"/>
            {error && <p className="text-red-400 text-center">{error}</p>}
            <button type="submit" disabled={isLoading} className="w-full mt-6 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-lg disabled:opacity-60">
                {isLoading ? 'प्रतीक्षा करें...' : 'साइन अप करें'}
            </button>
        </form>
    );

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900/90 border border-purple-500/30 shadow-2xl rounded-2xl p-8 max-w-sm w-full relative animate-fade-in">
                <button onClick={onClose} className="absolute top-4 right-4 text-purple-300 hover:text-white text-3xl">&times;</button>
                
                <div className="flex justify-center border-b border-white/20 mb-6">
                    <button onClick={() => { setMode('login'); setError(''); }} className={`w-full text-center p-3 font-semibold transition ${mode === 'login' ? 'text-white border-b-2 border-purple-400' : 'text-purple-300'}`}>लॉगिन</button>
                    <button onClick={() => { setMode('signup'); setError(''); }} className={`w-full text-center p-3 font-semibold transition ${mode === 'signup' ? 'text-white border-b-2 border-purple-400' : 'text-purple-300'}`}>साइन अप</button>
                </div>

                {mode === 'login' ? renderLoginForm() : renderSignupForm()}
            </div>
        </div>
    );
};

export default LoginScreen;
