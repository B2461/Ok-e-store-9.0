
import React from 'react';
import { Link } from 'react-router-dom';
import { Order } from '../types';
import Card from './Card';
import { useAppContext } from '../App';

interface OrderHistoryScreenProps {
    orders: Order[];
}

const OrderHistoryScreen: React.FC<OrderHistoryScreenProps> = ({ orders }) => {
    const { isAuthenticated, currentUser, showAuth, t } = useAppContext();

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