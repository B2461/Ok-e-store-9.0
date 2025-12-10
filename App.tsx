
import React, { useState, useCallback, useEffect, useRef, createContext, useContext, useMemo } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { DivinationType, CartItem, Order, CustomerDetails, Product, Notification, UserProfile, VerificationRequest, SupportTicket, SocialMediaPost, SubscriptionPlan } from '../types';
import WelcomeScreen from './WelcomeScreen';
import SelectionScreen from './SelectionScreen';
import SettingsScreen from './SettingsScreen';
import PujanSamagriStore from './PujanSamagriStore';
import ProductDetailScreen from './ProductDetailScreen';
import ShoppingCartScreen from './ShoppingCartScreen';
import CheckoutScreen from './CheckoutScreen';
import OrderConfirmationScreen from './OrderConfirmationScreen';
import { products as initialProducts } from '../data/products';
import { ebooks } from '../data/ebooks';
import NotificationBell from './NotificationBell';
import AdminScreen from './AdminScreen';
import TermsAndConditions from './TermsAndConditions';
import PrivacyPolicy from './PrivacyPolicy';
import { toolCategories } from '../data/tools';
import ProfileScreen from './ProfileScreen';
import BottomNavBar from './BottomNavBar';
import LoginScreen from './LoginScreen';
import OrderHistoryScreen from './OrderHistoryScreen';
import SupportTicketScreen from './SupportTicketScreen';
import AudioPlayer from './AudioPlayer';
import SearchModal from './SearchModal';
import LocalMarketingScreen from './LocalMarketingScreen';
import PremiumScreen from './PremiumScreen';
import SubscriptionPaymentScreen from './SubscriptionPaymentScreen';
import SubscriptionConfirmationScreen from './SubscriptionConfirmationScreen';
import WishlistScreen from './WishlistScreen';
import { subscribeToAuthChanges, loginUser, registerUser, logoutUser } from '../services/firebaseService';

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
    premium_unlock_subtitle: 'सभी ज्योतिष और AI टूल्स तक असीमित पहुंच प्राप्त करें।',
    premium_trial_banner_title: 'मुफ्त ट्रायल उपलब्ध!',
    premium_trial_banner_desc: 'आज ही साइन अप करें और 3 दिन मुफ्त पाएं।',
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
    handleLogin: (email: string, password: string) => Promise<boolean>;
    handleSignup: (profileData: UserProfile) => Promise<boolean>;
    logout: () => void;
    deleteCurrentUser: () => void;
    updateProfile: (profile: UserProfile) => void;
    wishlist: string[];
    toggleWishlist: (productId: string) => void;
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
                    signupDate: extendedData.signupDate || new Date().toISOString()
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

    const handleLoginLogic = async (email: string, password: string): Promise<boolean> => {
        try {
            await loginUser(email, password);
            setIsAuthVisible(false);
            if (authSuccessCallback) { authSuccessCallback(); setAuthSuccessCallback(null); }
            return true;
        } catch (error) {
            console.error("Login failed", error);
            return false;
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
        wishlist, toggleWishlist
    }), [language, theme, isAuthenticated, currentUser, t, tDiv, wishlist]);

    const contextWithSetters = { ...value, setOrders, setSupportTickets };

    return (
        <AppContext.Provider value={contextWithSetters as any}>
            {children}
            {isAuthVisible && <LoginScreen onClose={() => setIsAuthVisible(false)} onLogin={handleLoginLogic} onSignup={handleSignupLogic} />}
        </AppContext.Provider>
    );
};

const CartIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive ? 2.5 : 2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const OrderIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-colors ${isActive ? 'text-black' : 'text-current'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive ? 2.5 : 2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
);

const SearchIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive ? 2.5 : 2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const HeartIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-colors ${isActive ? 'text-pink-500 fill-pink-500' : 'text-current'}`} fill={isActive ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive ? 0 : 2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
);

const App: React.FC = () => {
    const appContext = useContext(AppContext);
    if (!appContext) return null;
    const { currentUser, t, updateProfile, isAuthenticated, showAuth, wishlist } = appContext;
    const { setOrders, setSupportTickets } = appContext as any;
    
    const navigate = useNavigate();
    const location = useLocation();
    
    const [products, setProducts] = useState<Product[]>([...initialProducts, ...ebooks]);
    const [cartItems, setCartItems] = useState<CartItem[]>(() => { try { const saved = localStorage.getItem('okFutureZoneCartItems'); return saved ? JSON.parse(saved) : []; } catch { return []; } });
    const [orders, setOrdersState] = useState<Order[]>(() => { try { const saved = localStorage.getItem('okFutureZoneOrders'); return saved ? JSON.parse(saved) : []; } catch { return []; } });
    const [notifications, setNotifications] = useState<Notification[]>(() => { try { const saved = localStorage.getItem('okFutureZoneNotifications'); return saved ? JSON.parse(saved) : []; } catch { return []; } });
    const [pendingVerifications, setPendingVerifications] = useState<VerificationRequest[]>(() => { try { const saved = localStorage.getItem('okFutureZonePendingVerifications'); return saved ? JSON.parse(saved) : []; } catch { return []; } });
    const [supportTickets, setSupportTicketsState] = useState<SupportTicket[]>(() => { try { const saved = localStorage.getItem('okFutureZoneSupportTickets'); return saved ? JSON.parse(saved) : []; } catch { return []; } });
    const [socialMediaPosts, setSocialMediaPosts] = useState<SocialMediaPost[]>(() => { try { const saved = localStorage.getItem('okFutureZoneSocialMediaPosts'); return saved ? JSON.parse(saved) : []; } catch { return []; } });
    const [categoryVisibility, setCategoryVisibility] = useState<Record<string, boolean>>(() => {
        try { const saved = localStorage.getItem('okFutureZoneCategoryVisibility'); if (saved) { return JSON.parse(saved); } } catch {}
        const defaultVisibility: Record<string, boolean> = {};
        toolCategories.forEach(cat => { defaultVisibility[cat.name] = true; });
        return defaultVisibility;
    });
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [selectedSubscriptionPlan, setSelectedSubscriptionPlan] = useState<(SubscriptionPlan & { autoRenew: boolean }) | null>(null);
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    // Green Flash Logic States
    const [flashCart, setFlashCart] = useState(false);
    const [flashOrder, setFlashOrder] = useState(false);
    const [flashNotif, setFlashNotif] = useState(false);

    // Track previous lengths to detect additions
    const prevCartLength = useRef(cartItems.length);
    const prevOrderLength = useRef(orders.length);
    const prevNotifLength = useRef(notifications.length);

    // Global Click Listener for Green Flash Effect
    useEffect(() => {
        const handleGlobalClick = (e: MouseEvent) => {
            const flash = document.createElement('div');
            flash.className = 'click-flash-effect';
            flash.style.left = `${e.clientX}px`;
            flash.style.top = `${e.clientY}px`;
            document.body.appendChild(flash);
            setTimeout(() => {
                if (document.body.contains(flash)) {
                    document.body.removeChild(flash);
                }
            }, 500); // Remove after animation
        };

        window.addEventListener('click', handleGlobalClick);
        return () => window.removeEventListener('click', handleGlobalClick);
    }, []);

    useEffect(() => { localStorage.setItem('okFutureZoneCartItems', JSON.stringify(cartItems)); }, [cartItems]);
    useEffect(() => { localStorage.setItem('okFutureZoneOrders', JSON.stringify(orders)); setOrders(orders); }, [orders]);
    useEffect(() => { localStorage.setItem('okFutureZoneNotifications', JSON.stringify(notifications)); }, [notifications]);
    useEffect(() => { localStorage.setItem('okFutureZonePendingVerifications', JSON.stringify(pendingVerifications)); }, [pendingVerifications]);
    useEffect(() => { localStorage.setItem('okFutureZoneSupportTickets', JSON.stringify(supportTickets)); setSupportTickets(supportTickets); }, [supportTickets]);
    useEffect(() => { localStorage.setItem('okFutureZoneSocialMediaPosts', JSON.stringify(socialMediaPosts)); }, [socialMediaPosts]);
    useEffect(() => { localStorage.setItem('okFutureZoneCategoryVisibility', JSON.stringify(categoryVisibility)); }, [categoryVisibility]);

    // Flash Effects for Cart, Orders, Notifications
    useEffect(() => {
        if (cartItems.length > prevCartLength.current) {
            setFlashCart(true);
        }
        prevCartLength.current = cartItems.length;
    }, [cartItems]);

    useEffect(() => {
        if (orders.length > prevOrderLength.current) {
            setFlashOrder(true);
        }
        prevOrderLength.current = orders.length;
    }, [orders]);

    useEffect(() => {
        if (notifications.length > prevNotifLength.current) {
            setFlashNotif(true);
        }
        prevNotifLength.current = notifications.length;
    }, [notifications]);


    // Automatic cleanup of orders older than 15 days
    useEffect(() => {
        const cleanupOldOrders = () => {
            const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;
            const now = Date.now();
            
            setOrdersState(prevOrders => {
                const recentOrders = prevOrders.filter(order => {
                    const orderDate = new Date(order.date).getTime();
                    // Keep orders newer than 15 days
                    return (now - orderDate) < FIFTEEN_DAYS_MS;
                });
                
                if (recentOrders.length !== prevOrders.length) {
                    console.log(`Cleaned up ${prevOrders.length - recentOrders.length} orders older than 15 days.`);
                    return recentOrders;
                }
                return prevOrders;
            });
        };
        
        cleanupOldOrders();
    }, []);

    useEffect(() => {
        const hasSeenWelcome = localStorage.getItem('okFutureZoneWelcomeNotif');
        if (!hasSeenWelcome) {
            setNotifications(prev => [
                { id: `notif-${Date.now()}-1`, icon: '👋', title: 'welcome_notification_title', message: 'welcome_notification_message', timestamp: new Date().toISOString(), read: false },
                { id: `notif-${Date.now()}-2`, icon: '🛍️', title: 'special_offer_title', message: 'special_offer_message', timestamp: new Date().toISOString(), read: false }, ...prev
            ]);
            localStorage.setItem('okFutureZoneWelcomeNotif', 'true');
        }
    }, []);
    
    // Notification Logic: 3 times a day (every 8 hours) with diverse categories
    useEffect(() => {
        // 8 hours in milliseconds
        const NOTIFICATION_INTERVAL = 8 * 60 * 60 * 1000; 
        const CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 mins

        const notificationTemplates = [
            { icon: '🔮', title: 'आज का राशिफल', message: 'जानें आज सितारे आपके बारे में क्या कहते हैं! अपना भविष्य देखें।' },
            { icon: '👟', title: 'स्टाइल अलर्ट!', message: 'जूतों के नए कलेक्शन पर भारी छूट। अभी खरीदारी करें!' },
            { icon: '📚', title: 'ज्ञान बढ़ाएं', message: 'नई ई-बुक्स अब उपलब्ध हैं। सफलता की ओर एक कदम बढ़ाएं।' },
            { icon: '🕉️', title: 'आध्यात्मिक शांति', message: 'शुद्ध पूजन सामग्री और यंत्र घर मंगवाएं।' },
            { icon: '🎧', title: 'गैजेट अपडेट', message: 'बेहतरीन मोबाइल एक्सेसरीज सबसे कम दाम में।' },
            { icon: '💑', title: 'रिश्तों की बात', message: 'विवाह और प्रेम अनुकूलता की जांच करें।' },
            { icon: '💎', title: 'चमकदार ऑफर', message: 'रत्न और आभूषणों पर विशेष छूट। अभी देखें!' },
            { icon: '🧘', title: 'स्वास्थ्य और योग', message: 'स्वस्थ जीवन के लिए हमारे योग और आयुर्वेद गाइड पढ़ें।' },
        ];

        const sendProductNotification = () => {
            const lastNotificationTime = parseInt(localStorage.getItem('okFutureZoneLastProductNotification') || '0', 10);
            const now = Date.now();
            
            if (now - lastNotificationTime > NOTIFICATION_INTERVAL) {
                // Pick a random template
                const randomTemplate = notificationTemplates[Math.floor(Math.random() * notificationTemplates.length)];
                
                const newNotification: Notification = { 
                    id: `auto-notif-${now}`, 
                    icon: randomTemplate.icon, 
                    title: randomTemplate.title, 
                    message: randomTemplate.message, 
                    timestamp: new Date().toISOString(), 
                    read: false 
                };
                
                setNotifications(prev => [newNotification, ...prev]);
                localStorage.setItem('okFutureZoneLastProductNotification', now.toString());
            }
        };
        
        sendProductNotification();
        const intervalId = setInterval(sendProductNotification, CHECK_INTERVAL);
        return () => clearInterval(intervalId);
    }, []);

    const handleProtectedLink = (path: string) => {
        if (isAuthenticated) { navigate(path); } else { showAuth(() => navigate(path)); }
    };

    const handleSelectDivinationType = (type: DivinationType) => {
        switch (type) {
            case DivinationType.PUJAN_SAMAGRI: navigate('/store/pujan-samagri'); break;
            case DivinationType.TANTRA_MANTRA_YANTRA_EBOOK: navigate('/store/ebooks'); break;
            case DivinationType.GEMS_JEWELRY: navigate('/store/gems-jewelry'); break;
            case DivinationType.MOBILE_ACCESSORIES: navigate('/store/mobile-accessories'); break;
            case DivinationType.LADIES_GENTS_BABY_SHOES: navigate('/store/shoes'); break;
            case DivinationType.LADIES_GENTS_ACCESSORIES: navigate('/store/accessories'); break;
            case DivinationType.DIVINATION_STORE: navigate('/store'); break;
            default: break;
        }
    };
    
    const addToCart = (product: Product, quantity: number, color: string) => {
        setCartItems(prev => {
            const existingItem = prev.find(item => item.id === product.id && item.selectedColor === color);
            if (existingItem) { return prev.map(item => item.id === product.id && item.selectedColor === color ? { ...item, quantity: item.quantity + quantity } : item); }
            return [...prev, { ...product, quantity, selectedColor: color }];
        });
    };
    
    const onUpdateCartQuantity = (productId: string, color: string, newQuantity: number) => { setCartItems(prev => prev.map(item => item.id === productId && item.selectedColor === color ? { ...item, quantity: newQuantity > 0 ? newQuantity : 1 } : item)); };
    const onRemoveCartItem = (productId: string, color: string) => { setCartItems(prev => prev.filter(item => !(item.id === productId && item.selectedColor === color))); };
    
    const onPlaceOrder = (customerDetails: CustomerDetails, total: number, paymentMethod: 'PREPAID' | 'COD', orderId: string) => {
        const newOrder: Order = { id: orderId, items: cartItems, customer: customerDetails, total, date: new Date().toISOString(), status: paymentMethod === 'PREPAID' ? 'Verification Pending' : 'Processing', paymentMethod, paymentStatus: paymentMethod === 'PREPAID' ? 'VERIFICATION_PENDING' : 'PENDING' };
        setOrdersState(prev => [...prev, newOrder]);
        setCartItems([]);
    };
    
    const onVerificationRequest = (request: Omit<VerificationRequest, 'id' | 'requestDate'>) => {
        const newRequest: VerificationRequest = { ...request, id: `vr-${Date.now()}`, requestDate: new Date().toISOString() };
        setPendingVerifications(prev => [...prev, newRequest]);
    };
    
    const onApproveVerification = (requestId: string) => {
        const request = pendingVerifications.find(r => r.id === requestId);
        if (!request) return;
        if (request.type === 'PRODUCT' && request.orderId) { setOrdersState(prevOrders => prevOrders.map(o => o.id === request.orderId ? { ...o, status: 'Processing', paymentStatus: 'COMPLETED' } : o)); }
        setPendingVerifications(prev => prev.filter(r => r.id !== requestId));
    };

    const handleSelectPlan = (plan: SubscriptionPlan & { autoRenew: boolean }) => {
        setSelectedSubscriptionPlan(plan);
        navigate('/subscribe');
    };

    // --- Styling for Yellow Box Effect ---
    const activeIconClass = "bg-yellow-400 text-black rounded-lg shadow-[0_0_15px_rgba(250,204,21,0.6)] transform scale-105 transition-all duration-300";
    const inactiveIconClass = "hover:bg-white/10 text-white transition-colors duration-300";

    return (
        <div className="min-h-screen text-white p-4 pt-20 pb-32">
            {isSearchVisible && <SearchModal products={products} onClose={() => setIsSearchVisible(false)} />}
            <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-900 via-black to-orange-900 backdrop-blur-md h-20 flex items-center justify-between px-2 sm:px-4 border-b border-orange-700/50 shadow-[0_2px_15px_rgba(249,115,22,0.4)]">
                <div className="flex items-center">
                    <Link to="/home" className="flex items-center">
                        <img 
                            src="https://res.cloudinary.com/de2eehtiy/image/upload/v1765044615/logo_vnttdf.png" 
                            alt="Ok-E-store" 
                            className="h-16 w-auto object-contain" 
                        />
                    </Link>
                </div>
                <div className="flex items-center gap-1">
                    <button 
                        onClick={() => setIsSearchVisible(true)} 
                        className={`flex flex-col items-center justify-center w-14 py-1 rounded-lg ${isSearchVisible ? activeIconClass : inactiveIconClass}`}
                    >
                        <SearchIcon isActive={isSearchVisible} />
                        <span className="text-xs text-center font-medium mt-1">{t('search')}</span>
                    </button>
                    <Link 
                        to="/wishlist" 
                        className={`flex flex-col items-center justify-center w-14 py-1 rounded-lg ${location.pathname.startsWith('/wishlist') ? activeIconClass : inactiveIconClass}`}
                    >
                        <div className="relative">
                            <HeartIcon isActive={location.pathname.startsWith('/wishlist')} />
                            {wishlist.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center border border-black">
                                    {wishlist.length}
                                </span>
                            )}
                        </div>
                        <span className="text-xs text-center font-medium mt-1">{t('wishlist')}</span>
                    </Link>
                    <div className={`flex flex-col items-center justify-center w-14 py-1 text-center rounded-lg ${isNotifOpen ? activeIconClass : inactiveIconClass} ${flashNotif ? 'animate-flash-green' : ''}`}>
                        <NotificationBell 
                            notifications={notifications} 
                            onOpen={() => { setFlashNotif(false); setNotifications(prev => prev.map(n => ({ ...n, read: true }))); }} 
                            onClear={() => setNotifications([])} 
                            isOpen={isNotifOpen}
                            onToggle={setIsNotifOpen}
                        />
                        <span className="text-xs font-medium mt-1">{t('notifications')}</span>
                    </div>
                    <button 
                        onClick={() => { setFlashOrder(false); handleProtectedLink('/orders'); }} 
                        className={`flex flex-col items-center justify-center w-14 py-1 rounded-lg ${location.pathname.startsWith('/orders') ? activeIconClass : inactiveIconClass} ${flashOrder ? 'animate-flash-green' : ''}`}
                    >
                        <OrderIcon isActive={location.pathname.startsWith('/orders')} />
                        <span className="text-xs text-center font-medium mt-1">{t('my_orders')}</span>
                    </button>
                    <Link 
                        to="/cart" 
                        onClick={() => setFlashCart(false)} 
                        className={`flex flex-col items-center justify-center w-14 py-1 rounded-lg ${location.pathname.startsWith('/cart') ? activeIconClass : inactiveIconClass} ${flashCart ? 'animate-flash-green' : ''}`}
                    >
                        <div className="relative">
                            <CartIcon isActive={location.pathname.startsWith('/cart')} />
                            {cartItems.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center border border-black">
                                    {cartItems.reduce((acc, item) => acc + item.quantity, 0) > 9 ? '9+' : cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                                </span>
                            )}
                        </div>
                        <span className="text-xs font-medium mt-1">{t('cart')}</span>
                    </Link>
                </div>
            </header>

            <div className="container mx-auto max-w-7xl">
                <Routes>
                    <Route path="/" element={<WelcomeScreen onStart={() => navigate('/home')} />} />
                    <Route path="/home" element={<SelectionScreen onSelect={handleSelectDivinationType} isPremiumActive={false} products={products} categoryVisibility={categoryVisibility} />} />
                    <Route path="/store" element={<PujanSamagriStore products={products} />} />
                    <Route path="/store/:categoryUrl" element={<PujanSamagriStore products={products} />} />
                    <Route path="/product/:productId" element={<ProductDetailScreen products={products} addToCart={addToCart} />} />
                    <Route path="/cart" element={<ShoppingCartScreen cartItems={cartItems} onUpdateQuantity={onUpdateCartQuantity} onRemoveItem={onRemoveCartItem} />} />
                    <Route path="/checkout" element={<CheckoutScreen cartItems={cartItems} onPlaceOrder={onPlaceOrder} onVerificationRequest={onVerificationRequest} />} />
                    <Route path="/orders" element={<OrderHistoryScreen orders={orders} />} />
                    <Route path="/orders/:orderId" element={<OrderConfirmationScreen orders={orders} />} />
                    <Route path="/profile" element={<ProfileScreen userProfile={currentUser} onUpdateProfile={updateProfile} />} />
                    <Route path="/settings" element={<SettingsScreen audioRef={audioRef} />} />
                    <Route path="/support" element={<SupportTicketScreen onCreateTicket={(ticket) => setSupportTicketsState(prev => [...prev, { ...ticket, id: `st-${Date.now()}`, status: 'Open', createdAt: new Date().toISOString() }])} />} />
                    <Route path="/admin" element={<AdminScreen products={products} onUpdateProducts={setProducts} orders={orders} onUpdateOrders={setOrdersState} pendingVerifications={pendingVerifications} onApproveVerification={onApproveVerification} supportTickets={supportTickets} onUpdateTicket={(t) => setSupportTicketsState(p => p.map(x => x.id === t.id ? t : x))} socialMediaPosts={socialMediaPosts} onCreatePost={(post) => setSocialMediaPosts(p => [...p, {...post, id: `sm-${Date.now()}`, createdAt: new Date().toISOString()}])} onUpdatePost={(post) => setSocialMediaPosts(p => p.map(x => x.id === post.id ? post : x))} onDeletePost={(postId) => setSocialMediaPosts(p => p.filter(x => x.id !== postId))} categoryVisibility={categoryVisibility} onUpdateCategoryVisibility={setCategoryVisibility} />} />
                    <Route path="/terms" element={<TermsAndConditions />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/premium" element={<PremiumScreen onSelectPlan={handleSelectPlan} isTrialAvailable={true} onBack={() => navigate('/home')} />} />
                    <Route path="/subscribe" element={<SubscriptionPaymentScreen plan={selectedSubscriptionPlan} userProfile={currentUser} onVerificationRequest={(req) => { onVerificationRequest(req); navigate('/subscription-confirmed'); }} onBack={() => navigate('/premium')} />} />
                    <Route path="/subscription-confirmed" element={<SubscriptionConfirmationScreen expiryDate={null} />} />
                    <Route path="/wishlist" element={<WishlistScreen products={products} />} />
                </Routes>
            </div>

            <audio ref={audioRef} src="https://aistudio.google.com/static/sounds/background_music.mp3" loop autoPlay />
            
            <BottomNavBar cartItemCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)} />

            <footer className="text-center text-xs text-orange-400/60 mt-12 pb-4">
                <div className="flex justify-center mb-4">
                    <img 
                        src="https://res.cloudinary.com/de2eehtiy/image/upload/v1765084945/3cc7bb1a-d113-4add-b199-0cb4a8406248_qlnfld.png" 
                        alt="Ok-E-store Banner" 
                        className="w-full max-w-sm rounded-lg shadow-lg border border-orange-500/30" 
                    />
                </div>
                <div className="flex justify-center items-center gap-4 mb-2">
                    <Link to="/terms" className="hover:text-orange-300 transition underline">{t('terms_and_conditions')}</Link>
                    <span className="text-orange-400/40">|</span>
                    <Link to="/privacy" className="hover:text-orange-300 transition underline">{t('privacy_policy')}</Link>
                </div>
                <p>{t('copyright')}</p>
            </footer>
        </div>
    );
};

export default App;
