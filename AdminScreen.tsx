
import React, { useState, FormEvent } from 'react';
import { Product, VerificationRequest, Order, SupportTicket, SocialMediaPost } from '../types';
import AdminPanel from './AdminPanel';
import Card from './Card';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../App';

interface AdminScreenProps {
    products: Product[];
    onUpdateProducts: (products: Product[]) => void;
    orders: Order[];
    onUpdateOrders: (orders: Order[]) => void;
    pendingVerifications: VerificationRequest[];
    onApproveVerification: (requestId: string) => void;
    supportTickets: SupportTicket[];
    onUpdateTicket: (ticket: SupportTicket) => void;
    socialMediaPosts: SocialMediaPost[];
    onCreatePost: (post: Omit<SocialMediaPost, 'id' | 'createdAt'>) => void;
    onUpdatePost: (post: SocialMediaPost) => void;
    onDeletePost: (postId: string) => void;
    categoryVisibility: Record<string, boolean>;
    onUpdateCategoryVisibility: (visibility: Record<string, boolean>) => void;
}

const AdminScreen: React.FC<AdminScreenProps> = (props) => {
    const { isAuthenticated: isUserAuthenticated, showAuth, currentUser, t } = useAppContext();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e: FormEvent) => {
        e.preventDefault();
        if (password === 'cuypp078') {
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('गलत पासवर्ड। कृपया पुनः प्रयास करें।');
            setPassword('');
        }
    };

    const handleUserLogin = () => {
        if (isUserAuthenticated) {
            navigate('/profile');
        } else {
            showAuth(() => navigate('/profile'));
        }
    };

    if (isAuthenticated) {
        return <AdminPanel {...props} />;
    }

    return (
        <div className="space-y-8">
            <Card className="animate-fade-in max-w-md mx-auto">
                 <Link to="/" className="absolute top-6 left-6 text-purple-300 hover:text-white transition">&larr; वापस</Link>
                <h2 className="text-3xl font-hindi font-bold mb-6 text-center">एडमिन पैनल</h2>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor="password" className="block text-purple-200 text-lg mb-2">एडमिन पासवर्ड दर्ज करें</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition"
                        />
                    </div>
                    {error && <p className="text-red-400 text-center">{error}</p>}
                    <div className="text-center">
                        <button type="submit" className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 ease-in-out text-lg">
                            लॉग इन करें
                        </button>
                    </div>
                </form>
            </Card>

            <Card className="animate-fade-in max-w-md mx-auto bg-blue-900/20 border-blue-500/30">
                <h3 className="text-xl font-hindi font-bold mb-4 text-center text-blue-200">ग्राहक क्षेत्र</h3>
                <p className="text-center text-purple-200 mb-6">क्या आप एक ग्राहक हैं? अपनी प्रोफ़ाइल या ऑर्डर देखने के लिए यहाँ क्लिक करें।</p>
                <div className="text-center">
                    <button 
                        onClick={handleUserLogin}
                        className="w-full px-8 py-3 bg-white/10 border border-white/20 text-white font-bold rounded-full shadow-lg hover:bg-white/20 transition-all duration-300 ease-in-out text-lg flex items-center justify-center gap-2"
                    >
                        {isUserAuthenticated ? (
                            <>
                                {currentUser?.profilePicture ? (
                                    <img src={currentUser.profilePicture} alt="Profile" className="w-6 h-6 rounded-full object-cover" />
                                ) : (
                                    <span>👤</span>
                                )}
                                {currentUser?.name?.split(' ')[0]} की प्रोफ़ाइल
                            </>
                        ) : (
                            <>
                                <span>👤</span> ग्राहक लॉगिन / साइन अप
                            </>
                        )}
                    </button>
                </div>
            </Card>
        </div>
    );
};

export default AdminScreen;
