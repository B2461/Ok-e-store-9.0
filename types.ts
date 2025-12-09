

// Fix: Added UserInput, Reading, and SavedReading interfaces to resolve import errors.
export interface UserInput {
    name?: string;
    dob?: string;
    timeOfBirth?: string;
    placeOfBirth?: string;
    image?: File;
    question?: string;

    // For specific tools
    zodiacSign?: string;
    selectedZodiac?: string;
    horoscopeType?: 'daily' | 'weekly' | 'monthly';
    selectedMonth?: string;
    targetLanguage?: string;
    boyName?: string;
    boyDob?: string;
    girlName?: string;
    girlDob?: string;
    name1?: string;
    name2?: string;
    storyPremise?: string;
    startLocation?: string;
    endLocation?: string;
    voice?: 'female' | 'male';
    resolution?: '720p' | '1080p';
    aspectRatio?: '16:9' | '9:16';
    category?: string;
    characters?: string,
    setting?: string,
    visualStyle?: string,
    musicStyle?: string,
    addVoiceOver?: boolean,
    addCaptions?: boolean,
    desiredDuration?: string;
}

export interface Reading {
    past: string;
    present: string;
    future: string;
    cardName?: string;
    imageUrl?: string;
    compatibilityPercentage?: number;
    audioBase64?: string;
    videoUrl?: string;
    videoDownloadUrl?: string;
    startLocation?: string;
    endLocation?: string;
    codeSnippets?: { file: string; code: string; language: string }[];
}

export interface SavedReading {
    id: string;
    date: string;
    divinationType: DivinationType;
    reading: Reading;
}

export interface UserProfile {
    name?: string;
    dob?: string;
    timeOfBirth?: string;
    placeOfBirth?: string;
    email?: string;
    password?: string;

    profilePicture?: string; // base64 encoded image
    phone?: string;
    signupDate?: string;
}

export interface VerificationRequest {
    id: string;
    userName: string;
    userPhone: string;
    planName: string;
    planPrice: number;
    screenshotDataUrl?: string;
    requestDate: string;
    type: 'SUBSCRIPTION' | 'PRODUCT'; // Keeping SUBSCRIPTION for backward compatibility in admin panel
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
  imageUrl?: string; // base64 encoded image
  platforms: ('Facebook' | 'Instagram' | 'Twitter')[];
  createdAt: string;
}


// Fix: Added all missing enum members to resolve property access errors on DivinationType.
export enum DivinationType {
    PUJAN_SAMAGRI = 'पूजन सामग्री',
    TANTRA_MANTRA_YANTRA_EBOOK = 'तंत्र मंत्र यन्त्र PDF E-book',
    MOBILE_ACCESSORIES = 'मोबाइल एक्सेसरीज',
    ADMIN_PANEL = 'एडमिन पैनल',
    GEMS_JEWELRY = 'रत्न आभूषण',
    LADIES_GENTS_BABY_SHOES = 'लेडीज जेंट्स एंड बेबी शूज',
    LADIES_GENTS_ACCESSORIES = 'लेडीज एंड जेंट्स पर्स बैग बेल्ट चाबी का गुच्छा',
    // Special types for showcase slider navigation
    DIVINATION_STORE = 'आध्यात्मिक स्टोर',
    DIVINATION_SHOPPING = 'शॉपिंग',

    // Astrology Tools
    ASTROLOGY = 'ज्योतिष',
    NUMEROLOGY = 'अंक ज्योतिष',
    JANAM_KUNDLI = 'जन्म कुंडली',
    PALMISTRY = 'हस्तरेखा',
    TAROT = 'टैरो कार्ड',
    DREAM = 'स्वप्न फल',
    ZODIAC = 'राशिफल',
    HOROSCOPE = 'राशिफल देखें',
    DAILY_HOROSCOPE = 'आज का राशिफल',
    MARRIAGE_COMPATIBILITY = 'विवाह अनुकूलता',
    LOVE_COMPATIBILITY = 'प्रेम संगतता',
    BUSINESS_ASTROLOGY = 'व्यापार ज्योतिष',
    MOLE = 'तिल विचार',
    LOVE_RELATIONSHIP = 'प्रेम संबंध',
    ANG_SPHURAN = 'अंग स्फुरण',
    SNEEZING = 'छींक विचार',
    TRIKAL_GYAN = 'त्रिकाल ज्ञान',
    PRASHNA_PARIKSHA = 'प्रश्न परीक्षा',
    PRASHNA_CHAKRA = 'प्रश्न चक्र',
    VASTU_SHASTRA = 'वास्तु शास्त्र',
    DAILY_FORTUNE_CARD = 'आज का भाग्य कार्ड',

    // AI Tools
    AI_FACE_READING = 'AI चेहरा पढ़ना',
    AI_TIME_MACHINE = 'AI टाइम मशीन',
    AI_FUTURE_GENERATOR = 'AI भविष्य जेनरेटर',
    AI_CALCULATOR = 'AI कैलकुलेटर',
    OBJECT_COUNTER = 'वस्तु गणक',
    PRODUCT_SCANNER = 'उत्पाद स्कैनर',
    SCAN_TRANSLATE = 'स्कैन और अनुवाद करें',
    TEXT_TO_IMAGE = 'टेक्स्ट से छवि',
    TEXT_TO_VOICE = 'टेक्स्ट से आवाज',
    STORY_TO_IMAGES = 'कहानी से छवियां',
    FUTURE_STORY = 'भविष्य की कहानी',
    IMAGE_TO_VIDEO = 'छवि से वीडियो',
    STORY_TO_VIDEO = 'कहानी से वीडियो',
    LIVE_ASTROLOGER = 'लाइव ज्योतिषी',

    // Lifestyle & Info
    SEASONAL_FOOD = 'मौसमी भोजन',
    FOOD_COMBINATION = 'विरुद्ध भोजन',
    RELIGIOUS_RITUALS = 'धार्मिक अनुष्ठान',
    ENGLISH_GURU = 'इंग्लिश गुरु',
    YOGA_GUIDE_HINDI = 'योग गाइड',
    TIME_MANAGEMENT = 'समय प्रबंधन',

    // Travel & Location
    PILGRIMAGE = 'तीर्थ यात्रा',
    TRAVEL = 'यात्रा शकुन',
    DISHA_SHOOL = 'दिशा शूल',
    FAMOUS_PLACE_TRAVEL = 'प्रसिद्ध स्थान यात्रा',
    TRAIN_JOURNEY = 'रेल यात्रा',
    LOCAL_EXPERTS = 'स्थानीय विशेषज्ञ',
    ROUTE_PLANNER = 'मार्ग योजनाकार',

    // Developer Tools
    CODE_INSPECTOR = 'कोड इंस्पेक्टर',
    HTML_GENERATOR = 'HTML जेनरेटर',
    LOCAL_MARKETING = 'स्थानीय विपणन',

    // Other
    PAST_READINGS = 'पिछली रीडिंग्स',
}

export interface Place {
    name: string;
    address: string;
}

export interface ShowcaseTool {
    type: DivinationType;
    icon: string;
    description: string;
    motivationalText: string;
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