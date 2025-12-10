


import React, { useState, FormEvent, useEffect, useRef } from 'react';
import { Product, ProductCategory, ProductType, VerificationRequest, Order, SupportTicket, SocialMediaPost } from '../types';
import Card from './Card';
import { Link } from 'react-router-dom';
import { useAppContext } from '../App';
import { toolCategories } from '../data/tools';
import LocalMarketingScreen from './LocalMarketingScreen';
import AllIndiaMarketingScreen from './AllIndiaMarketingScreen';
import { uploadToCloudinary } from '../services/cloudinaryService';

interface AdminPanelProps {
    products: Product[];
    onUpdateProducts: (products: Product[]) => void;
    orders: Order[];
    onUpdateOrders: (orders: Order[]) => void;
    pendingVerifications: VerificationRequest[];
    onApproveVerification: (requestId: string) => void;
    supportTickets: SupportTicket[];
    onUpdateTicket: (ticket: SupportTicket) => void;
    socialMediaPosts: SocialMediaPost[];
    onCreatePost: (post: Omit<SocialMediaPost, 'id' | 'createdAt'>) => void;
    onUpdatePost: (post: SocialMediaPost) => void;
    onDeletePost: (postId: string) => void;
    categoryVisibility: Record<string, boolean>;
    onUpdateCategoryVisibility: (visibility: Record<string, boolean>) => void;
}

const initialFormState: Product = {
    id: '',
    name: '',
    description: '',
    mrp: 0,
    discountPercentage: 0,
    colors: [],
    imageUrl1: '',
    imageUrl2: '',
    category: 'Pujan Samagri',
    productType: 'PHYSICAL',
    googleDriveLink: '',
    reviewVideoUrl: '',
};

