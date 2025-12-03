import React, { useState, FormEvent, useRef } from 'react';
import Card from './Card';
import { SubscriptionPlan, VerificationRequest, UserProfile } from '../types';
import { useAppContext } from '../App';

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

    const upiQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=224x224&data=${encodeURIComponent(`upi://pay?pa=9305968628@digikhata&pn=OkFutureZone&am=${plan.price.toFixed(2)}&cu=INR&tn=Subscription-${plan.name.charAt(0)}`)}`;


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
*💎 New Premium Subscription Request!*

*User Name:* ${userName}
*User Phone:* ${userPhone}
*Plan:* ${plan.name}
*Price:* ₹${plan.price.toFixed(2)}
*Transaction ID:* ${transactionId}
*Auto-Renew:* ${plan.autoRenew ? 'Yes' : 'No'}

Please verify the payment and approve the subscription. The screenshot has been uploaded to the admin panel.
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
                    {t(plan.name === 'Monthly Plan' ? 'premium_monthly_plan' : 'premium_yearly_plan')}
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