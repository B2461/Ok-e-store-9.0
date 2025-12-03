
import React, { useState, useCallback, useEffect, useRef, createContext, useContext, useMemo } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { DivinationType, CartItem, Order, CustomerDetails, Product, Notification, UserProfile, VerificationRequest, SupportTicket, SocialMediaPost } from './types';
import WelcomeScreen from './components/WelcomeScreen';
import SelectionScreen from './components/SelectionScreen';
import SettingsScreen from './components/SettingsScreen';
import PujanSamagriStore from './components/PujanSamagriStore';
import ProductDetailScreen from './components/ProductDetailScreen';
import ShoppingCartScreen from './components/ShoppingCartScreen';
import CheckoutScreen from './components/CheckoutScreen';
import OrderConfirmationScreen from './components/OrderConfirmationScreen';
import { products as initialProducts } from './data/products';
import { ebooks } from './data/ebooks';
import NotificationBell from './components/NotificationBell';
import AdminScreen from './components/AdminScreen';
import TermsAndConditions from './components/TermsAndConditions';
import PrivacyPolicy from './components/PrivacyPolicy';
import { toolCategories } from './data/tools';
import ProfileScreen from './components/ProfileScreen';
import BottomNavBar from './components/BottomNavBar';
import LoginScreen from './components/LoginScreen';
import OrderHistoryScreen from './components/OrderHistoryScreen';
import SupportTicketScreen from './components/SupportTicketScreen';
import AudioPlayer from './components/AudioPlayer';
import SearchModal from './components/SearchModal';
import LocalMarketingScreen from './components/LocalMarketingScreen';
import { subscribeToAuthChanges, loginUser, registerUser, logoutUser } from './services/firebaseService';

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
    notifications: 'सूचना',
    profile: 'प्रोफ़ाइल',
    cart: 'कार्ट',
    search: 'खोज',
    login: 'लॉगिन',
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
    mobile_accessories: 'मोबाइल एक्सेसरीज',
    fashion_lifestyle: 'फैशन और लाइफस्टाइल',
    astrology_tools: 'ज्योतिष उपकरण',
    love_relationships: 'प्रेम और संबंध',
    ai_tools: 'AI टूल्स',
    lifestyle_info: 'जीवनशैली और जानकारी',
    travel_location: 'यात्रा और स्थान',
    developer_tools: 'डेवलपर टूल्स',
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
    notifications: 'Notifications',
    profile: 'Profile',
    cart: 'Cart',
    search: 'Search',
    login: 'Login',
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
    mobile_accessories: 'Mobile Accessories',
    fashion_lifestyle: 'Fashion & Lifestyle',
    astrology_tools: 'Astrology Tools',
    love_relationships: 'Love & Relationships',
    ai_tools: 'AI Tools',
    lifestyle_info: 'Lifestyle & Info',
    travel_location: 'Travel & Location',
    developer_tools: 'Developer Tools',
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
    
    const value: AppContextType = useMemo(() => ({
        language, setLanguage, theme, setTheme, t, tDiv, isAuthenticated, currentUser, showAuth, logout, deleteCurrentUser, updateProfile, 
        handleLogin: handleLoginLogic, handleSignup: handleSignupLogic
    }), [language, theme, isAuthenticated, currentUser, t, tDiv]);

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
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-colors ${isActive ? 'text-yellow-300' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive ? 2.5 : 2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
);

