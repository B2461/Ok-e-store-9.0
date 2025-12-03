import React, { useState, FormEvent } from 'react';
import { Product, VerificationRequest, Order, SupportTicket, SocialMediaPost } from '../types';
import AdminPanel from './AdminPanel';
import Card from './Card';
import { Link } from 'react-router-dom';

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
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

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

    if (isAuthenticated) {
        return <AdminPanel {...props} />;
    }

    return (
        <Card className="animate-fade-in max-w-md mx-auto">
             <Link to="/" className="absolute top-6 left-6 text-purple-300 hover:text-white transition">&larr; वापस</Link>
            <h2 className="text-3xl font-hindi font-bold mb-6 text-center">एडमिन पैनल</h2>
            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label htmlFor="password" className="block text-purple-200 text-lg mb-2">पासवर्ड दर्ज करें</label>
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
    );
};

export default AdminScreen;