const VerificationManager: React.FC<{
    verifications: VerificationRequest[];
    orders: Order[];
    onApprove: (requestId: string) => void;
    onReject: (requestId: string) => void;
}> = ({ verifications, orders, onApprove, onReject }) => {
    
    const handleApproveClick = (req: VerificationRequest) => {
        // Handle automated WhatsApp message for digital product orders
        if (req.type === 'PRODUCT' && req.orderId) {
            const order = orders.find(o => o.id === req.orderId);
            if (order) {
                const digitalItems = order.items.filter(item => item.productType === 'DIGITAL' && item.googleDriveLink);
                const customerWhatsapp = order.customer.whatsapp;

                if (digitalItems.length > 0 && customerWhatsapp) {
                    const customerName = order.customer.name;
                    const ebookLinks = digitalItems.map(item => `${item.name}:\n${item.googleDriveLink}`).join('\n\n');
                    
                    const message = `नमस्ते ${customerName}, Ok Future zone से आपकी ई-पुस्तक खरीदने के लिए धन्यवाद।\n\nआपकी पुस्तकें यहाँ हैं:\n\n${ebookLinks}\n\nडाउनलोड करने में किसी भी समस्या के लिए, कृपया हमसे संपर्क करें।`;

                    // Ensure number is formatted for international use without '+'
                    const whatsappNumber = customerWhatsapp.replace(/\D/g, '').slice(-10);
                    const fullNumber = customerWhatsapp.length > 10 ? customerWhatsapp : `91${whatsappNumber}`;
                    
                    const whatsappUrl = `https://wa.me/${fullNumber}?text=${encodeURIComponent(message)}`;
                    
                    window.open(whatsappUrl, '_blank');
                }
            }
        }
        
        // Proceed with the original approval logic
        onApprove(req.id);
    };

    return (
        <Card>
            <h2 className="text-3xl font-hindi font-bold mb-6 text-center">भुगतान सत्यापन</h2>
            <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-2">
                {verifications.length === 0 ? (
                    <p className="text-center text-purple-300 py-4">कोई लंबित सत्यापन नहीं है।</p>
                ) : (
                    [...verifications].reverse().map(req => (
                        <div key={req.id} className="bg-white/5 p-4 rounded-lg border border-white/20">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-purple-300">उपयोगकर्ता</p>
                                    <p className="font-semibold text-white">{req.userName}</p>
                                    <p className="font-mono text-white">{req.userPhone}</p>
                                    {req.userEmail && <p className="text-xs text-gray-400 truncate mt-1">{req.userEmail}</p>}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm text-purple-300">प्लान/उत्पाद</p>
                                        {req.autoRenew && (
                                            <span className="text-xs font-bold bg-purple-800 text-purple-200 px-2 py-0.5 rounded-full border border-purple-400">
                                                ऑटो-पे
                                            </span>
                                        )}
                                    </div>
                                    <p className="font-semibold text-white">{req.planName}</p>
                                    <p className="font-bold text-pink-400">₹{req.planPrice}</p>
                                    {req.transactionId && <p className="text-xs text-purple-300 mt-1">Txn ID: <span className="font-mono text-white">{req.transactionId}</span></p>}
                                </div>
                                 <div className="flex flex-col items-start md:items-end justify-center gap-2">
                                     {req.screenshotDataUrl ? (
                                        <a href={req.screenshotDataUrl} target="_blank" rel="noopener noreferrer" className="w-full md:w-auto text-center px-4 py-2 bg-blue-600/50 text-white text-sm rounded-full hover:bg-blue-600 transition">
                                            स्क्रीनशॉट देखें
                                        </a>
                                     ) : (
                                        <p className="text-sm text-yellow-300 text-center md:text-right">विवरण Google Form में हैं</p>
                                     )}
                                    <div className="flex gap-2 w-full md:w-auto">
                                        <button onClick={() => handleApproveClick(req)} className="w-full px-4 py-2 bg-green-600/50 text-white text-sm rounded-full hover:bg-green-600 transition">स्वीकृत करें</button>
                                        <button onClick={() => onReject(req.id)} className="w-full px-4 py-2 bg-red-600/50 text-white text-sm rounded-full hover:bg-red-600 transition">अस्वीकार करें</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
};

const OrderManager: React.FC<{ orders: Order[], onUpdateOrders: (orders: Order[]) => void }> = ({ orders, onUpdateOrders }) => {
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const [trackingId, setTrackingId] = useState('');
    const [carrier, setCarrier] = useState('SpeedPost Express');
    const [adminWpNumber, setAdminWpNumber] = useState('');

    const handleMarkAsShipped = (order: Order) => {
        setEditingOrder(order);
        setTrackingId(order.trackingId || '');
        setCarrier(order.carrier || 'SpeedPost Express');
        setAdminWpNumber(order.adminWpNumber || '');
    };

    const handleUpdateSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!editingOrder) return;
        const updatedOrders = orders.map(o => 
            o.id === editingOrder.id 
                ? { ...o, status: 'Shipped' as Order['status'], trackingId, carrier, adminWpNumber } 
                : o
        );
        onUpdateOrders(updatedOrders);
        setEditingOrder(null);
    };

    const handleStatusUpdate = (orderId: string, newStatus: Order['status']) => {
        const updatedOrders = orders.map(o => 
            o.id === orderId ? { ...o, status: newStatus } : o
        );
        onUpdateOrders(updatedOrders);
    };

    return (
        <Card>
            <h2 className="text-3xl font-hindi font-bold mb-6 text-center">ऑर्डर प्रबंधन</h2>
            {editingOrder && (
                 <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="max-w-md w-full">
                        <h3 className="text-xl font-bold mb-4">ऑर्डर शिप करें: {editingOrder.id}</h3>
                         <form onSubmit={handleUpdateSubmit} className="space-y-4">
                            <input value={carrier} onChange={e => setCarrier(e.target.value)} placeholder="कैरियर (जैसे SpeedPost)" className="w-full bg-white/10 p-3 rounded-lg border border-white/20" />
                            <input value={trackingId} onChange={e => setTrackingId(e.target.value)} placeholder="ट्रैकिंग आईडी" required className="w-full bg-white/10 p-3 rounded-lg border border-white/20" />
                            <input value={adminWpNumber} onChange={e => setAdminWpNumber(e.target.value)} placeholder="एडमिन व्हाट्सएप (आंतरिक)" className="w-full bg-white/10 p-3 rounded-lg border border-white/20" />
                            <div className="flex gap-4">
                                <button type="submit" className="w-full py-2 bg-purple-600 rounded-lg">अपडेट करें</button>
                                <button type="button" onClick={() => setEditingOrder(null)} className="w-full py-2 bg-white/10 rounded-lg">रद्द करें</button>
                            </div>
                         </form>
                    </Card>
                 </div>
            )}
            <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-2">
                {[...orders].reverse().map(order => (
                    <div key={order.id} className="bg-white/5 p-4 rounded-lg border border-white/20">
                        <div className="flex justify-between items-start">
                           <div>
                                <p className="font-mono text-sm text-pink-300">{order.id}</p>
                                <p className="font-semibold text-white">{order.customer.name} ({order.customer.phone})</p>
                                {order.customer.whatsapp && <p className="text-sm text-purple-300">WhatsApp: {order.customer.whatsapp}</p>}
                                <p className="text-purple-300">{order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}</p>
                           </div>
                           <div className="text-right">
                                <p className="font-bold text-lg text-white">₹{order.total.toFixed(2)}</p>
                                <p className={`font-semibold text-sm px-2 py-1 rounded-full mt-1 inline-block ${order.status === 'Processing' ? 'bg-blue-500/30 text-blue-300' : order.status === 'Shipped' ? 'bg-orange-500/30 text-orange-300' : order.status === 'Out for Delivery' ? 'bg-yellow-500/30 text-yellow-300' : order.status === 'Delivered' ? 'bg-green-500/30 text-green-300' : 'bg-gray-500/30 text-gray-300'}`}>
                                   {order.status}
                                </p>
                           </div>
                        </div>
                        <div className="mt-3 flex gap-2 flex-wrap">
                            {order.status === 'Processing' && (
                                <button onClick={() => handleMarkAsShipped(order)} className="px-3 py-1 bg-blue-600/50 text-white text-xs rounded-full hover:bg-blue-600 transition">
                                    'Shipped' के रूप में चिह्नित करें
                                </button>
                            )}
                             {order.status === 'Shipped' && (
                                <button onClick={() => handleStatusUpdate(order.id, 'Out for Delivery')} className="px-3 py-1 bg-orange-600/50 text-white text-xs rounded-full hover:bg-orange-600 transition">
                                    'Out for Delivery' के रूप में चिह्नित करें
                                </button>
                            )}
                            {order.status === 'Out for Delivery' && (
                                <button onClick={() => handleStatusUpdate(order.id, 'Delivered')} className="px-3 py-1 bg-green-600/50 text-white text-xs rounded-full hover:bg-green-600 transition">
                                    'Delivered' के रूप में चिह्नित करें
                                </button>
                            )}
                        </div>
                        {order.trackingId && <p className="mt-2 text-xs text-purple-300">ट्रैकिंग: {order.carrier} - {order.trackingId}</p>}
                        {order.adminWpNumber && <p className="mt-1 text-xs text-purple-400">एडमिन WP: {order.adminWpNumber}</p>}
                    </div>
                ))}
            </div>
        </Card>
    );
};

const SupportTicketManager: React.FC<{ tickets: SupportTicket[], onUpdateTicket: (ticket: SupportTicket) => void }> = ({ tickets, onUpdateTicket }) => {
    const { t } = useAppContext();
    const openTickets = tickets.filter(t => t.status === 'Open');
    const closedTickets = tickets.filter(t => t.status === 'Closed');

    const handleStatusChange = (ticket: SupportTicket, status: 'Open' | 'Closed') => {
        onUpdateTicket({ ...ticket, status });
    };
    
    return (
        <Card>
            <h2 className="text-3xl font-hindi font-bold mb-6 text-center">{t('support_ticket_manager')}</h2>
            <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-2">
                <h3 className="text-xl font-semibold text-purple-300 border-b border-purple-500/20 pb-2">खुले टिकट ({openTickets.length})</h3>
                {openTickets.length > 0 ? (
                    [...openTickets].reverse().map(ticket => (
                        <div key={ticket.id} className="bg-white/5 p-4 rounded-lg border border-white/20">
                            <div className="flex justify-between items-start">
                                <p className="font-mono text-xs text-pink-300">{ticket.id}</p>
                                <p className="text-xs text-purple-300">{new Date(ticket.createdAt).toLocaleString()}</p>
                            </div>
                            <p className="font-semibold text-white mt-2">{ticket.userName} - <a href={`tel:${ticket.userPhone}`} className="text-blue-300 hover:underline font-mono">{ticket.userPhone}</a></p>
                            <p className="text-sm font-bold text-purple-200 mt-1">{ticket.category}</p>
                            <p className="text-white/90 mt-2 whitespace-pre-wrap">{ticket.description}</p>
                            <button onClick={() => handleStatusChange(ticket, 'Closed')} className="mt-3 px-3 py-1 bg-green-600/50 text-white text-xs rounded-full hover:bg-green-600 transition">
                                {t('mark_as_resolved')}
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-purple-300 py-4">कोई खुला टिकट नहीं है।</p>
                )}
                
                <h3 className="text-xl font-semibold text-purple-300 border-b border-purple-500/20 pb-2 pt-6">बंद टिकट ({closedTickets.length})</h3>
                 {closedTickets.length > 0 ? (
                    [...closedTickets].reverse().map(ticket => (
                         <div key={ticket.id} className="bg-black/20 p-4 rounded-lg border border-white/10 opacity-70">
                            <p className="font-semibold text-white">{ticket.userName} - <span className="font-mono">{ticket.userPhone}</span></p>
                            <p className="text-sm text-purple-300 mt-1">{ticket.category}</p>
                            <p className="text-white/70 mt-2 text-sm">{ticket.description}</p>
                            <button onClick={() => handleStatusChange(ticket, 'Open')} className="mt-3 px-3 py-1 bg-yellow-600/50 text-white text-xs rounded-full hover:bg-yellow-600 transition">
                                {t('reopen_ticket')}
                            </button>
                        </div>
                    ))
                 ) : (
                    <p className="text-center text-purple-300 py-4">कोई बंद टिकट नहीं है।</p>
                 )}
            </div>
        </Card>
    );
}

const SocialMediaManager: React.FC<{
    posts: SocialMediaPost[];
    onCreate: (post: Omit<SocialMediaPost, 'id' | 'createdAt'>) => void;
    onUpdate: (post: SocialMediaPost) => void;
    onDelete: (postId: string) => void;
}> = ({ posts, onCreate, onUpdate, onDelete }) => {
    const { t } = useAppContext();
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState<string | undefined>();
    const [platforms, setPlatforms] = useState<('Facebook' | 'Instagram' | 'Twitter')[]>([]);
    const [editingPost, setEditingPost] = useState<SocialMediaPost | null>(null);

    useEffect(() => {
        if (editingPost) {
            setContent(editingPost.content);
            setImageUrl(editingPost.imageUrl);
            setPlatforms(editingPost.platforms);
        } else {
            resetForm();
        }
    }, [editingPost]);

    const resetForm = () => {
        setContent('');
        setImageUrl(undefined);
        setPlatforms([]);
        setEditingPost(null);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                setImageUrl(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePlatformChange = (platform: 'Facebook' | 'Instagram' | 'Twitter') => {
        setPlatforms(prev =>
            prev.includes(platform)
                ? prev.filter(p => p !== platform)
                : [...prev, platform]
        );
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!content.trim() || platforms.length === 0) {
            alert('Please provide content and select at least one platform.');
            return;
        }

        if (editingPost) {
            onUpdate({ ...editingPost, content, imageUrl, platforms });
        } else {
            onCreate({ content, imageUrl, platforms });
        }
        resetForm();
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
                <h2 className="text-3xl font-hindi font-bold mb-6 text-center">{editingPost ? t('update_post') : t('create_new_post')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-purple-200 text-lg mb-2">{t('post_content')}</label>
                        <textarea value={content} onChange={e => setContent(e.target.value)} rows={6} className="w-full bg-white/10 p-3 rounded-lg border border-white/20" required />
                    </div>
                    <div>
                        <label className="block text-purple-200 text-lg mb-2">{t('post_image')}</label>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-sm text-purple-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500/20 file:text-purple-100 hover:file:bg-purple-500/40" />
                        {imageUrl && <img src={imageUrl} alt="Preview" className="w-full h-32 object-contain rounded mt-2 bg-black/20" />}
                    </div>
                    <div>
                        <label className="block text-purple-200 text-lg mb-2">{t('platforms')}</label>
                        <div className="flex gap-4">
                            {(['Facebook', 'Instagram', 'Twitter'] as const).map(p => (
                                <label key={p} className="flex items-center gap-2 text-white">
                                    <input type="checkbox" checked={platforms.includes(p)} onChange={() => handlePlatformChange(p)} className="h-5 w-5 rounded border-purple-400 text-purple-600 focus:ring-purple-500 bg-transparent" />
                                    {p}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button type="submit" className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-transform">
                            {editingPost ? t('update_post') : t('generate_post')}
                        </button>
                        {editingPost && <button type="button" onClick={resetForm} className="w-full px-6 py-3 bg-white/10 text-purple-200 border border-white/20 rounded-full font-bold">रद्द करें</button>}
                    </div>
                </form>
            </Card>
            <Card>
                <h2 className="text-3xl font-hindi font-bold mb-6 text-center">{t('recent_posts')}</h2>
                <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-2">
                    {posts.length === 0 ? <p className="text-center text-purple-300 py-4">कोई पोस्ट नहीं बनाई गई है।</p> : null}
                    {[...posts].reverse().map(post => (
                        <div key={post.id} className="bg-white/5 p-4 rounded-lg border border-white/20">
                            {post.imageUrl && <img src={post.imageUrl} alt="Post" className="w-full h-32 object-cover rounded mb-2" />}
                            <p className="text-white/90 whitespace-pre-wrap text-sm">{post.content}</p>
                            <div className="flex justify-between items-center mt-3">
                                <div className="flex gap-2">
                                    {post.platforms.map(p => <span key={p} className="text-xs font-bold bg-blue-800/60 text-blue-200 px-2 py-0.5 rounded-full border border-blue-400/50">{p}</span>)}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setEditingPost(post)} className="px-3 py-1 bg-blue-600/50 text-white text-xs rounded-full hover:bg-blue-600">Edit</button>
                                    <button onClick={() => onDelete(post.id)} className="px-3 py-1 bg-red-600/50 text-white text-xs rounded-full hover:bg-red-600">Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

const CategoryManager: React.FC<{
    visibility: Record<string, boolean>;
    onUpdateVisibility: (visibility: Record<string, boolean>) => void;
}> = ({ visibility, onUpdateVisibility }) => {
    const { t } = useAppContext();
    const productCategoriesControl = [
        { id: 'product_ebooks', label: 'E-Books (Tantra Mantra)' },
        { id: 'product_pujan', label: 'Pujan Samagri' },
        { id: 'product_gems', label: 'Gems & Jewelry' },
        { id: 'product_mobile', label: 'Mobile Accessories' },
        { id: 'product_shoes', label: 'Shoes' },
        { id: 'product_accessories', label: 'Accessories' },
    ];

    const handleToggle = (categoryName: string) => {
        onUpdateVisibility({
            ...visibility,
            [categoryName]: !(visibility[categoryName] ?? true) // Default to visible if not set
        });
    };

    return (
        <Card>
            <h2 className="text-3xl font-hindi font-bold mb-6 text-center">कैटेगरी कंट्रोल</h2>
            <p className="text-center text-purple-300 mb-6">चुनें कि कौन से उत्पाद अनुभाग मुख्य स्क्रीन पर दिखाई देंगे।</p>
            
            <div className="max-h-[60vh] overflow-y-auto space-y-6 pr-2">
                <div>
                    <h3 className="text-xl font-bold text-purple-300 border-b border-purple-500/20 pb-2 mb-4">उत्पाद अनुभाग</h3>
                    <div className="space-y-4">
                        {productCategoriesControl.map(category => (
                            <div key={category.id} className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/20">
                                <span className="font-semibold text-white">{category.label}</span>
                                <div
                                    onClick={() => handleToggle(category.id)}
                                    className={`auto-pay-toggle ${(visibility[category.id] ?? true) ? 'active' : ''}`}
                                    role="switch"
                                    aria-checked={visibility[category.id] ?? true}
                                    aria-label={`Toggle visibility for ${category.label}`}
                                >
                                    <div className="auto-pay-toggle-knob"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );
};

// Quick Media Uploader Component for getting links
const QuickMediaUploader: React.FC = () => {
    const [mediaUrl, setMediaUrl] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
    const [statusMessage, setStatusMessage] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    
    const imgInputRef = useRef<HTMLInputElement>(null);
    const imgCameraRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const videoCameraRef = useRef<HTMLInputElement>(null);

    // Helper function to compress image
    const compressImage = (file: File): Promise<File> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                // Aggressive compression for speed: Max 800px width
                const maxWidth = 800; 
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                ctx?.drawImage(img, 0, 0, width, height);
                
                // Convert to blob with low quality (0.6) for speed
                canvas.toBlob((blob) => {
                    if (blob) {
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    } else {
                        reject(new Error("Compression failed"));
                    }
                }, 'image/jpeg', 0.6);
            };
            img.onerror = (err) => reject(err);
        });
    }

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setIsProcessing(true);
            setMediaType(type);
            setMediaUrl(null);
            setUploadProgress(0);
            setStatusMessage("प्रारंभ हो रहा है...");
            
            try {
                let uploadFile = file;
                
                if (type === 'image') {
                    setStatusMessage("इमेज छोटी की जा रही है (Compressing)...");
                    try {
                        uploadFile = await compressImage(file);
                    } catch (e) {
                        console.warn("Compression failed, using original");
                    }
                }

                const url = await uploadToCloudinary(uploadFile, (progress) => {
                    setUploadProgress(progress);
                    setStatusMessage(`अपलोड हो रहा है: ${Math.round(progress)}%`);
                });
                
                setMediaUrl(url);
                setStatusMessage("✅ अपलोड सफल!");

            } catch (error: any) {
                setStatusMessage(`❌ त्रुटि: ${error.message}`);
                setIsProcessing(false);
            } finally {
                // Clear input value to allow re-uploading same file if needed
                if (e.target) e.target.value = '';
                setIsProcessing(false);
            }
        }
    };

    const copyLink = () => {
        if (mediaUrl) {
            navigator.clipboard.writeText(mediaUrl);
            alert('Link Copied!');
        }
    };

    return (
        <Card className="mb-8 border border-dashed border-purple-400/50 bg-purple-900/10">
            <h3 className="text-xl font-bold text-white mb-4 text-center">📷 🎥 क्विक मीडिया अपलोडर (Fast Link Generator)</h3>
            <p className="text-sm text-purple-200 text-center mb-6">फोटो या वीडियो अपलोड करें और तुरंत लिंक प्राप्त करें। <br/><span className="text-xs text-gray-400">(स्टोरेज: Cloudinary)</span></p>
            
            <div className="flex flex-col items-center gap-6">
                {/* Hidden Inputs */}
                <input type="file" accept="image/*" ref={imgInputRef} onChange={(e) => handleUpload(e, 'image')} className="hidden" />
                <input type="file" accept="image/*" capture="environment" ref={imgCameraRef} onChange={(e) => handleUpload(e, 'image')} className="hidden" />
                <input type="file" accept="video/*" ref={videoInputRef} onChange={(e) => handleUpload(e, 'video')} className="hidden" />
                <input type="file" accept="video/*" capture="environment" ref={videoCameraRef} onChange={(e) => handleUpload(e, 'video')} className="hidden" />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                    <button 
                        onClick={() => imgInputRef.current?.click()} 
                        disabled={isProcessing}
                        className="flex flex-col items-center justify-center p-4 bg-white/10 hover:bg-purple-600/50 rounded-xl border border-white/20 transition disabled:opacity-50"
                    >
                        <span className="text-2xl mb-2">🖼️</span>
                        <span className="text-xs font-bold">फोटो गैलरी</span>
                    </button>
                    <button 
                        onClick={() => imgCameraRef.current?.click()} 
                        disabled={isProcessing}
                        className="flex flex-col items-center justify-center p-4 bg-white/10 hover:bg-purple-600/50 rounded-xl border border-white/20 transition disabled:opacity-50"
                    >
                        <span className="text-2xl mb-2">📷</span>
                        <span className="text-xs font-bold">फोटो कैमरा</span>
                    </button>
                    <button 
                        onClick={() => videoInputRef.current?.click()} 
                        disabled={isProcessing}
                        className="flex flex-col items-center justify-center p-4 bg-white/10 hover:bg-purple-600/50 rounded-xl border border-white/20 transition disabled:opacity-50"
                    >
                        <span className="text-2xl mb-2">🎬</span>
                        <span className="text-xs font-bold">वीडियो गैलरी</span>
                    </button>
                    <button 
                        onClick={() => videoCameraRef.current?.click()} 
                        disabled={isProcessing}
                        className="flex flex-col items-center justify-center p-4 bg-white/10 hover:bg-purple-600/50 rounded-xl border border-white/20 transition disabled:opacity-50"
                    >
                        <span className="text-2xl mb-2">🎥</span>
                        <span className="text-xs font-bold">वीडियो कैमरा</span>
                    </button>
                </div>

                {isProcessing && (
                    <div className="w-full">
                        <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2">
                            <div className="bg-purple-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                        <p className="text-center text-yellow-300 font-bold text-sm">{statusMessage}</p>
                    </div>
                )}
                
                {!isProcessing && statusMessage && !mediaUrl && (
                     <div className="text-center">
                        <p className="text-red-300 text-sm font-semibold bg-red-900/20 px-3 py-1 rounded inline-block">{statusMessage}</p>
                     </div>
                )}

                {mediaUrl && (
                    <div className="w-full animate-fade-in">
                        <div className="text-center mb-2">
                             <p className="text-green-400 font-bold text-sm">{statusMessage}</p>
                        </div>
                        <div className="bg-black/30 p-3 rounded-lg flex items-center gap-2 mb-4 border border-white/20">
                            <input readOnly value={mediaUrl} className="flex-grow bg-transparent text-sm text-white border-none focus:ring-0" />
                            <button onClick={copyLink} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-xs font-bold text-white whitespace-nowrap">Copy Link</button>
                        </div>
                        
                        <div className="text-center">
                            <p className="text-xs text-purple-300 mb-2">पूर्वावलोकन (Preview):</p>
                            {mediaType === 'image' ? (
                                <img src={mediaUrl} alt="Uploaded" className="max-h-60 mx-auto rounded-lg border border-white/20 shadow-lg" />
                            ) : (
                                <video src={mediaUrl} controls className="max-h-60 mx-auto rounded-lg border border-white/20 shadow-lg" />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};


const AdminPanel: React.FC<AdminPanelProps> = (props) => {
    const { products, onUpdateProducts, orders, onUpdateOrders, pendingVerifications, onApproveVerification, supportTickets, onUpdateTicket, socialMediaPosts, onCreatePost, onUpdatePost, onDeletePost, categoryVisibility, onUpdateCategoryVisibility } = props;
    const [formData, setFormData] = useState<Product>(initialFormState);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const galleryInputRef1 = useRef<HTMLInputElement>(null);
    const cameraInputRef1 = useRef<HTMLInputElement>(null);
    const galleryInputRef2 = useRef<HTMLInputElement>(null);
    const cameraInputRef2 = useRef<HTMLInputElement>(null);
    const videoGalleryInputRef = useRef<HTMLInputElement>(null);
    const videoCameraInputRef = useRef<HTMLInputElement>(null);
    const [activeTab, setActiveTab] = useState('verifications');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    useEffect(() => {
        if (editingProduct) {
            setFormData(editingProduct);
        } else {
            setFormData(initialFormState);
        }
    }, [editingProduct]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'imageUrl1' | 'imageUrl2') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setIsUploading(true);
            setUploadError(null);
            try {
                // Use Cloudinary service
                const url = await uploadToCloudinary(file);
                setFormData(prev => ({ ...prev, [field]: url }));
            } catch (error: any) {
                console.error("Upload failed:", error);
                // Fallback for when config is missing
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (event.target?.result) {
                         setFormData(prev => ({ ...prev, [field]: event.target!.result as string }));
                    }
                };
                reader.readAsDataURL(file);
                setUploadError("Cloudinary upload failed. Using local preview.");
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setIsUploading(true);
            setUploadError(null);
            try {
                const url = await uploadToCloudinary(file);
                setFormData({ ...formData, reviewVideoUrl: url });
            } catch (error) {
                 console.error("Video Upload failed:", error);
                 const reader = new FileReader();
                 reader.onload = (event) => {
                    if (event.target?.result) {
                         setFormData({ ...formData, reviewVideoUrl: event.target!.result as string });
                    }
                 };
                 reader.readAsDataURL(file);
                 setUploadError("Video upload failed. Using local preview.");
            } finally {
                setIsUploading(false);
            }
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'colors') {
            setFormData({ ...formData, [name]: value.split(',').map(c => c.trim()) });
        } else if (name === 'mrp' || name === 'discountPercentage') {
             setFormData({ ...formData, [name]: parseFloat(value) || 0 });
        }
        else {
            setFormData({ ...formData, [name]: value });
        }
    };
    
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        let updatedProducts;

        if (editingProduct) {
            updatedProducts = products.map(p => p.id === editingProduct.id ? formData : p);
        } else {
            const newProduct = { ...formData, id: `prod-${Date.now()}` };
            updatedProducts = [...products, newProduct];
        }
        onUpdateProducts(updatedProducts);
        setEditingProduct(null);
        setFormData(initialFormState);
    };

    const handleDelete = (productId: string) => {
        if (window.confirm("क्या आप वाकई इस उत्पाद को हटाना चाहते हैं?")) {
            const updatedProducts = products.filter(p => p.id !== productId);
            onUpdateProducts(updatedProducts);
        }
    };

    const handleCancelEdit = () => {
        setEditingProduct(null);
        setFormData(initialFormState);
    };
    
    const handleRejectVerification = (requestId: string) => {
        if(window.confirm("क्या आप वाकई इस सत्यापन अनुरोध को अस्वीकार करना चाहते हैं?")) {
             console.log("Rejected verification request:", requestId);
             alert("अस्वीकृत (सिमुलेशन)। असली ऐप में यह सूची से हटा दिया जाएगा।");
        }
    };

    const handleCopyLink = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            alert("लिंक कॉपी किया गया!");
        });
    };

    const TabButton: React.FC<{tabId: string, children: React.ReactNode, count: number}> = ({ tabId, children, count }) => (
         <button
            onClick={() => setActiveTab(tabId)}
            className={`relative w-full text-center p-4 font-hindi font-semibold border-b-4 transition-all duration-300 ${activeTab === tabId ? 'border-purple-400 text-white' : 'border-transparent text-purple-300 hover:border-purple-400/50 hover:text-white'}`}
        >
            {children}
            {count > 0 && <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{count}</span>}
        </button>
    );

    return (
        <div className="animate-fade-in w-full max-w-6xl mx-auto space-y-8">
             <div className="flex justify-center border-b border-white/20 mb-6 bg-white/5 rounded-t-lg overflow-x-auto category-tabs">
                <TabButton tabId="verifications" count={pendingVerifications.length}>भुगतान सत्यापन</TabButton>
                <TabButton tabId="orders" count={orders.filter(o => o.status === 'Processing' || o.status === 'Verification Pending').length}>ऑर्डर प्रबंधन</TabButton>
                <TabButton tabId="tickets" count={supportTickets.filter(t => t.status === 'Open').length}>सहायता टिकट</TabButton>
                <TabButton tabId="social_media" count={0}>सोशल मीडिया</TabButton>
                <TabButton tabId="local_marketing" count={0}>स्थानीय विपणन</TabButton>
                <TabButton tabId="all_india_marketing" count={0}>अखिल भारतीय विपणन</TabButton>
                <TabButton tabId="category_control" count={0}>कैटेगरी कंट्रोल</TabButton>
                <TabButton tabId="products" count={0}>उत्पाद प्रबंधन</TabButton>
            </div>
            
            {activeTab === 'verifications' && (
                <VerificationManager
                    verifications={pendingVerifications}
                    orders={orders}
                    onApprove={onApproveVerification}
                    onReject={handleRejectVerification}
                />
            )}

            {activeTab === 'orders' && (
                <OrderManager orders={orders} onUpdateOrders={onUpdateOrders} />
            )}
            
            {activeTab === 'tickets' && (
                <SupportTicketManager tickets={supportTickets} onUpdateTicket={onUpdateTicket} />
            )}

            {activeTab === 'social_media' && (
                <SocialMediaManager
                    posts={socialMediaPosts}
                    onCreate={onCreatePost}
                    onUpdate={onUpdatePost}
                    onDelete={onDeletePost}
                />
            )}

            {activeTab === 'local_marketing' && (
                <LocalMarketingScreen />
            )}
            
            {activeTab === 'all_india_marketing' && (
                <AllIndiaMarketingScreen />
            )}

            {activeTab === 'category_control' && (
                <CategoryManager
                    visibility={categoryVisibility}
                    onUpdateVisibility={onUpdateCategoryVisibility}
                />
            )}

            {activeTab === 'products' && (
                <>
                    <QuickMediaUploader />
                    
                    <Card>
                        <h2 className="text-3xl font-hindi font-bold mb-6 text-center">{editingProduct ? 'उत्पाद संपादित करें' : 'नया उत्पाद जोड़ें'}</h2>
                         {uploadError && <div className="mb-4 p-3 bg-red-900/50 border border-red-400 text-red-200 rounded-lg text-center text-sm">{uploadError}</div>}
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <input name="name" value={formData.name} onChange={handleInputChange} placeholder="उत्पाद का नाम" required className="w-full bg-white/10 p-3 rounded-lg border border-white/20" />
                                <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="विवरण" required className="w-full bg-white/10 p-3 rounded-lg border border-white/20 h-24" />
                                <div className="flex gap-4">
                                    <input type="number" name="mrp" value={formData.mrp} onChange={handleInputChange} placeholder="MRP" required className="w-full bg-white/10 p-3 rounded-lg border border-white/20" />
                                    <input type="number" name="discountPercentage" value={formData.discountPercentage} onChange={handleInputChange} placeholder="छूट %" required className="w-full bg-white/10 p-3 rounded-lg border border-white/20" />
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                        <label className="block text-purple-200 text-sm mb-3 font-semibold">उत्पाद छवि 1 (Product Image 1)</label>
                                        <input type="file" accept="image/*" ref={galleryInputRef1} onChange={(e) => handleImageUpload(e, 'imageUrl1')} className="hidden" />
                                        <input type="file" accept="image/*" capture="environment" ref={cameraInputRef1} onChange={(e) => handleImageUpload(e, 'imageUrl1')} className="hidden" />
                                        
                                        {formData.imageUrl1 ? (
                                            <div className="relative group">
                                                <img src={formData.imageUrl1} alt="पूर्वावलोकन 1" className="w-full h-48 object-contain bg-black/40 rounded-lg border border-white/20 mb-2" />
                                                <div className="flex gap-2">
                                                    <input readOnly value={formData.imageUrl1} className="w-full bg-black/20 text-xs text-gray-300 p-2 rounded border border-white/10" />
                                                    <button type="button" onClick={() => handleCopyLink(formData.imageUrl1)} className="bg-blue-600 px-2 rounded text-xs text-white">Copy</button>
                                                </div>
                                                <button 
                                                    type="button" 
                                                    onClick={() => setFormData(prev => ({...prev, imageUrl1: ''}))}
                                                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg"
                                                    title="Remove Image"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="grid grid-cols-2 gap-4 mb-3">
                                                    <button type="button" onClick={() => galleryInputRef1.current?.click()} disabled={isUploading} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 hover:border-purple-400 transition text-sm disabled:opacity-50 flex flex-col items-center gap-1">
                                                        <span className="text-2xl">🖼️</span> गैलरी
                                                    </button>
                                                    <button type="button" onClick={() => cameraInputRef1.current?.click()} disabled={isUploading} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 hover:border-purple-400 transition text-sm disabled:opacity-50 flex flex-col items-center gap-1">
                                                        <span className="text-2xl">📷</span> कैमरा
                                                    </button>
                                                </div>
                                                <input name="imageUrl1" value={formData.imageUrl1} onChange={handleInputChange} placeholder="या छवि URL पेस्ट करें" required className="w-full bg-black/20 text-xs text-gray-300 p-3 rounded border border-white/10 focus:border-purple-400 transition focus:text-white" />
                                            </>
                                        )}
                                    </div>

                                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                        <label className="block text-purple-200 text-sm mb-3 font-semibold">उत्पाद छवि 2 (Product Image 2)</label>
                                        <input type="file" accept="image/*" ref={galleryInputRef2} onChange={(e) => handleImageUpload(e, 'imageUrl2')} className="hidden" />
                                        <input type="file" accept="image/*" capture="environment" ref={cameraInputRef2} onChange={(e) => handleImageUpload(e, 'imageUrl2')} className="hidden" />
                                        
                                        {formData.imageUrl2 ? (
                                            <div className="relative group">
                                                <img src={formData.imageUrl2} alt="पूर्वावलोकन 2" className="w-full h-48 object-contain bg-black/40 rounded-lg border border-white/20 mb-2" />
                                                <div className="flex gap-2">
                                                    <input readOnly value={formData.imageUrl2} className="w-full bg-black/20 text-xs text-gray-300 p-2 rounded border border-white/10" />
                                                    <button type="button" onClick={() => handleCopyLink(formData.imageUrl2)} className="bg-blue-600 px-2 rounded text-xs text-white">Copy</button>
                                                </div>
                                                <button 
                                                    type="button" 
                                                    onClick={() => setFormData(prev => ({...prev, imageUrl2: ''}))}
                                                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg"
                                                    title="Remove Image"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="grid grid-cols-2 gap-4 mb-3">
                                                    <button type="button" onClick={() => galleryInputRef2.current?.click()} disabled={isUploading} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 hover:border-purple-400 transition text-sm disabled:opacity-50 flex flex-col items-center gap-1">
                                                        <span className="text-2xl">🖼️</span> गैलरी
                                                    </button>
                                                    <button type="button" onClick={() => cameraInputRef2.current?.click()} disabled={isUploading} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 hover:border-purple-400 transition text-sm disabled:opacity-50 flex flex-col items-center gap-1">
                                                        <span className="text-2xl">📷</span> कैमरा
                                                    </button>
                                                </div>
                                                <input name="imageUrl2" value={formData.imageUrl2} onChange={handleInputChange} placeholder="या छवि URL पेस्ट करें" className="w-full bg-black/20 text-xs text-gray-300 p-3 rounded border border-white/10 focus:border-purple-400 transition focus:text-white" />
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <select name="category" value={formData.category} onChange={handleInputChange} className="w-full bg-white/10 p-3 rounded-lg border border-white/20">
                                    <option value="Pujan Samagri">Pujan Samagri</option>
                                    <option value="Tantra Mantra Yantra E-book">Tantra Mantra Yantra E-book</option>
                                    <option value="Gems & Jewelry">Gems & Jewelry</option>
                                    <option value="Mobile Accessories">Mobile Accessories</option>
                                    <option value="Shoes">Shoes</option>
                                    <option value="Accessories">Accessories</option>
                                </select>
                                <select name="productType" value={formData.productType} onChange={handleInputChange} className="w-full bg-white/10 p-3 rounded-lg border border-white/20">
                                    <option value="PHYSICAL">PHYSICAL</option>
                                    <option value="DIGITAL">DIGITAL</option>
                                </select>
                                {formData.productType === 'PHYSICAL' ? (
                                    <input name="colors" value={formData.colors.join(', ')} onChange={handleInputChange} placeholder="रंग (अल्पविराम से अलग)" className="w-full bg-white/10 p-3 rounded-lg border border-white/20" />
                                ) : (
                                    <input name="googleDriveLink" value={formData.googleDriveLink || ''} onChange={handleInputChange} placeholder="Google Drive Link" required className="w-full bg-white/10 p-3 rounded-lg border border-white/20" />
                                )}
                                 <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                    <label className="block text-purple-200 text-sm mb-3 font-semibold">उत्पाद समीक्षा वीडियो (9:16)</label>
                                    <input type="file" accept="video/*" ref={videoGalleryInputRef} onChange={handleVideoUpload} className="hidden" />
                                    <input type="file" accept="video/*" capture="environment" ref={videoCameraInputRef} onChange={handleVideoUpload} className="hidden" />
                                    
                                    {formData.reviewVideoUrl ? (
                                        <div className="relative group">
                                            <video src={formData.reviewVideoUrl} controls className="w-full h-64 object-contain bg-black rounded-lg border border-white/20 mb-2" />
                                            <div className="flex gap-2">
                                                <input readOnly value={formData.reviewVideoUrl} className="w-full bg-black/20 text-xs text-gray-300 p-2 rounded border border-white/10" />
                                                <button type="button" onClick={() => handleCopyLink(formData.reviewVideoUrl!)} className="bg-blue-600 px-2 rounded text-xs text-white">Copy</button>
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={() => setFormData(prev => ({...prev, reviewVideoUrl: ''}))}
                                                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg z-10"
                                                title="Remove Video"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="grid grid-cols-2 gap-4 mb-3">
                                                <button type="button" onClick={() => videoGalleryInputRef.current?.click()} disabled={isUploading} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 hover:border-purple-400 transition text-sm disabled:opacity-50 flex flex-col items-center gap-1">
                                                    <span className="text-2xl">🎬</span> गैलरी
                                                </button>
                                                <button type="button" onClick={() => videoCameraInputRef.current?.click()} disabled={isUploading} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 hover:border-purple-400 transition text-sm disabled:opacity-50 flex flex-col items-center gap-1">
                                                    <span className="text-2xl">🎥</span> कैमरा
                                                </button>
                                            </div>
                                            <input name="reviewVideoUrl" value={formData.reviewVideoUrl || ''} onChange={handleInputChange} placeholder="या वीडियो URL पेस्ट करें" className="w-full bg-black/20 text-xs text-gray-300 p-3 rounded border border-white/10 focus:border-purple-400 transition focus:text-white" />
                                        </>
                                    )}
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button type="submit" disabled={isUploading} className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-transform disabled:opacity-60">
                                        {isUploading ? 'अपलोड हो रहा है...' : (editingProduct ? 'अपडेट करें' : 'जोड़ें')}
                                    </button>
                                    {editingProduct && <button type="button" onClick={handleCancelEdit} className="w-full px-6 py-3 bg-white/10 text-purple-200 border border-white/20 rounded-full font-bold">रद्द करें</button>}
                                </div>
                            </div>
                        </form>
                    </Card>

                    <Card>
                        <h2 className="text-3xl font-hindi font-bold mb-6 text-center">मौजूदा उत्पाद</h2>
                        <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-2">
                            {products.map(p => (
                                <div key={p.id} className="flex items-center gap-4 bg-white/5 p-3 rounded-lg">
                                    <img src={p.imageUrl1} alt={p.name} className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
                                    <div className="flex-grow">
                                        <p className="font-bold text-white">{p.name}</p>
                                        <p className="text-sm text-purple-300">{p.category} - {p.productType}</p>
                                    </div>
                                    <div className="flex-shrink-0 flex gap-2">
                                        <button onClick={() => setEditingProduct(p)} className="px-4 py-2 bg-blue-600/50 text-white text-sm rounded-full hover:bg-blue-600 transition">संपादित करें</button>
                                        <button onClick={() => handleDelete(p.id)} className="px-4 py-2 bg-red-600/50 text-white text-sm rounded-full hover:bg-red-600 transition">हटाएं</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </>
            )}
        </div>
    );
};

export default AdminPanel;