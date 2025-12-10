


import React, { useState, FormEvent, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CartItem, CustomerDetails, VerificationRequest } from '../types';
import Card from './Card';
import { useAppContext } from '../App';

interface CheckoutScreenProps {
    cartItems: CartItem[];
    onPlaceOrder: (customerDetails: CustomerDetails, total: number, paymentMethod: 'PREPAID' | 'COD', orderId: string) => void;
    onVerificationRequest: (request: Omit<VerificationRequest, 'id' | 'requestDate'>) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

// SVG Icons for Payment Apps
const GPayIcon = () => (
    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-1 shadow-md">
        <svg viewBox="0 0 24 24" className="w-full h-full">
            <path fill="#4285F4" d="M12 24c6.6 0 12-5.4 12-12S18.6 0 12 0 0 5.4 0 12s5.4 12 12 12z" />
            <path fill="#FFF" d="M12 10.5c.8 0 1.5.3 2.1.8l1.6-1.6c-1-1-2.4-1.6-3.7-1.6-2.9 0-5.3 2-6.2 4.7l2.9 2.2c.7-2 2.6-3.5 4.9-3.5" />
            <path fill="#FFF" d="M12 13.5c-1.3 0-2.4-.4-3.3-1.1l-2.9 2.2c1.6 2.3 4.3 3.9 7.4 3.9 2.7 0 5.1-1.1 6.8-2.9l-2.6-2.4c-.9.9-2.2 1.4-4.2 1.4" />
            <path fill="#FFF" d="M22 12c0-.7-.1-1.3-.2-2H12v4h5.6c-.3 1.3-1 2.4-2.1 3.1l2.6 2.4C20.5 17.6 22 15 22 12" />
        </svg>
    </div>
);

const PhonePeIcon = () => (
    <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md bg-[#5F259F] flex items-center justify-center">
        <span className="text-white font-bold text-xs">Pe</span>
    </div>
);

const PaytmIcon = () => (
    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center overflow-hidden border border-blue-200 shadow-md">
        <span className="text-[#00baf2] font-bold text-[10px]">Paytm</span>
    </div>
);

const BhimIcon = () => (
    <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-[10px] shadow-md">
        BHIM
    </div>
);

const CheckoutScreen: React.FC<CheckoutScreenProps> = ({ cartItems, onPlaceOrder, onVerificationRequest }) => {
    const navigate = useNavigate();
    const { t, currentUser } = useAppContext();
    
    const [customer, setCustomer] = useState<CustomerDetails>({
        name: currentUser?.name || '', 
        address: '', 
        city: '', 
        state: '', 
        pincode: '', 
        phone: currentUser?.phone || '', 
        email: currentUser?.email || '',
        whatsapp: ''
    });
    
    // Views: details -> shipping_payment -> payment_selection -> manual_verification
    const [view, setView] = useState<'details' | 'shipping_payment' | 'payment_selection' | 'manual_verification'>('details');
    const [paymentMethod, setPaymentMethod] = useState<'PREPAID' | 'COD' | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [transactionId, setTransactionId] = useState('');
    const [screenshot, setScreenshot] = useState<File | null>(null);
    const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [orderId] = useState(`order-${Date.now()}`);
    const [selectedUpiApp, setSelectedUpiApp] = useState<string | null>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (currentUser) {
            setCustomer(prev => ({
                ...prev,
                name: prev.name || currentUser.name || '',
                phone: prev.phone || currentUser.phone || '',
                email: prev.email || currentUser.email || ''
            }));
        }
    }, [currentUser]);

    React.useEffect(() => {
        if (cartItems.length === 0) {
            navigate('/cart');
        }
    }, [cartItems, navigate]);

    const hasDigitalItems = cartItems.some(item => item.productType === 'DIGITAL');
    const hasPhysicalItems = cartItems.some(item => item.productType === 'PHYSICAL');

    const totalAmount = cartItems.reduce((total, item) => {
        const discountedPrice = item.mrp - (item.mrp * item.discountPercentage / 100);
        return total + discountedPrice * item.quantity;
    }, 0);
    const shipping = 0;
    const total = totalAmount + shipping;

    // Updated UPI ID
    const merchantUpiId = "bp9305968-5@oksbi";
    const merchantName = "OkFutureZone";

