import React, { useState, useCallback, useEffect, useRef, createContext, useContext, useMemo } from 'react';
import { DivinationType, Order, SupportTicket, UserProfile } from './types';
import LoginScreen from './components/LoginScreen';
import { subscribeToAuthChanges, loginUser, registerUser, logoutUser } from './services/firebaseService';
import AppComp from './components/App';

// --- I18n Language & Auth System ---
const translations = {
  hi: {
    // General UI
    terms_and_conditions: 'नियम और शर्तें',
    privacy_policy: 'गोपनीयता नीति',
    copyright: `© ${new Date().getFullYear()} Ok-E-store. सर्वाधिकार सुरक्षित।`,
    settings: 'सेटिंग्स',
    back: 'वापस',
    my_orders: 'मेरे ऑर्डर',
    welcome_notification_title: 'आपका स्वागत है!',
    welcome_notification_message: 'Ok-E-store में आपका स्वागत है। खरीदारी शुरू करें!',
    special_offer_title: 'विशेष पेशकश!',
    special_offer_message: 'हमारी नई पूजन सामग्री स्टोर देखें।',
    music: 'संगीत',
    admin: 'एडमिन',
    notifications: 'Alert',
    profile: 'प्रोफ़ाइल',
    cart: 'कार्ट',
    search: 'खोज',
    login: 'लॉगिन',
    wishlist: 'पसंद',
    // Welcome Screen
    welcome_greeting: 'Ok-E-store में आपका स्वागत है',
    welcome_subtitle: 'आध्यात्मिक और आधुनिक जीवनशैली की खरीदारी करें',
    welcome_intro: 'यह ऐप पूजन सामग्री, ई-पुस्तकें, मोबाइल एक्सेसरीज़ और बहुत कुछ खरीदने के लिए आपकी वन-स्टॉप-शॉप है।',
    start_journey: 'खरीदारी शुरू करें',
    agree_to_terms_privacy_part1: 'मैं',
    agree_to_terms_privacy_part2: 'और',
    agree_to_terms_privacy_part3: 'से सहमत हूँ।',
    // Settings Screen
    select_language: 'भाषा चुनें',
    select_theme: 'थीम चुनें',
    // Selection Screen Categories
    spiritual_store: 'आध्यात्मिक स्टोर',
    shopping: 'शॉपिंग',
    admin_tools: 'एडमिन उपकरण',
    // Support System
    support_and_help: 'सहायता और समर्थन',
    raise_ticket: 'टिकट बनाएं',
    ticket_category: 'समस्या की श्रेणी',
    describe_issue: 'अपनी समस्या का विस्तार से वर्णन करें',
    submit_ticket: 'टिकट जमा करें',
    ticket_submitted_success_title: 'टिकट सफलतापूर्वक जमा किया गया!',
    ticket_submitted_success_message: 'हमारी टीम जल्द ही आपसे दिए गए मोबाइल नंबर पर संपर्क करेगी।',
    support_ticket_manager: 'सहायता टिकट प्रबंधक',
    ticket_status_open: 'खुला',
    ticket_status_closed: 'बंद',
    mark_as_resolved: 'हल के रूप में चिह्नित करें',
    reopen_ticket: 'टिकट फिर से खोलें',
    // Social Media Manager
    social_media_manager: 'सोशल मीडिया मैनेजर',
    create_new_post: 'नई पोस्ट बनाएं',
    post_content: 'पोस्ट कंटेंट',
    post_image: 'पोस्ट इमेज (वैकल्पप्िक)',
    platforms: 'प्लेटफार्म',
    generate_post: 'पोस्ट बनाएं',
    update_post: 'पोस्ट अपडेट करें',
    recent_posts: 'हाल की पोस्ट्स',
    // Premium
    premium_unlock_title: 'प्रीमियम अनलॉक करें',
    premium_unlock_subtitle: 'सभी तंत्र मंत्र यंत्र ई-बुक्स तक असीमित पहुंच प्राप्त करें।',
    premium_trial_banner_title: 'ई-बुक्स का खजाना!',
    premium_trial_banner_desc: 'अभी सब्सक्राइब करें और सभी PDF सीधे डाउनलोड करें।',
    premium_monthly_plan: 'मासिक प्लान',
    premium_yearly_plan: 'वार्षिक प्लान',
    premium_choose_plan: 'प्लान चुनें',
    payment_title: 'भुगतान',
    payment_your_name: 'आपका नाम',
    payment_your_phone: 'आपका फोन नंबर',
    payment_enter_txn_id: '12-अंकीय लेनदेन आईडी दर्ज करें',
    payment_paid_button: 'भुगतान हो गया',
    payment_verifying_title: 'सत्यापन जारी है',
    payment_verifying_subtitle: 'हम आपके भुगतान की पुष्टि कर रहे हैं।',
    payment_after_instruction: 'भुगतान के बाद, ट्रांजेक्शन आईडी दर्ज करें और स्क्रीनशॉट अपलोड करें।',
    payment_invalid_txn_id: 'अमान्य ट्रांजेक्शन आईडी।',
    sub_confirm_title: 'सदस्यता अनुरोध प्राप्त हुआ!',
    sub_confirm_message: 'आपका अनुरोध प्रक्रियाधीन है। भुगतान सत्यापित होने के बाद प्रीमियम सुविधाएं सक्रिय हो जाएंगी।',
    sub_confirm_button: 'होम पर जाएं',
  },
  en: {
    // General UI
    terms_and_conditions: 'Terms & Conditions',
    privacy_policy: 'Privacy Policy',
    copyright: `© ${new Date().getFullYear()} Ok-E-store. All rights reserved.`,
    settings: 'Settings',
    back: 'Back',
    my_orders: 'My Orders',
    welcome_notification_title: 'Welcome!',
    welcome_notification_message: 'Welcome to Ok-E-store. Start shopping!',
    special_offer_title: 'Special Offer!',
    special_offer_message: 'Check out our new spiritual items store.',
    music: 'Music',
    admin: 'Admin',
    notifications: 'Alert',
    profile: 'Profile',
    cart: 'Cart',
    search: 'Search',
    login: 'Login',
    wishlist: 'Wishlist',
    // Welcome Screen
    welcome_greeting: 'Welcome to Ok-E-store',
    welcome_subtitle: 'Shop for spiritual and modern lifestyle products',
    welcome_intro: 'This app is your one-stop-shop for spiritual items, e-books, mobile accessories, and more.',
    start_journey: 'Start Shopping',
    agree_to_terms_privacy_part1: 'I agree to the',
    agree_to_terms_privacy_part2: 'and',
    agree_to_terms_privacy_part3: '.',
    // Settings Screen
    select_language: 'Select Language',
    select_theme: 'Select Theme',
    // Selection Screen Categories
    spiritual_store: 'Spiritual Store',
    shopping: 'Shopping',
    admin_tools: 'Admin Tools',
    // Support System
    support_and_help: 'Support & Help',
    raise_ticket: 'Raise a Ticket',
    ticket_category: 'Issue Category',
    describe_issue: 'Describe your issue in detail',
    submit_ticket: 'Submit Ticket',
    ticket_submitted_success_title: 'Ticket Submitted Successfully!',
    ticket_submitted_success_message: 'Our team will contact you shortly on the mobile number provided.',
    support_ticket_manager: 'Support Ticket Manager',
    ticket_status_open: 'Open',
    ticket_status_closed: 'Closed',
    mark_as_resolved: 'Mark as Resolved',
    reopen_ticket: 'Re-open Ticket',
    // Social Media Manager
    social_media_manager: 'Social Media Manager',
    create_new_post: 'Create New Post',
    post_content: 'Post Content',
    post_image: 'Post Image (optional)',
    platforms: 'Platforms',
    generate_post: 'Generate Post',
    update_post: 'Update Post',
    recent_posts: 'Recent Posts',
    // Premium
    premium_unlock_title: 'Unlock Premium',
    premium_unlock_subtitle: 'Get unlimited access to all Astrology and AI tools.',
    premium_trial_banner_title: 'Free Trial Available!',
    premium_trial_banner_desc: 'Sign up today and get 3 days free.',
    premium_monthly_plan: 'Monthly Plan',
    premium_yearly_plan: 'Yearly Plan',
    premium_choose_plan: 'Choose Plan',
    payment_title: 'Payment',
    payment_your_name: 'Your Name',
    payment_your_phone: 'Your Phone Number',
    payment_enter_txn_id: 'Enter 12-digit Transaction ID',
    payment_paid_button: 'I Have Paid',
    payment_verifying_title: 'Verifying Payment',
    payment_verifying_subtitle: 'We are verifying your payment details.',
    payment_after_instruction: 'After payment, enter Transaction ID and upload screenshot.',
    payment_invalid_txn_id: 'Invalid Transaction ID.',
    sub_confirm_title: 'Subscription Request Received!',
    sub_confirm_message: 'Your request is processing. Premium features will be activated once payment is verified.',
    sub_confirm_button: 'Go to Home',
  },
};

