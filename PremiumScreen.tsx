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
  { name: 'Monthly Plan', price: 49, durationDays: 30, description: '₹49 प्रति माह' },
  { name: 'Yearly Plan', price: 299, durationDays: 365, description: '₹299 प्रति वर्ष', badge: '49% बचाएं' }
];

const PremiumScreen: React.FC<PremiumScreenProps> = ({ onSelectPlan, isTrialAvailable, onBack }) => {
    const { t } = useAppContext();
    const [autoRenewEnabled, setAutoRenewEnabled] = useState<Record<string, boolean>>({});

    const toggleAutoRenew = (planName: string) => {
        setAutoRenewEnabled(prev => ({ ...prev, [planName]: !prev[planName] }));
    };

    return (
        <Card className="animate-fade-in max-w-3xl mx-auto">
             <button onClick={onBack} className="absolute top-6 left-6 text-purple-300 hover:text-white transition">&larr; {t('back')}</button>
            <div className="text-center">
                <h2 className="text-4xl font-hindi font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 mb-2">
                    {t('premium_unlock_title')}
                </h2>
                <p className="text-lg text-purple-200 mb-6">{t('premium_unlock_subtitle')}</p>
                
                {isTrialAvailable && (
                     <div className="mb-8 p-3 bg-amber-900/50 rounded-lg text-center border border-amber-400/50">
                        <p className="font-bold text-amber-200">{t('premium_trial_banner_title')}</p>
                        <p className="text-sm text-amber-300">{t('premium_trial_banner_desc')}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {plans.map(plan => (
                        <div key={plan.name} className={`relative p-6 bg-white/5 border-2 rounded-2xl flex flex-col text-center ${plan.badge ? 'border-amber-400' : 'border-white/20'}`}>
                            {plan.badge && (
                                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-amber-400 text-black font-bold text-sm px-4 py-1 rounded-full">{plan.badge}</div>
                            )}
                            <h3 className="text-2xl font-bold text-white mt-4 mb-2">{t(plan.name === 'Monthly Plan' ? 'premium_monthly_plan' : 'premium_yearly_plan')}</h3>
                            <p className="text-4xl font-bold text-pink-400 my-4">₹{plan.price}</p>
                            <p className="text-purple-300 mb-6">{plan.description}</p>
                            
                            <div className="flex items-center justify-center gap-3 mb-6">
                                <span className="text-purple-200 font-semibold">ऑटो पे सेटअप</span>
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
                                className="w-full mt-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300"
                            >
                                {t('premium_choose_plan')}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
};

export default PremiumScreen;