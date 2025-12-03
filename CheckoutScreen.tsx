
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

const CheckoutScreen: React.FC<CheckoutScreenProps> = ({ cartItems, onPlaceOrder, onVerificationRequest }) => {
    const navigate = useNavigate();
    const { t, currentUser } = useAppContext();
    
    // Initialize with currentUser data ensuring email/phone are captured immediately
    const [customer, setCustomer] = useState<CustomerDetails>({
        name: currentUser?.name || '', 
        address: '', 
        city: '', 
        state: '', 
        pincode: '', 
        phone: currentUser?.phone || '', 
        email: currentUser?.email || '', // Critical fix: Auto-fill email from profile
        whatsapp: ''
    });
    
    const [view, setView] = useState<'details' | 'shipping_payment' | 'payment_form'>('details');
    const [paymentMethod, setPaymentMethod] = useState<'PREPAID' | 'COD' | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [transactionId, setTransactionId] = useState('');
    const [screenshot, setScreenshot] = useState<File | null>(null);
    const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [orderId] = useState(`order-${Date.now()}`);
    const galleryInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    // Ensure customer details stay synced if currentUser loads late
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

    const upiQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=224x224&data=${encodeURIComponent(`upi://pay?pa=9305968628@digikhata&pn=OkFutureZone&am=${total.toFixed(2)}&cu=INR&tn=Order-${orderId.slice(-6)}`)}`;
    
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
            setView('payment_form');
        }
    };
    
    const getFinalCustomerDetails = () => {
        // Ensure logged-in user's email is attached even if not in form
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

            // Send order details to admin WhatsApp for COD
            const adminWhatsAppNumber = '919305968628';
            const itemsSummaryWa = cartItems.map(item => `- ${item.name} (Cat: ${item.category}, Qty: ${item.quantity}, Color: ${item.selectedColor})`).join('\n');

            let deliveryDetails = '';
            if (hasPhysicalItems) {
                deliveryDetails = `
*Shipping Address:*
${finalCustomer.address}
${finalCustomer.city}, ${finalCustomer.state} - ${finalCustomer.pincode}
    `;
            }
            if (hasDigitalItems) {
                deliveryDetails += `
*Digital Delivery:*
Email: ${finalCustomer.email}
WhatsApp: ${finalCustomer.whatsapp}
    `;
            }
            const message = `
*📦 New Cash on Delivery Order!*

*Order ID:* ${orderId}
*Customer Name:* ${finalCustomer.name}
*Customer Phone:* ${finalCustomer.phone}
${deliveryDetails.trim()}

*Order Details:*
${itemsSummaryWa}

*Total Amount:* ₹${total.toFixed(2)}
*Payment Method:* CASH ON DELIVERY

Please process the order.
`;
            const whatsappUrl = `https://wa.me/${adminWhatsAppNumber}?text=${encodeURIComponent(message.trim())}`;
            window.open(whatsappUrl, '_blank');
            
            navigate(`/orders/${orderId}`);
        } else {
            setView('payment_form');
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

            onVerificationRequest({
                userName: finalCustomer.name,
                userPhone: finalCustomer.phone,
                planName: `Store Order: ${itemsSummaryText.substring(0, 100)}`,
                planPrice: total,
                screenshotDataUrl,
                transactionId,
                type: 'PRODUCT',
                orderId: orderId,
            });
            
            onPlaceOrder(finalCustomer, total, 'PREPAID', orderId);

            // Send order details to admin WhatsApp
            const adminWhatsAppNumber = '919305968628';
            const itemsSummaryWa = cartItems.map(item => `- ${item.name} (Cat: ${item.category}, Qty: ${item.quantity}, Color: ${item.selectedColor})`).join('\n');

            let deliveryDetails = '';
            if (hasPhysicalItems) {
                deliveryDetails = `
*Shipping Address:*
${finalCustomer.address}
${finalCustomer.city}, ${finalCustomer.state} - ${finalCustomer.pincode}
    `;
            }
            if (hasDigitalItems) {
                deliveryDetails += `
*Digital Delivery:*
Email: ${finalCustomer.email}
WhatsApp: ${finalCustomer.whatsapp}
    `;
            }
            const message = `
*🎉 New Prepaid Order Received!*

*Order ID:* ${orderId}
*Customer Name:* ${finalCustomer.name}
*Customer Phone:* ${finalCustomer.phone}
${deliveryDetails.trim()}

*Order Details:*
${itemsSummaryWa}

*Total Amount:* ₹${total.toFixed(2)}
*Payment Method:* PREPAID
*Transaction ID:* ${transactionId}

Please verify the payment and process the order.
`;
            const whatsappUrl = `https://wa.me/${adminWhatsAppNumber}?text=${encodeURIComponent(message.trim())}`;
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
        if (view === 'payment_form') {
            const backView = hasPhysicalItems ? 'shipping_payment' : 'details';
            return <button onClick={() => setView(backView)} className="absolute top-6 left-6 text-purple-300 hover:text-white transition">&larr; वापस जाएं</button>;
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
                        <p className="text-purple-200 mb-8">कृपया अपनी पसंदीदा भुगतान विधि चुनें।</p>
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
            case 'payment_form':
                return (
                    <div className="text-center">
                        <h2 className="text-3xl font-hindi font-bold mb-2 text-center">प्रीपेड भुगतान</h2>
                        <p className="text-6xl font-bold text-white mb-8">₹{total.toFixed(2)}</p>
                        
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
                                <p className="text-purple-200 mb-6 max-w-lg mx-auto">भुगतान करने के लिए कृपया नीचे दिए गए QR कोड को स्कैन करें या UPI आईडी/नंबर का उपयोग करें।</p>
                                
                                <div className="max-w-md mx-auto mb-8">
                                    <div className="bg-white/5 p-6 rounded-2xl border border-white/20 flex flex-col items-center text-center">
                                        <h3 className="font-bold text-xl text-white mb-4">DigiKhata / Paytm</h3>
                                        <div className="bg-white p-2 rounded-lg shadow-lg">
                                            <img src={upiQrCodeUrl} alt="DigiKhata / Paytm QR Code" className="w-56 h-56 object-contain"/>
                                        </div>
                                        <div className="mt-4">
                                            <p className="text-purple-300 text-sm">या DigiKhata UPI आईडी पर:</p>
                                            <div className="mt-1">
                                                    <CopyableUpi upiId="9305968628@digikhata" />
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <p className="text-purple-300 text-sm">या Paytm नंबर पर:</p>
                                            <div className="mt-1">
                                                    <CopyableUpi upiId="9305968628" />
                                            </div>
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
                                        मैंने भुगतान कर दिया है, ऑर्डर पूरा करें
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
