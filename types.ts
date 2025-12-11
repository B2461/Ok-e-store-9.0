
export interface UserInput {
    name?: string;
    dob?: string;
    image?: File;
    question?: string;
    // Store specific
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    
    // Added for specific tools
    selectedZodiac?: string;
    horoscopeType?: 'weekly' | 'monthly' | 'daily';
    name1?: string;
    name2?: string;
    timeOfBirth?: string;
    placeOfBirth?: string;
    zodiacSign?: string;
    selectedMonth?: string;
    targetLanguage?: string;
    boyName?: string;
    boyDob?: string;
    girlName?: string;
    girlDob?: string;
    voice?: 'female' | 'male';
    storyPremise?: string;
    resolution?: '720p' | '1080p';
    aspectRatio?: '16:9' | '9:16';
    characters?: string;
    setting?: string;
    visualStyle?: string;
    musicStyle?: string;
    addVoiceOver?: boolean;
    addCaptions?: boolean;
    desiredDuration?: string;
    startLocation?: string;
    endLocation?: string;
    category?: string; // For Prashna Chakra
}

export interface Reading {
    past: string;
    present: string;
    future: string;
    imageUrl?: string;
    
    // Added for specific tools
    cardName?: string;
    compatibilityPercentage?: number;
    audioBase64?: string;
    videoUrl?: string;
    videoDownloadUrl?: string;
    codeSnippets?: { file: string; code: string; language: string }[];
    startLocation?: string;
    endLocation?: string;
}

export interface SavedReading {
    id: string;
    date: string;
    divinationType: DivinationType;
    reading: Reading;
}

export interface UserProfile {
    name?: string;
    email?: string;
    password?: string;
    profilePicture?: string;
    phone?: string;
    signupDate?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    
    // Premium Subscription Fields
    subscriptionPlan?: 'Weekly' | 'Monthly' | 'Yearly';
    subscriptionExpiry?: string;
    isPremium?: boolean;

    // Added missing profile fields
    dob?: string;
    timeOfBirth?: string;
    placeOfBirth?: string;
}

export interface VerificationRequest {
    id: string;
    userName: string;
    userPhone: string;
    userEmail?: string;
    planName: string;
    planPrice: number;
    screenshotDataUrl?: string;
    requestDate: string;
    type: 'SUBSCRIPTION' | 'PRODUCT';
    transactionId?: string;
    autoRenew?: boolean;
    orderId?: string;
}

export interface SupportTicket {
    id: string;
    userName: string;
    userPhone: string;
    category: string;
    description: string;
    status: 'Open' | 'Closed';
    createdAt: string;
}

export interface SocialMediaPost {
  id: string;
  content: string;
  imageUrl?: string;
  platforms: ('Facebook' | 'Instagram' | 'Twitter')[];
  createdAt: string;
}

export enum DivinationType {
    // Store Categories
    PUJAN_SAMAGRI = 'पूजन सामग्री',
    TANTRA_MANTRA_YANTRA_EBOOK = 'तंत्र मंत्र यन्त्र PDF E-book',
    MOBILE_ACCESSORIES = 'मोबाइल एक्सेसरीज',
    GEMS_JEWELRY = 'रत्न आभूषण',
    LADIES_GENTS_BABY_SHOES = 'लेडीज जेंट्स एंड बेबी शूज',
    LADIES_GENTS_ACCESSORIES = 'लेडीज एंड जेंट्स पर्स बैग बेल्ट चाबी का गुच्छा',
    
    // Navigation
    DIVINATION_STORE = 'आध्यात्मिक स्टोर',
    DIVINATION_SHOPPING = 'शॉपिंग',
    ADMIN_PANEL = 'एडमिन पैनल',