export const divinationTypeTranslations: Record<string, string> = {
    'पूजन सामग्री': 'Worship Items',
    'तंत्र मंत्र यन्त्र PDF E-book': 'Tantra Mantra Yantra PDF E-book',
    'रत्न आभूषण': 'Gems & Jewelry',
    'मोबाइल एक्सेसरीज': 'Mobile Accessories',
    'लेडीज जेंट्स एंड बेबी शूज': 'Ladies, Gents & Baby Shoes',
    'लेडीज एंड जेंट्स पर्स बैग बेल्ट चाबी का गुच्छा': 'Ladies & Gents Accessories',
    'एडमिन पैनल': 'Admin Panel',
    'आध्यात्मिक स्टोर': 'Spiritual Store',
    'शॉपिंग': 'Shopping',
    'स्थानीय विपणन': 'Local Marketing',
};

interface AppContextType {
    language: 'hi' | 'en';
    setLanguage: (lang: 'hi' | 'en') => void;
    theme: string;
    setTheme: (theme: string) => void;
    t: (key: string, options?: Record<string, string | number>) => string;
    tDiv: (type: DivinationType) => { en: string; hi: string };
    isAuthenticated: boolean;
    currentUser: UserProfile | null;
    showAuth: (onSuccess?: () => void) => void;
    handleLogin: (email: string, password: string) => Promise<string | null>;
    handleSignup: (profileData: UserProfile) => Promise<boolean>;
    logout: () => void;
    deleteCurrentUser: () => void;
    updateProfile: (profile: UserProfile) => void;
    wishlist: string[];
    toggleWishlist: (productId: string) => void;
    isPremiumActive: boolean;
    setExtendedProfiles: React.Dispatch<React.SetStateAction<Record<string, UserProfile>>>;
    setCurrentUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Default language is now English ('en') if nothing is in local storage
    const [language, setLanguage] = useState<'hi' | 'en'>(() => (localStorage.getItem('okFutureZoneLanguage') as 'hi' | 'en') || 'en');
    const [theme, setTheme] = useState(() => localStorage.getItem('okFutureZoneTheme') || 'cosmic');
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    // Extended profiles stored in local storage for now (mapped by email)
    const [extendedProfiles, setExtendedProfiles] = useState<Record<string, UserProfile>>(() => {
        try { const saved = localStorage.getItem('okFutureZoneExtendedProfiles'); return saved ? JSON.parse(saved) : {}; } catch { return {}; }
    });
    
