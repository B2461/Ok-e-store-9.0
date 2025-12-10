




import React, { useState, FormEvent, useRef } from 'react';
import Card from './Card';
import { SubscriptionPlan, VerificationRequest, UserProfile } from '../types';
import { useAppContext } from '../App';

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

interface SubscriptionPaymentScreenProps {
    plan: (SubscriptionPlan & { autoRenew: boolean }) | null;
    userProfile: UserProfile | null;
    onVerificationRequest: (request: Omit<VerificationRequest, 'id' | 'requestDate'>) => void;
    onBack: () => void;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

const SubscriptionPaymentScreen: React.FC<SubscriptionPaymentScreenProps> = ({ plan, userProfile, onVerificationRequest, onBack }) => {
    const { t, currentUser } = useAppContext();
    const [userName, setUserName] = useState(userProfile?.name || '');
    const [userPhone, setUserPhone] = useState(currentUser?.phone || '');
    const [transactionId, setTransactionId] = useState('');
    const [screenshot, setScreenshot] = useState<File | null>(null);
    const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState('');
    const galleryInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    // Merchant Details
    const merchantUpiId = "9305968628@digikhata";
    const merchantName = "OkFutureZone";

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

    if (!plan) {
        return (
            <Card className="text-center">
                <p>No subscription plan selected.</p>
                <button onClick={onBack}>Go Back</button>
            </Card>
        );
    }

    const upiQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=224x224&data=${encodeURIComponent(`upi://pay?pa=${merchantUpiId}&pn=${merchantName}&am=${plan.price.toFixed(2)}&cu=INR&tn=Sub-${plan.name.charAt(0)}`)}`;

    const handleUpiPayment = (appName: string) => {
        // Construct the intent URL
        const upiLink = `upi://pay?pa=${merchantUpiId}&pn=${merchantName}&am=${plan.price.toFixed(2)}&cu=INR&tn=Sub-${plan.name.charAt(0)}`;
        // Trigger the deep link
        window.location.href = upiLink;
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
        setError('');
        
        if (!userName.trim() || !userPhone.trim()) {
            setError("कृपया अपना नाम और फ़ोन नंबर दर्ज करें।");
            return;
        }
        
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(userPhone)) {
            setError("कृपया एक मान्य 10-अंकीय फ़ोन नंबर दर्ज करें।");
            return;
        }

        if (!transactionId.trim() || transactionId.trim().length !== 12) {
            setError(t('payment_invalid_txn_id'));
            return;
        }
        if (!screenshot) {
            setError("कृपया भुगतान का स्क्रीनशॉट अपलोड करें।");
            return;
        }

        setIsVerifying(true);
        try {
            const screenshotDataUrl = await fileToBase64(screenshot);

            onVerificationRequest({
                userName,
                userPhone,
                userEmail: currentUser?.email || '', // Pass user email for robust matching
                planName: plan.name,
                planPrice: plan.price,
                screenshotDataUrl,
                transactionId,
                type: 'SUBSCRIPTION',
                autoRenew: plan.autoRenew
            });

            // Send subscription details to admin WhatsApp
            const adminWhatsAppNumber = '919305968628';
            const message = `
*👑 Premium Subscription Request!*

*User:* ${userName}
*Phone:* ${userPhone}
*Email:* ${currentUser?.email || 'N/A'}
*Plan:* ${plan.name}
*Price:* ₹${plan.price.toFixed(2)}
*Txn ID:* ${transactionId}
*Type:* E-book Access

कृपया पेमेंट सत्यापित करें और एडमिन पैनल से अप्रूव करें।
`;
            const whatsappUrl = `https://wa.me/${adminWhatsAppNumber}?text=${encodeURIComponent(message.trim())}`;
            window.open(whatsappUrl, '_blank');

        } catch (err) {
            console.error(err);
            setError("स्क्रीनशॉट अपलोड करने में विफल। कृपया पुनः प्रयास करें।");
            setIsVerifying(false);
        }
    };

    return (
        <Card className="animate-fade-in">
             <button onClick={onBack} className="absolute top-6 left-6 text-purple-300 hover:text-white transition">&larr; {t('back')}</button>
            <div className="text-center">
                 <h2 className="text-3xl font-hindi font-bold mb-2 text-center">{t('payment_title')}</h2>
                <p className="text-lg text-purple-200 mb-2">
                    {plan.name} ({plan.durationDays} Days)
                </p>
                <p className="text-6xl font-bold text-white mb-6">₹{plan.price.toFixed(2)}</p>

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
                        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-5 mb-6 relative overflow-hidden group shadow-lg max-w-sm mx-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-white font-bold text-sm">PAY VIA APP</h4>
                                <p className="text-gray-400 text-xs">CLICK ICON</p>
                            </div>
                            <div className="flex gap-4 justify-around mt-2">
                                <button onClick={() => handleUpiPayment('GPay')} className="flex flex-col items-center gap-2 group transition-transform hover:scale-105">
                                    <GPayIcon />
                                    <span className="text-[10px] text-gray-400 group-hover:text-white">GPAY</span>
                                </button>
                                <button onClick={() => handleUpiPayment('PhonePe')} className="flex flex-col items-center gap-2 group transition-transform hover:scale-105">
                                    <PhonePeIcon />
                                    <span className="text-[10px] text-gray-400 group-hover:text-white">PHONEPE</span>
                                </button>
                                <button onClick={() => handleUpiPayment('Paytm')} className="flex flex-col items-center gap-2 group transition-transform hover:scale-105">
                                    <PaytmIcon />
                                    <span className="text-[10px] text-gray-400 group-hover:text-white">PAYTM</span>
                                </button>
                                <button onClick={() => handleUpiPayment('BHIM')} className="flex flex-col items-center gap-2 group transition-transform hover:scale-105">
                                    <BhimIcon />
                                    <span className="text-[10px] text-gray-400 group-hover:text-white">BHIM</span>
                                </button>
                            </div>
                        </div>

                        <p className="text-purple-300 text-sm mb-4">OR SCAN QR CODE</p>
                        
                        <div className="max-w-md mx-auto mb-8">
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/20 flex flex-col items-center text-center">
                                <div className="bg-white p-2 rounded-lg shadow-lg">
                                    <img src={upiQrCodeUrl} alt="Payment QR Code" className="w-48 h-48 object-contain"/>
                                </div>
                                <div className="mt-4">
                                    <p className="text-purple-300 text-sm mb-1">UPI ID:</p>
                                    <CopyableUpi upiId={merchantUpiId} />
                                </div>
                            </div>
                        </div>
                        
                        <p className="text-purple-200 mt-6 mb-8 max-w-md mx-auto">{t('payment_after_instruction')}</p>

                        <form onSubmit={handleSubmitForVerification} className="w-full max-w-md mx-auto space-y-4">
                            <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full bg-white/10 p-3 rounded-lg border border-white/20" placeholder={t('payment_your_name')} required />
                            <input type="tel" value={userPhone} onChange={(e) => setUserPhone(e.target.value.replace(/\D/g, ''))} className="w-full bg-white/10 p-3 rounded-lg border border-white/20" placeholder={t('payment_your_phone')} required pattern="\d{10}" maxLength={10} />
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

                            {error && <p className="text-red-400">{error}</p>}
                            
                            <button type="submit" className="w-full px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 ease-in-out text-lg">
                                {t('payment_paid_button')}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </Card>
    );
};

export default SubscriptionPaymentScreen;