    // Tools
    TAROT = 'टैरो कार्ड रीडिंग',
    ASTROLOGY = 'ज्योतिष भविष्यवाणी',
    HOROSCOPE = 'राशिफल',
    DAILY_HOROSCOPE = 'दैनिक राशिफल',
    LOVE_COMPATIBILITY = 'प्रेम अनुकूलता',
    DREAM = 'स्वप्न व्याख्या',
    AI_CALCULATOR = 'AI कैलकुलेटर',
    CODE_INSPECTOR = 'कोड इंस्पेक्टर',
    DAILY_FORTUNE_CARD = 'दैनिक भाग्य कार्ड',
    TRIKAL_GYAN = 'त्रिकाल ज्ञान',
    NUMEROLOGY = 'अंक ज्योतिष',
    BUSINESS_ASTROLOGY = 'व्यापार ज्योतिष',
    ROUTE_PLANNER = 'मार्ग योजना',
    YOGA_GUIDE_HINDI = 'योग गाइड',
    STORY_TO_VIDEO = 'कहानी से वीडियो',
    FUTURE_STORY = 'भविष्य की कहानी',
    IMAGE_TO_VIDEO = 'छवि से वीडियो',
    JANAM_KUNDLI = 'जन्म कुंडली',
    PALMISTRY = 'हस्तरेखा',
    AI_FACE_READING = 'चेहरा पढ़ना',
    AI_TIME_MACHINE = 'AI टाइम मशीन',
    OBJECT_COUNTER = 'वस्तु गणक',
    PRODUCT_SCANNER = 'उत्पाद स्कैनर',
    MARRIAGE_COMPATIBILITY = 'विवाह अनुकूलता',
    SCAN_TRANSLATE = 'स्कैन और अनुवाद',
    TEXT_TO_VOICE = 'टेक्स्ट से आवाज़',
    TEXT_TO_IMAGE = 'टेक्स्ट से छवि',
    STORY_TO_IMAGES = 'कहानी से चित्र',
    PILGRIMAGE = 'तीर्थ यात्रा',
    TRAVEL = 'यात्रा भविष्यवाणी',
    MOLE = 'तिल विचार',
    LOVE_RELATIONSHIP = 'प्रेम संबंध विश्लेषण',
    ANG_SPHURAN = 'अंग फड़कना',
    SNEEZING = 'छींक विचार',
    FOOD_COMBINATION = 'भोजन संयोजन',
    RELIGIOUS_RITUALS = 'धार्मिक अनुष्ठान',
    PRASHNA_PARIKSHA = 'प्रश्न परीक्षा',
    FAMOUS_PLACE_TRAVEL = 'प्रसिद्ध स्थान यात्रा',
    TRAIN_JOURNEY = 'रेल यात्रा',
    ENGLISH_GURU = 'इंग्लिश गुरु',
    VASTU_SHASTRA = 'वास्तु शास्त्र',
    AI_FUTURE_GENERATOR = 'AI भविष्य जनरेटर',
    ZODIAC = 'राशि भविष्य',
    SEASONAL_FOOD = 'मौसमी भोजन',
    DISHA_SHOOL = 'दिशा शूल',
    PRASHNA_CHAKRA = 'प्रश्न चक्र',
    LIVE_ASTROLOGER = 'लाइव ज्योतिषी',
    TIME_MANAGEMENT = 'समय प्रबंधन',
    LOCAL_EXPERTS = 'स्थानीय विशेषज्ञ',
    HTML_GENERATOR = 'HTML जेनरेटर',
}

export interface ShowcaseTool {
    type: DivinationType;
    icon: string;
    description: string;
    descriptionHi?: string;
    motivationalText: string;
    motivationalTextHi?: string;
    imageUrl?: string;
}

export type ProductCategory = 'Pujan Samagri' | 'Tantra Mantra Yantra E-book' | 'Gems & Jewelry' | 'Mobile Accessories' | 'Shoes' | 'Accessories';

export type ProductType = 'PHYSICAL' | 'DIGITAL';

export interface Product {
    id: string;
    name: string;
    description: string;
    mrp: number;
    discountPercentage: number;
    colors: string[];
    sizes?: string[];
    imageUrl1: string;
    imageUrl2?: string;
    category: ProductCategory;
    productType: ProductType;
    reviewVideoUrl?: string;
    googleDriveLink?: string;
    isTrending?: boolean;
}

export interface CartItem extends Product {
    quantity: number;
    selectedColor: string;
    selectedSize?: string;
}

export interface CustomerDetails {
    name: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    phone: string;
    email?: string;
    whatsapp?: string;
}

export interface Order {
    id: string;
    items: CartItem[];
    customer: CustomerDetails;
    total: number;
    date: string;
    status: 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Verification Pending' | 'Completed' | 'Payment Pending';
    paymentMethod: 'PREPAID' | 'COD';
    paymentStatus: 'PENDING' | 'VERIFICATION_PENDING' | 'COMPLETED' | 'FAILED';
    trackingId?: string;
    carrier?: string;
    adminWpNumber?: string;
}

export interface Notification {
    id: string;
    icon: string;
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
}

export interface SubscriptionPlan {
    name: string;
    price: number;
    durationDays: number;
    description: string;
    badge?: string;
}

export interface Place {
    name: string;
    address: string;
}