    const [orders, setOrders] = useState<Order[]>(() => {
        try { const saved = localStorage.getItem('okFutureZoneOrders'); return saved ? JSON.parse(saved) : []; } catch { return []; }
    });
    const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => {
        try { const saved = localStorage.getItem('okFutureZoneSupportTickets'); return saved ? JSON.parse(saved) : []; } catch { return []; }
    });
    
    // Wishlist State
    const [wishlist, setWishlist] = useState<string[]>(() => {
        try { const saved = localStorage.getItem('okFutureZoneWishlist'); return saved ? JSON.parse(saved) : []; } catch { return []; }
    });

    const [isAuthVisible, setIsAuthVisible] = useState(false);
    const [authSuccessCallback, setAuthSuccessCallback] = useState<(() => void) | null>(null);

    // Check premium status
    const isPremiumActive = useMemo(() => {
        if (!currentUser?.subscriptionExpiry) return false;
        return new Date(currentUser.subscriptionExpiry) > new Date();
    }, [currentUser]);

    // Auth Subscription Effect
    useEffect(() => {
        const unsubscribe = subscribeToAuthChanges((firebaseUser) => {
            if (firebaseUser) {
                const email = firebaseUser.email || '';
                // Merge Firebase data with local extended data if available
                const extendedData = extendedProfiles[email] || {};
                
                const profile: UserProfile = {
                    name: firebaseUser.displayName || extendedData.name || '',
                    email: email,
                    profilePicture: extendedData.profilePicture, // Keep local base64 for now or use firebaseUser.photoURL
                    phone: extendedData.phone || '',
                    dob: extendedData.dob,
                    timeOfBirth: extendedData.timeOfBirth,
                    placeOfBirth: extendedData.placeOfBirth,
                    signupDate: extendedData.signupDate || new Date().toISOString(),
                    subscriptionPlan: extendedData.subscriptionPlan,
                    subscriptionExpiry: extendedData.subscriptionExpiry,
                    isPremium: extendedData.isPremium
                };
                setCurrentUser(profile);
                setIsAuthenticated(true);
                // Sync extended profile if it was missing basic details
                if (!extendedProfiles[email]) {
                     setExtendedProfiles(prev => ({ ...prev, [email]: profile }));
                }
            } else {
                setCurrentUser(null);
                setIsAuthenticated(false);
            }
        });
        return () => unsubscribe();
    }, [extendedProfiles]);


    useEffect(() => { localStorage.setItem('okFutureZoneLanguage', language); document.documentElement.lang = language; }, [language]);
    useEffect(() => { localStorage.setItem('okFutureZoneTheme', theme); document.body.setAttribute('data-theme', theme); }, [theme]);
    useEffect(() => { localStorage.setItem('okFutureZoneExtendedProfiles', JSON.stringify(extendedProfiles)); }, [extendedProfiles]);
    useEffect(() => { localStorage.setItem('okFutureZoneOrders', JSON.stringify(orders)); }, [orders]);
    useEffect(() => { localStorage.setItem('okFutureZoneSupportTickets', JSON.stringify(supportTickets)); }, [supportTickets]);
    useEffect(() => { localStorage.setItem('okFutureZoneWishlist', JSON.stringify(wishlist)); }, [wishlist]);

    const t = useCallback((key: string, options?: Record<string, string | number>): string => {
        let translation = translations[language][key as keyof typeof translations.hi] || key;
        if (options) { Object.keys(options).forEach(optionKey => { translation = translation.replace(`{${optionKey}}`, String(options[optionKey])); }); }
        return translation;
    }, [language]);

    const tDiv = useCallback((type: DivinationType): { en: string; hi: string } => {
        const englishName = divinationTypeTranslations[type] || type;
        return { en: englishName, hi: type };
    }, []);

    const showAuth = (onSuccess?: () => void) => {
        setIsAuthVisible(true);
        if (onSuccess) { setAuthSuccessCallback(() => onSuccess); }
    };

    const handleLoginLogic = async (email: string, password: string): Promise<string | null> => {
        try {
            await loginUser(email, password);
            setIsAuthVisible(false);
            if (authSuccessCallback) { authSuccessCallback(); setAuthSuccessCallback(null); }
            return null; // Success
        } catch (error: any) {
            console.error("Login failed", error);
            
            // DEMO FALLBACK for testing
            if (email === 'demo@example.com' && password === 'password') {
                const demoUser: UserProfile = {
                    name: 'Demo User',
                    email: 'demo@example.com',
                    phone: '9876543210',
                    signupDate: new Date().toISOString(),
                    isPremium: true,
                    subscriptionPlan: 'Yearly',
                    subscriptionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
                };
                setCurrentUser(demoUser);
                setIsAuthenticated(true);
                setIsAuthVisible(false);
                if (authSuccessCallback) { authSuccessCallback(); setAuthSuccessCallback(null); }
                return null;
            }

            // Return user friendly error message
            if (error.code === 'auth/invalid-credential' || error.message.includes('invalid-credential')) {
                return 'ईमेल या पासवर्ड गलत है।';
            }
            if (error.code === 'auth/user-not-found') {
                return 'खाता नहीं मिला। कृपया साइन अप करें।';
            }
            if (error.code === 'auth/wrong-password') {
                return 'गलत पासवर्ड।';
            }
            return 'लॉगिन विफल। कृपया पुनः प्रयास करें।';
        }
    };
    
    const handleSignupLogic = async (profileData: UserProfile): Promise<boolean> => {
        if (!profileData.email || !profileData.password) return false;
        try {
            await registerUser(profileData.email, profileData.password, profileData.name || '');
            // Store additional details locally keyed by email
            const extendedData = { ...profileData, signupDate: new Date().toISOString() };
            delete extendedData.password; // Don't store password locally
            setExtendedProfiles(prev => ({ ...prev, [profileData.email!]: extendedData }));
            
            setIsAuthVisible(false);
            if (authSuccessCallback) { authSuccessCallback(); setAuthSuccessCallback(null); }
            return true;
        } catch (error) {
             console.error("Signup failed", error);
             return false;
        }
    };

    const logout = async () => {
        await logoutUser();
        setIsAuthenticated(false);
        setCurrentUser(null);
    };

    const updateProfile = (updatedProfile: UserProfile) => {
        if (currentUser?.email) {
            // Merge with existing
            const newProfile = { ...currentUser, ...updatedProfile };
            // Update state
            setCurrentUser(newProfile);
            // Persist extended details
            setExtendedProfiles(prev => ({...prev, [currentUser.email!]: newProfile }));
        }
    };

    const deleteCurrentUser = async () => {
        if (currentUser?.email) {
            const emailToDelete = currentUser.email;
            const phoneToDelete = currentUser.phone;
            // Delete local data
            setExtendedProfiles(prev => { const newProfiles = { ...prev }; delete newProfiles[emailToDelete]; return newProfiles; });
            if (phoneToDelete) {
                setOrders(prev => prev.filter(o => o.customer.phone !== phoneToDelete));
                setSupportTickets(prev => prev.filter(t => t.userPhone !== phoneToDelete));
            }
            await logout();
            // Ideally also delete user from Firebase, but requires re-auth usually.
        }
    };

    const toggleWishlist = (productId: string) => {
        setWishlist(prev => {
            if (prev.includes(productId)) {
                return prev.filter(id => id !== productId);
            } else {
                return [...prev, productId];
            }
        });
    };
    
    const value: AppContextType = useMemo(() => ({
        language, setLanguage, theme, setTheme, t, tDiv, isAuthenticated, currentUser, showAuth, logout, deleteCurrentUser, updateProfile, 
        handleLogin: handleLoginLogic, handleSignup: handleSignupLogic,
        wishlist, toggleWishlist, isPremiumActive, setExtendedProfiles, setCurrentUser
    }), [language, theme, isAuthenticated, currentUser, t, tDiv, wishlist, isPremiumActive]);

    const contextWithSetters = { ...value, setOrders, setSupportTickets };

    return (
        <AppContext.Provider value={contextWithSetters as any}>
            {children}
            {isAuthVisible && <LoginScreen onClose={() => setIsAuthVisible(false)} onLogin={handleLoginLogic} onSignup={handleSignupLogic} />}
        </AppContext.Provider>
    );
};

export default AppComp;