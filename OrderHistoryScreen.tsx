
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Order } from '../types';
import Card from './Card';
import { useAppContext } from '../App';

interface OrderHistoryScreenProps {
    orders: Order[];
}

const OrderHistoryScreen: React.FC<OrderHistoryScreenProps> = ({ orders }) => {
    const { isAuthenticated, currentUser, showAuth, t, isPremiumActive } = useAppContext();

    // Calculate days remaining for premium
    const daysLeft = useMemo(() => {
        if (!currentUser?.subscriptionExpiry) return 0;
        const now = new Date();
        const expiry = new Date(currentUser.subscriptionExpiry);
        // Reset time parts to compare only dates properly if needed, but diffTime is enough for rough estimate
        const diffTime = expiry.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    }, [currentUser]);

    if (!isAuthenticated || !currentUser) {
        return (
            <Card className="animate-fade-in max-w-2xl mx-auto text-center">
                <Link to="/" className="absolute top-6 left-6 text-purple-300 hover:text-white transition">&larr; {t('back')}</Link>
                <h2 className="text-3xl font-hindi font-bold mb-4">{t('my_orders')}</h2>
                <p className="text-purple-200 text-lg mb-6">अपने ऑर्डर देखने के लिए कृपया लॉगिन करें।</p>
                <button
                    onClick={() => showAuth()}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 ease-in-out text-lg"
                >
                    लॉगिन करें
                </button>
            </Card>
        );
    }

    // Helper to normalize phone numbers (take last 10 digits only) for comparison
    const normalizePhone = (phone: string | undefined) => {
        if (!phone) return '';
        const digits = phone.replace(/\D/g, ''); // Remove non-digits
        return digits.slice(-10); // Keep last 10 digits
    };

    const userPhoneNormalized = normalizePhone(currentUser.phone);
    const userEmailLower = currentUser.email?.toLowerCase().trim();

    const userOrders = [...orders]
        .filter(order => {
            // Check Phone Match
            const orderPhoneNormalized = normalizePhone(order.customer.phone);
            const phoneMatch = userPhoneNormalized && orderPhoneNormalized && userPhoneNormalized === orderPhoneNormalized;

            // Check Email Match (fallback if phone doesn't match)
            const orderEmailLower = order.customer.email?.toLowerCase().trim();
            const emailMatch = userEmailLower && orderEmailLower && userEmailLower === orderEmailLower;

            return phoneMatch || emailMatch;
        })
        .reverse(); // Show most recent first

    return (
        <Card className="animate-fade-in max-w-4xl mx-auto">
            <Link to="/profile" className="absolute top-6 left-6 text-purple-300 hover:text-white transition">&larr; {t('back')}</Link>
            <h2 className="text-3xl font-hindi font-bold mb-8 text-center">{t('my_orders')}</h2>

            {/* Premium Status Section */}
            <div className="mb-8">
                {isPremiumActive ? (
                    <div className="bg-gradient-to-r from-amber-900/40 to-orange-900/40 border border-amber-500 rounded-xl p-6 text-center relative overflow-hidden shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                        {/* Top sheen animation */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-300 animate-pulse"></div>
                        
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mb-3 animate-pulse border border-amber-500/50">
                                <span className="text-3xl">👑</span>
                            </div>
                            <h3 className="text-xl font-hindi font-bold text-amber-400 mb-1">
                                प्रीमियम प्लान सक्रिय है
                            </h3>
                            <p className="text-white text-lg font-semibold mb-3">
                                {currentUser?.subscriptionPlan || 'Premium'} Plan
                            </p>
                            <div className="bg-black/40 px-6 py-3 rounded-lg border border-amber-500/30 flex items-center gap-2">
                                <span className="text-amber-200 text-sm">समाप्त होने में:</span>
                                <span className="font-bold text-2xl text-white">{daysLeft}</span> 
                                <span className="text-amber-200 text-sm">दिन शेष</span>
                            </div>
                            <p className="text-xs text-amber-400/60 mt-3">
                                वैधता: {new Date(currentUser?.subscriptionExpiry!).toLocaleDateString('hi-IN', { year: 'numeric', month: 'long', day: 'numeric' })} तक
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center flex flex-col items-center justify-center gap-3">
                        <div className="text-gray-400 text-4xl mb-1">🔒</div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">प्रीमियम सदस्यता सक्रिय नहीं है</h3>
                            <p className="text-purple-300 text-sm mt-1">ई-बुक्स और विशेष सुविधाओं तक पहुँचने के लिए सदस्यता लें।</p>
                        </div>
                        <Link to="/premium" className="mt-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full text-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                            प्रीमियम प्लान देखें
                        </Link>
                    </div>
                )}
            </div>

            <h3 className="text-xl font-hindi font-bold text-white mb-4 border-b border-white/10 pb-2">ऑर्डर इतिहास</h3>

            {userOrders.length === 0 ? (
                <p className="text-center text-purple-200 text-lg py-8">आपने अभी तक कोई ऑर्डर नहीं दिया है।</p>
            ) : (
                <div className="space-y-4">
                    {userOrders.map(order => (
                        <Link
                            key={order.id}
                            to={`/orders/${order.id}`}
                            className="block text-left bg-white/5 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 transform transition-all duration-300 hover:bg-purple-500/20 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/30"
                        >
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                <div>
                                    <p className="font-mono text-pink-300 text-sm">{order.id}</p>
                                    <p className="text-purple-300 text-sm mt-1">
                                        {new Date(order.date).toLocaleDateString('hi-IN', {
                                            year: 'numeric', month: 'long', day: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <div className="mt-2 sm:mt-0 sm:text-right">
                                     <p className={`font-semibold text-sm px-2 py-1 rounded-full mt-1 inline-block 
                                        ${order.status === 'Processing' ? 'bg-blue-500/30 text-blue-300' : 
                                          order.status === 'Shipped' ? 'bg-orange-500/30 text-orange-300' : 
                                          order.status === 'Out for Delivery' ? 'bg-yellow-500/30 text-yellow-300' : 
                                          order.status === 'Delivered' ? 'bg-green-500/30 text-green-300' : 
                                          order.status === 'Verification Pending' ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50' :
                                          'bg-gray-500/30 text-gray-300'}`}>
                                        {order.status === 'Verification Pending' ? 'सत्यापन लंबित' : order.status}
                                    </p>
                                    <p className="font-bold text-lg text-white mt-1">₹{order.total.toFixed(2)}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </Card>
    );
};

export default OrderHistoryScreen;