    const upiQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=224x224&data=${encodeURIComponent(`upi://pay?pa=${merchantUpiId}&pn=${merchantName}&am=${total.toFixed(2)}&cu=INR&tn=Order-${orderId.slice(-6)}`)}`;
    
    const handleUpiPayment = (appName: string) => {
        // 1. Construct the intent URL
        const upiLink = `upi://pay?pa=${merchantUpiId}&pn=${merchantName}&am=${total.toFixed(2)}&cu=INR&tn=Order-${orderId.slice(-6)}`;
        
        // 2. Trigger the deep link to open the app
        window.location.href = upiLink;
        
        // 3. Update state to show verification screen immediately
        // This ensures when they return to the app, they are on the upload screen
        setSelectedUpiApp(appName);
        setView('manual_verification');
    };

    const CopyableUpi = ({ upiId }: { upiId: string }) => {
        const [copied, setCopied] = useState(false);
        const handleCopy = () => {
            navigator.clipboard.writeText(upiId).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
        };
        return (
            <div className="flex items-center justify-center">
                <p className="font-mono text-base text-white bg-black/30 py-1 px-3 rounded-lg">{upiId}</p>
                <button type="button" onClick={handleCopy} className="ml-2 p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
                    {copied ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    )}
                </button>
            </div>
        );
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCustomer({ ...customer, [e.target.name]: e.target.value });
    };

    const handleProceedToOptions = (e: FormEvent) => {
        e.preventDefault();
        setFormError(null);
        if (!customer.name.trim() || !customer.phone.trim()) {
            setFormError("कृपया अपना नाम और फोन नंबर भरें।");
            return;
        }
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(customer.phone)) {
            setFormError("कृपया एक मान्य 10-अंकीय फ़ोन नंबर दर्ज करें।");
            return;
        }

        if (hasDigitalItems && (!customer.email?.trim() || !customer.whatsapp?.trim())) {
            setFormError("डिजिटल डिलीवरी के लिए कृपया ईमेल और व्हाट्सएप भरें।");
            return;
        }
        if (hasPhysicalItems && (!customer.address?.trim() || !customer.city?.trim() || !customer.state?.trim() || !customer.pincode?.trim())) {
            setFormError("कृपया पूरा शिपिंग पता भरें।");
            return;
        }
        
        if (hasPhysicalItems) {
            setView('shipping_payment');
        } else {
            setPaymentMethod('PREPAID');
            setView('payment_selection');
        }
    };
    
    const getFinalCustomerDetails = () => {
        return {
            ...customer,
            email: customer.email || currentUser?.email || ''
        };
    };

    const handleSelectPaymentMethod = (method: 'PREPAID' | 'COD') => {
        setPaymentMethod(method);
        if (method === 'COD') {
            const finalCustomer = getFinalCustomerDetails();
            onPlaceOrder(finalCustomer, total, 'COD', orderId);
            // ... WhatsApp logic for COD ...
            const adminWhatsAppNumber = '919305968628';
            const itemsSummaryWa = cartItems.map(item => `- ${item.name}`).join('\n');
            const message = `*📦 COD Order!* ID: ${orderId}\nName: ${finalCustomer.name}\nTotal: ₹${total}\nItems:\n${itemsSummaryWa}`;
            const whatsappUrl = `https://wa.me/${adminWhatsAppNumber}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
            navigate(`/orders/${orderId}`);
        } else {
            setView('payment_selection');
        }
    };

     const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setScreenshot(file);
            const preview = await fileToBase64(file);
            setScreenshotPreview(preview);
        }
    };

    const handleSubmitForVerification = async (e: FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!transactionId.trim() || transactionId.trim().length !== 12) {
            setFormError(t('payment_invalid_txn_id'));
            return;
        }
        if (!screenshot) {
            setFormError("कृपया भुगतान का स्क्रीनशॉट अपलोड करें।");
            return;
        }

        setIsVerifying(true);
        try {
            const finalCustomer = getFinalCustomerDetails();
            const screenshotDataUrl = await fileToBase64(screenshot);
            const itemsSummaryText = cartItems.map(item => `${item.name} x${item.quantity}`).join(', ');

            // Send details to Admin Panel
            onVerificationRequest({
                userName: finalCustomer.name,
                userPhone: finalCustomer.phone,
                userEmail: finalCustomer.email, // Pass email for matching
                planName: `Store Order: ${itemsSummaryText.substring(0, 100)}`,
                planPrice: total,
                screenshotDataUrl,
                transactionId,
                type: 'PRODUCT',
                orderId: orderId,
            });
            
            // Place the order
            onPlaceOrder(finalCustomer, total, 'PREPAID', orderId);

            // Send details to Admin WhatsApp
            const adminWhatsAppNumber = '919305968628';
            const message = `*🎉 Prepaid Order Verification!*
ID: ${orderId}
Name: ${finalCustomer.name}
Total: ₹${total}
Txn ID: ${transactionId}
Items: ${itemsSummaryText}

कृपया एडमिन पैनल में भुगतान सत्यापित करें।`;
            
            const whatsappUrl = `https://wa.me/${adminWhatsAppNumber}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
            
            navigate(`/orders/${orderId}`);

        } catch (err) {
            console.error(err);
            setFormError("स्क्रीनशॉट अपलोड करने में विफल। कृपया पुनः प्रयास करें।");
            setIsVerifying(false);
        }
    };

    const renderBackButton = () => {
        if (view === 'details') {
            return <Link to="/cart" className="absolute top-6 left-6 text-purple-300 hover:text-white transition">&larr; कार्ट पर वापस जाएं</Link>;
        }
        if (view === 'shipping_payment') {
            return <button onClick={() => setView('details')} className="absolute top-6 left-6 text-purple-300 hover:text-white transition">&larr; वापस जाएं</button>;
        }
        if (view === 'payment_selection') {
            const backView = hasPhysicalItems ? 'shipping_payment' : 'details';
            return <button onClick={() => setView(backView)} className="absolute top-6 left-6 text-purple-300 hover:text-white transition">&larr; वापस जाएं</button>;
        }
        if (view === 'manual_verification') {
            return <button onClick={() => setView('payment_selection')} className="absolute top-6 left-6 text-purple-300 hover:text-white transition">&larr; वापस जाएं</button>;
        }
        return null;
    };
    
    const renderOrderSummary = () => {
        return (
         <div>
            <h3 className="text-2xl font-hindi font-semibold text-white mb-4">ऑर्डर सारांश</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 mb-4">
                {cartItems.map(item => (
                    <div key={`${item.id}-${item.selectedColor}`} className="flex justify-between items-center text-sm">
                        <span className="text-white/90 truncate pr-2">{item.name} x {item.quantity}</span>
                        <span className="text-white font-semibold">₹{((item.mrp - (item.mrp * item.discountPercentage / 100)) * item.quantity).toFixed(2)}</span>
                    </div>
                ))}
            </div>
            <div className="border-t border-white/20 pt-4 space-y-2">
                <div className="flex justify-between"><span className="text-purple-200">उप-योग:</span><span>₹{totalAmount.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-purple-200">शिपिंग:</span><span>₹{shipping.toFixed(2)}</span></div>
                <div className="flex justify-between text-xl font-bold mt-2 pt-2 border-t border-white/10"><span className="text-white">कुल:</span><span>₹{total.toFixed(2)}</span></div>
            </div>
        </div>
        );
    };

    const renderContent = () => {
        switch(view) {
            case 'details':
                return (
                    <>
                    <h2 className="text-3xl font-hindi font-bold mb-8 text-center">चेकआउट</h2>
                    <div className="grid md:grid-cols-2 gap-12">
                        <div>
                            <form onSubmit={handleProceedToOptions} className="space-y-4">
                                <h3 className="text-2xl font-hindi font-semibold text-white mb-4">ग्राहक जानकारी</h3>
                                <input type="text" name="name" placeholder="पूरा नाम" required onChange={handleInputChange} value={customer.name} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400" />
                                <input type="tel" name="phone" placeholder="फोन नंबर (10 अंक)" required pattern="\d{10}" onChange={handleInputChange} value={customer.phone} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400" />

                                {hasDigitalItems && (
                                    <div className="pt-4 space-y-4">
                                        <h3 className="text-xl font-hindi font-semibold text-white mb-2">ई-पुस्तक डिलीवरी विवरण</h3>
                                        <input type="email" name="email" placeholder="ईमेल पता" required={hasDigitalItems} onChange={handleInputChange} value={customer.email || ''} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400" />
                                        <input type="tel" name="whatsapp" placeholder="व्हाट्सएप नंबर (10 अंक)" required={hasDigitalItems} pattern="\d{10}" onChange={handleInputChange} value={customer.whatsapp || ''} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400" />
                                    </div>
                                )}
                                
                                {hasPhysicalItems && (
                                     <div className="pt-4 space-y-4">
                                        <h3 className="text-xl font-hindi font-semibold text-white mb-2">शिपिंग का पता</h3>
                                        <input type="text" name="address" placeholder="पता" required={hasPhysicalItems} onChange={handleInputChange} value={customer.address || ''} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400" />
                                        <div className="flex gap-4">
                                            <input type="text" name="city" placeholder="शहर" required={hasPhysicalItems} onChange={handleInputChange} value={customer.city || ''} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400" />
                                            <input type="text" name="state" placeholder="राज्य" required={hasPhysicalItems} onChange={handleInputChange} value={customer.state || ''} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400" />
                                        </div>
                                        <input type="text" name="pincode" placeholder="पिनकोड" required={hasPhysicalItems} pattern="\d{6}" onChange={handleInputChange} value={customer.pincode || ''} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400" />
                                    </div>
                                )}
                                
                                {formError && <p className="text-red-400 text-center">{formError}</p>}
                                
                                <button type="submit" className="w-full mt-4 px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 ease-in-out text-lg">
                                    {hasPhysicalItems ? 'भुगतान विकल्प पर जाएं' : 'भुगतान के लिए आगे बढ़ें'}
                                </button>
                            </form>
                        </div>
                        {renderOrderSummary()}
                    </div>
                    </>
                );
            case 'shipping_payment':
                 return (
                    <div className="text-center">
                        <h2 className="text-3xl font-hindi font-bold mb-8 text-center">भुगतान विधि</h2>
                        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                           <button onClick={() => handleSelectPaymentMethod('PREPAID')} className="p-6 bg-white/5 border-2 border-white/20 rounded-lg hover:bg-purple-500/20 hover:border-purple-400 transition">
                                <h3 className="text-2xl font-bold text-white mb-2">प्रीपेड भुगतान</h3>
                                <p className="text-purple-300">UPI/QR कोड का उपयोग करके अभी भुगतान करें और तेजी से डिलीवरी पाएं।</p>
                           </button>
                           <button onClick={() => handleSelectPaymentMethod('COD')} className="p-6 bg-white/5 border-2 border-white/20 rounded-lg hover:bg-purple-500/20 hover:border-purple-400 transition">
                                <h3 className="text-2xl font-bold text-white mb-2">कैश ऑन डिलीवरी</h3>
                                <p className="text-purple-300">उत्पाद प्राप्त होने पर नकद में भुगतान करें।</p>
                           </button>
                        </div>
                    </div>
                );
            case 'payment_selection':
                return (
                    <div className="text-left animate-fade-in max-w-md mx-auto">
                        <div className="bg-gray-900 p-4 -mx-4 -mt-4 mb-6 flex justify-between items-center border-b border-gray-800 rounded-t-xl">
                            <span className="text-gray-400 font-semibold tracking-wide">TOTAL AMOUNT</span>
                            <span className="text-white font-bold text-xl">₹{total.toFixed(0)}</span>
                        </div>

                        <h3 className="text-white font-bold text-lg mb-4 uppercase tracking-widest pl-1">UPI</h3>

                        {/* Pay by Any UPI App Section */}
                        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5 mb-6 relative overflow-hidden group shadow-lg">
                            <div className="flex justify-between items-center mb-5">
                                <div>
                                    <h4 className="text-white font-bold text-base">PAY BY ANY UPI APP</h4>
                                    <p className="text-gray-400 text-xs mt-1">CLICK ICON TO PAY & UPLOAD SCREENSHOT</p>
                                </div>
                                <div className="w-5 h-5 rounded-full border-2 border-gray-500 group-hover:border-purple-500 flex items-center justify-center">
                                    <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
                                </div>
                            </div>

                            {/* Icons Row */}
                            <div className="flex gap-6 mt-2 overflow-x-auto pb-2">
                                <button onClick={() => handleUpiPayment('GPay')} className="flex flex-col items-center gap-2 group min-w-[50px] transition-transform hover:scale-105">
                                    <GPayIcon />
                                    <span className="text-[10px] text-gray-400 font-medium group-hover:text-white">GPAY</span>
                                </button>
                                <button onClick={() => handleUpiPayment('PhonePe')} className="flex flex-col items-center gap-2 group min-w-[50px] transition-transform hover:scale-105">
                                    <PhonePeIcon />
                                    <span className="text-[10px] text-gray-400 font-medium group-hover:text-white">PHONEPE</span>
                                </button>
                                <button onClick={() => handleUpiPayment('Paytm')} className="flex flex-col items-center gap-2 group min-w-[50px] transition-transform hover:scale-105">
                                    <PaytmIcon />
                                    <span className="text-[10px] text-gray-400 font-medium group-hover:text-white">PAYTM</span>
                                </button>
                                <button onClick={() => handleUpiPayment('BHIM')} className="flex flex-col items-center gap-2 group min-w-[50px] transition-transform hover:scale-105">
                                    <BhimIcon />
                                    <span className="text-[10px] text-gray-400 font-medium group-hover:text-white">BHIM</span>
                                </button>
                            </div>
                        </div>

                        {/* Other Options Button */}
                        <button 
                            onClick={() => { setSelectedUpiApp(null); setView('manual_verification'); }}
                            className="w-full bg-gray-800 border border-gray-700 text-white font-semibold py-4 rounded-xl hover:bg-gray-700 transition-all mb-6 text-sm tracking-wide shadow-md uppercase"
                        >
                            OTHER UPI OPTIONS / SCAN QR
                        </button>
                    </div>
                );
            case 'manual_verification':
                return (
                    <div className="text-center animate-fade-in">
                        <h2 className="text-3xl font-hindi font-bold mb-6 text-center">मैनुअल सत्यापन</h2>
                        
                        {selectedUpiApp && (
                            <div className="bg-green-900/40 p-4 rounded-lg border border-green-500/30 mb-6">
                                <p className="text-green-200 text-sm">
                                    आपने <strong>{selectedUpiApp}</strong> चुना है। यदि ऐप नहीं खुला, तो नीचे दिए गए QR को स्कैन करें। भुगतान के बाद, पुष्टि के लिए विवरण भरें।
                                </p>
                            </div>
                        )}

                        {isVerifying ? (
                            <div className="text-center p-8">
                                <div className="relative w-16 h-16 mx-auto mb-4">
                                    <div className="absolute inset-0 border-4 border-purple-400/50 rounded-full animate-spin"></div>
                                </div>
                                <h3 className="text-2xl font-semibold text-white">{t('payment_verifying_title')}</h3>
                                <p className="text-purple-200">{t('payment_verifying_subtitle')}</p>
                            </div>
                        ) : (
                            <>
                                <div className="max-w-md mx-auto mb-8">
                                    <div className="bg-white/5 p-6 rounded-2xl border border-white/20 flex flex-col items-center text-center">
                                        <div className="bg-white p-2 rounded-lg shadow-lg">
                                            <img src={upiQrCodeUrl} alt="UPI QR Code" className="w-56 h-56 object-contain"/>
                                        </div>
                                        <div className="mt-4 w-full">
                                            <p className="text-purple-300 text-sm mb-2">UPI ID:</p>
                                            <CopyableUpi upiId={merchantUpiId} />
                                        </div>
                                    </div>
                                </div>
                                
                                <p className="text-purple-200 mt-6 mb-8 max-w-md mx-auto">{t('payment_after_instruction')}</p>

                                <form onSubmit={handleSubmitForVerification} className="w-full max-w-md mx-auto space-y-4">
                                    <input type="text" value={transactionId} onChange={(e) => setTransactionId(e.target.value.replace(/\D/g, ''))} className="w-full bg-white/10 p-3 rounded-lg border border-white/20" placeholder={t('payment_enter_txn_id')} required maxLength={12} />
                                    
                                    <input type="file" accept="image/*" ref={galleryInputRef} onChange={handleFileChange} className="hidden" />
                                    <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleFileChange} className="hidden" />
                                    
                                    <div className="flex gap-4">
                                        <button type="button" onClick={() => galleryInputRef.current?.click()} className={`w-full p-3 rounded-lg border border-dashed transition ${screenshot ? 'border-green-400 bg-green-900/50 text-green-300' : 'border-white/20 text-purple-200'}`}>
                                            {screenshot ? 'स्क्रीनशॉट चुना गया' : 'गैलरी से चुनें'}
                                        </button>
                                        <button type="button" onClick={() => cameraInputRef.current?.click()} className={`w-full p-3 rounded-lg border border-dashed transition ${screenshot ? 'border-green-400 bg-green-900/50 text-green-300' : 'border-white/20 text-purple-200'}`}>
                                            {screenshot ? 'स्क्रीनशॉट चुना गया' : 'कैमरा खोलें'}
                                        </button>
                                    </div>

                                    {screenshotPreview && <img src={screenshotPreview} alt="Screenshot Preview" className="mx-auto max-h-40 rounded-lg mt-2" />}
                                    {formError && <p className="text-red-400">{formError}</p>}
                                    <button type="submit" className="w-full px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 ease-in-out text-lg">
                                        सत्यापन के लिए भेजें
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                );
        }
    };

    return (
        <Card className="animate-fade-in">
            {renderBackButton()}
            {renderContent()}
        </Card>
    );
};

export default CheckoutScreen;