const SearchIcon: React.FC<{ isActive: boolean }> = ({ isActive }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isActive ? 2.5 : 2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const App: React.FC = () => {
    const appContext = useContext(AppContext);
    if (!appContext) return null;
    const { currentUser, t, updateProfile, isAuthenticated, showAuth } = appContext;
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

    useEffect(() => { localStorage.setItem('okFutureZoneCartItems', JSON.stringify(cartItems)); }, [cartItems]);
    useEffect(() => { localStorage.setItem('okFutureZoneOrders', JSON.stringify(orders)); setOrders(orders); }, [orders]);
    useEffect(() => { localStorage.setItem('okFutureZoneNotifications', JSON.stringify(notifications)); }, [notifications]);
    useEffect(() => { localStorage.setItem('okFutureZonePendingVerifications', JSON.stringify(pendingVerifications)); }, [pendingVerifications]);
    useEffect(() => { localStorage.setItem('okFutureZoneSupportTickets', JSON.stringify(supportTickets)); setSupportTickets(supportTickets); }, [supportTickets]);
    useEffect(() => { localStorage.setItem('okFutureZoneSocialMediaPosts', JSON.stringify(socialMediaPosts)); }, [socialMediaPosts]);
    useEffect(() => { localStorage.setItem('okFutureZoneCategoryVisibility', JSON.stringify(categoryVisibility)); }, [categoryVisibility]);

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
    
    useEffect(() => {
        const NOTIFICATION_INTERVAL = 12 * 60 * 60 * 1000;
        const CHECK_INTERVAL = 5 * 60 * 1000;
        const sendProductNotification = () => {
            const lastNotificationTime = parseInt(localStorage.getItem('okFutureZoneLastProductNotification') || '0', 10);
            const now = Date.now();
            if (now - lastNotificationTime > NOTIFICATION_INTERVAL) {
                if (products.length === 0) return;
                const randomProduct = products[Math.floor(Math.random() * products.length)];
                const newNotification: Notification = { id: `product-notif-${now}`, icon: '✨', title: 'विशेष पेशकश!', message: `हमारे खास उत्पाद "${randomProduct.name}" को आज ही खरीदें और शानदार छूट पाएं!`, timestamp: new Date().toISOString(), read: false };
                setNotifications(prev => [newNotification, ...prev]);
                localStorage.setItem('okFutureZoneLastProductNotification', now.toString());
            }
        };
        sendProductNotification();
        const intervalId = setInterval(sendProductNotification, CHECK_INTERVAL);
        return () => clearInterval(intervalId);
    }, [products]);

    const ProfileButton: React.FC = () => {
        const { isAuthenticated, currentUser, showAuth } = useAppContext();
        const navigate = useNavigate();
    
        const handleClick = () => {
            if (isAuthenticated) {
                navigate('/profile');
            } else {
                showAuth();
            }
        };
    
        return (
            <button onClick={handleClick} className="flex flex-col items-center justify-center w-14 py-1 rounded-lg hover:bg-white/10 transition-colors duration-300">
                <div className="w-7 h-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden">
                    {isAuthenticated && currentUser?.profilePicture ? (
                        <img src={currentUser.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    )}
                </div>
                 <span className="text-xs font-medium mt-1 text-white">{isAuthenticated ? (currentUser?.name?.split(' ')[0] || t('profile')) : t('login')}</span>
            </button>
        );
    };

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

    return (
        <div className="min-h-screen text-white p-4 pt-20 pb-32">
            {isSearchVisible && <SearchModal products={products} onClose={() => setIsSearchVisible(false)} />}
            <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-900 via-black to-orange-900 backdrop-blur-md h-20 flex items-center justify-between px-2 sm:px-4 border-b border-orange-700/50 shadow-[0_2px_15px_rgba(249,115,22,0.4)]">
                <div className="flex items-center">
                    <Link to="/home" className="flex items-center gap-3">
                        <img 
                            src="https://res.cloudinary.com/de2eehtiy/image/upload/v1764775363/ChatGPT_Image_Dec_2_2025_07_16_51_AM_itnzej.png" 
                            alt="Ok-E-store Logo" 
                            className="h-12 w-12 object-cover rounded-full border-2 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.5)]" 
                        />
                        <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-200 font-hindi tracking-wide shadow-black drop-shadow-md">Ok-E-store</span>
                    </Link>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => setIsSearchVisible(true)} className="flex flex-col items-center justify-center w-14 py-1 rounded-lg transition-colors duration-300 hover:bg-white/10">
                        <SearchIcon isActive={false} />
                        <span className="text-xs text-center font-medium mt-1 text-white">{t('search')}</span>
                    </button>
                    <button onClick={() => handleProtectedLink('/orders')} className={`flex flex-col items-center justify-center w-14 py-1 rounded-lg transition-colors duration-300 ${location.pathname.startsWith('/orders') ? 'yellow-pulse-highlight' : 'hover:bg-white/10'}`}>
                        <OrderIcon isActive={location.pathname.startsWith('/orders')} />
                        <span className={`text-xs text-center font-medium mt-1 ${location.pathname.startsWith('/orders') ? 'text-yellow-300' : 'text-white'}`}>{t('my_orders')}</span>
                    </button>
                    <Link to="/cart" className={`flex flex-col items-center justify-center w-14 py-1 rounded-lg hover:bg-white/10 transition-colors duration-300 ${location.pathname.startsWith('/cart') ? 'bg-white/10' : ''}`}>
                        <div className="relative">
                            <CartIcon isActive={location.pathname.startsWith('/cart')} />
                            {cartItems.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center border border-black">
                                    {cartItems.reduce((acc, item) => acc + item.quantity, 0) > 9 ? '9+' : cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                                </span>
                            )}
                        </div>
                        <span className="text-xs font-medium mt-1 text-white">{t('cart')}</span>
                    </Link>
                    <div className="flex flex-col items-center justify-center w-14 py-1 text-center rounded-lg hover:bg-white/10">
                        <NotificationBell notifications={notifications} onOpen={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))} onClear={() => setNotifications([])} />
                        <span className="text-xs font-medium text-white mt-1">{t('notifications')}</span>
                    </div>
                    <ProfileButton />
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
                </Routes>
            </div>

            <audio ref={audioRef} src="https://aistudio.google.com/static/sounds/background_music.mp3" loop autoPlay />
            
            <BottomNavBar cartItemCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)} />

            <footer className="fixed bottom-0 left-0 right-0 p-2 text-center text-xs text-orange-400/60 selection:bg-orange-500 selection:text-white">
                {t('copyright')}
            </footer>
        </div>
    );
};

export default App;
