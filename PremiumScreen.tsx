


import React, { useState } from 'react';
import Card from './Card';
import { SubscriptionPlan } from '../types';
import { useAppContext } from '../App';

interface PremiumScreenProps {
    onSelectPlan: (plan: SubscriptionPlan & { autoRenew: boolean }) => void;
    isTrialAvailable: boolean;
    onBack: () => void;
}

const plans: SubscriptionPlan[] = [
  { name: 'Weekly Plan', price: 99, durationDays: 7, description: '₹99 प्रति सप्ताह' },
  { name: 'Monthly Plan', price: 199, durationDays: 30, description: '₹199 प्रति माह', badge: 'लोकप्रिय' },
  { name: 'Yearly Plan', price: 599, durationDays: 365, description: '₹599 प्रति वर्ष', badge: 'महा बचत (75% छूट)' }
];

const PremiumScreen: React.FC<PremiumScreenProps> = ({ onSelectPlan, isTrialAvailable, onBack }) => {
    const { t } = useAppContext();
    const [autoRenewEnabled, setAutoRenewEnabled] = useState<Record<string, boolean>>({
        'Weekly Plan': true,
        'Monthly Plan': true,
        'Yearly Plan': true
    });

    const toggleAutoRenew = (planName: string) => {
        setAutoRenewEnabled(prev => ({ ...prev, [planName]: !prev[planName] }));
    };

    return (
        <Card className="animate-fade-in max-w-3xl mx-auto">
             <button onClick={onBack} className="absolute top-6 left-6 text-purple-300 hover:text-white transition">&larr; {t('back')}</button>
            <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-amber-300 to-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                </div>
                <h2 className="text-4xl font-hindi font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 mb-2">
                    प्रीमियम अनलॉक करें
                </h2>
                <p className="text-lg text-purple-200 mb-6">सभी 'तंत्र मंत्र यंत्र PDF E-book' तक असीमित पहुंच और डायरेक्ट डाउनलोड प्राप्त करें।</p>
                
                {isTrialAvailable && (
                     <div className="mb-8 p-4 bg-amber-900/40 rounded-xl text-center border border-amber-500/30">
                        <p className="font-bold text-amber-200 text-lg mb-1">विशेष लाभ</p>
                        <p className="text-sm text-amber-100/80">जब तक आपका प्लान सक्रिय है, आप स्टोर से सभी PDF ई-बुक्स को सीधे Google Drive लिंक के माध्यम से डाउनलोड कर सकते हैं।</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map(plan => (
                        <div key={plan.name} className={`relative p-6 bg-white/5 border-2 rounded-2xl flex flex-col text-center transition-transform hover:scale-105 ${plan.badge ? 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.2)]' : 'border-white/20'}`}>
                            {plan.badge && (
                                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-amber-400 text-black font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-md">{plan.badge}</div>
                            )}
                            <h3 className="text-xl font-bold text-white mt-4 mb-2">{plan.name}</h3>
                            <p className="text-3xl font-bold text-pink-400 my-2">₹{plan.price}</p>
                            <p className="text-purple-300 mb-4 text-sm">{plan.description}</p>
                            
                            <div className="flex items-center justify-center gap-3 mb-6 mt-auto">
                                <span className="text-purple-200 text-xs font-semibold">ऑटो पे (Auto-Pay)</span>
                                <div 
                                    onClick={() => toggleAutoRenew(plan.name)}
                                    className={`auto-pay-toggle ${autoRenewEnabled[plan.name] ? 'active' : ''}`}
                                    role="switch"
                                    aria-checked={!!autoRenewEnabled[plan.name]}
                                >
                                    <div className="auto-pay-toggle-knob"></div>
                                </div>
                            </div>

                            <button 
                                onClick={() => onSelectPlan({ ...plan, autoRenew: !!autoRenewEnabled[plan.name] })}
                                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:brightness-110 transition-all duration-300"
                            >
                                चुनें
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
};

export default PremiumScreen;