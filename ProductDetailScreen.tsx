
import React, { useState, useEffect, FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Product } from '../types';
import Card from './Card';
import { useAppContext } from '../App';

// Dummy comments for display
const dummyComments = [
    { author: 'रमेश', text: 'यह उत्पाद बहुत सुंदर है! मुझे यह पसंद आया।' },
    { author: 'सुनीता', text: 'उत्कृष्ट गुणवत्ता और पैकेजिंग। धन्यवाद!' }
];


interface ProductDetailScreenProps {
    products: Product[];
    addToCart: (product: Product, quantity: number, color: string, size?: string) => void;
}

const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({ products, addToCart }) => {
    const { productId } = useParams<{ productId: string }>();
    const { t } = useAppContext();
    const [quantity, setQuantity] = useState(1);
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [addedToCart, setAddedToCart] = useState(false);
    const [activeMedia, setActiveMedia] = useState<'image1' | 'image2' | 'video'>('image1');
    const [error, setError] = useState<string | null>(null);
    const [showFullScreen, setShowFullScreen] = useState(false);

    // New state for social features
    const [isLiked, setIsLiked] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<{ author: string; text: string }[]>([]);
    const [newComment, setNewComment] = useState('');


    const product = products.find(p => p.id === productId);

    useEffect(() => {
        if (product) {
            // If review video exists, set it as active media by default
            if (product.reviewVideoUrl) {
                setActiveMedia('video');
            } else {
                setActiveMedia('image1');
            }

            if (product.productType === 'PHYSICAL') {
                if (product.colors.length > 0) {
                    setSelectedColor(product.colors[0]);
                }
                if (product.sizes && product.sizes.length > 0) {
                    setSelectedSize(product.sizes[0]);
                }
            }
        }
    }, [product]);

    // Handler for posting a new comment
    const handlePostComment = (e: FormEvent) => {
        e.preventDefault();
        if (newComment.trim()) {
            setComments(prev => [...prev, { author: 'आप', text: newComment.trim() }]);
            setNewComment('');
        }
    };
    
    // Handler for sharing the product
    const handleShare = async () => {
        if (!product) return;
        const shareData = {
            title: product.name,
            text: `${product.name} - ${product.description}`,
            url: window.location.href,
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            }
        } catch (err) {
            console.error('Error sharing product:', err);
             await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
             setIsCopied(true);
             setTimeout(() => setIsCopied(false), 2000);
        }
    };

    if (!product) {
        return (
            <Card className="text-center animate-fade-in">
                <h2 className="text-2xl font-bold text-red-400">उत्पाद नहीं मिला</h2>
                <p className="text-lg mt-4">जिस उत्पाद को आप ढूंढ रहे हैं वह मौजूद नहीं है।</p>
                <Link to="/store" className="mt-8 inline-block px-6 py-2 bg-purple-600 text-white font-bold rounded-full hover:bg-purple-700 transition">स्टोर पर वापस जाएं</Link>
            </Card>
        );
    }
    
    const discountedPrice = product.mrp - (product.mrp * product.discountPercentage / 100);

    const handleAddToCart = () => {
        setError(null);
        if (product.productType === 'PHYSICAL') {
            if (product.colors.length > 0 && !selectedColor) {
                setError('कृपया एक रंग चुनें।');
                return;
            }
            if (product.sizes && product.sizes.length > 0 && !selectedSize) {
                setError('कृपया एक साइज चुनें।');
                return;
            }
        }

        const colorForCart = product.productType === 'PHYSICAL' ? selectedColor : 'Digital';
        addToCart(product, quantity, colorForCart, selectedSize);
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    return (
        <>
            {/* Full Screen Modal for 9:16 viewing */}
            {showFullScreen && (
                <div 
                    className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
                    onClick={() => setShowFullScreen(false)}
                >
                    <button 
                        onClick={() => setShowFullScreen(false)}
                        className="absolute top-4 right-4 text-white text-4xl z-50 hover:text-red-500 transition-colors"
                    >
                        &times;
                    </button>
                    <div 
                        className="relative w-full max-w-sm aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/20"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {activeMedia === 'image1' && (
                            <img src={product.imageUrl1} alt={product.name} className="w-full h-full object-contain" />
                        )}
                        {activeMedia === 'image2' && product.imageUrl2 && (
                            <img src={product.imageUrl2} alt={product.name} className="w-full h-full object-contain" />
                        )}
                        {activeMedia === 'video' && product.reviewVideoUrl && (
                            <video 
                                src={product.reviewVideoUrl} 
                                controls 
                                autoPlay
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>
                </div>
            )}

            <Card className="animate-fade-in">
                 <Link to="/store" className="absolute top-6 left-6 text-purple-300 hover:text-white transition">&larr; स्टोर पर वापस</Link>
                <div className="grid md:grid-cols-2 gap-8 items-start">
                    <div>
                        <div 
                            className="mb-4 cursor-pointer group relative rounded-lg overflow-hidden"
                            onClick={() => setShowFullScreen(true)}
                        >
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors z-10 flex items-center justify-center">
                                <span className="opacity-0 group-hover:opacity-100 text-white font-bold bg-black/50 px-3 py-1 rounded-full text-sm transition-opacity">
                                    फुल स्क्रीन देखें
                                </span>
                            </div>
                            {activeMedia === 'image1' && <img src={product.imageUrl1} alt={product.name} className="w-full h-auto max-h-[500px] object-contain rounded-lg shadow-lg" />}
                            {activeMedia === 'image2' && product.imageUrl2 && <img src={product.imageUrl2} alt={product.name} className="w-full h-auto max-h-[500px] object-contain rounded-lg shadow-lg" />}
                            {activeMedia === 'video' && product.reviewVideoUrl && (
                                <div className="w-full max-w-sm mx-auto bg-black rounded-lg overflow-hidden shadow-lg" style={{ aspectRatio: '9 / 16' }}>
                                    <video 
                                        key={product.reviewVideoUrl}
                                        src={product.reviewVideoUrl} 
                                        controls 
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                        </div>
                        
                        <div className="flex gap-4 justify-center">
                            <button 
                                onClick={() => setActiveMedia('image1')}
                                className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition ${activeMedia === 'image1' ? 'border-pink-400' : 'border-transparent'}`}
                            >
                                <img src={product.imageUrl1} alt="Product thumbnail 1" className="w-full h-full object-cover" />
                            </button>
                            {product.imageUrl2 && (
                                 <button 
                                    onClick={() => setActiveMedia('image2')}
                                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition ${activeMedia === 'image2' ? 'border-pink-400' : 'border-transparent'}`}
                                >
                                    <img src={product.imageUrl2} alt="Product thumbnail 2" className="w-full h-full object-cover" />
                                </button>
                            )}
                            {product.reviewVideoUrl && (
                                <button
                                    onClick={() => setActiveMedia('video')}
                                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition ${activeMedia === 'video' ? 'border-pink-400' : 'border-transparent'} bg-black flex items-center justify-center`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                    <div>
                        <h2 className="text-4xl font-hindi font-bold text-white mb-4">{product.name}</h2>
                        <p className="text-lg text-purple-200 mb-6">{product.description}</p>

                        <div className="mb-6">
                            <div className="flex items-center gap-4">
                                <p className="text-4xl font-bold text-pink-400">₹{discountedPrice.toFixed(2)}</p>
                                {product.discountPercentage > 0 && (
                                    <div>
                                        <p className="text-xl text-purple-300 line-through">₹{product.mrp.toFixed(2)}</p>
                                        <p className="text-sm font-bold text-green-400 bg-green-900/50 px-2 py-1 rounded-md">{product.discountPercentage}% की छूट</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {product.productType === 'DIGITAL' && (
                            <div className="mb-6 p-3 bg-purple-900/50 rounded-lg text-center border border-purple-400/50">
                                <p className="font-bold text-purple-200">यह एक डिजिटल उत्पाद है (PDF E-book)।</p>
                                <p className="text-sm text-purple-300">खरीद के बाद आपको तुरंत डिलीवरी मिल जाएगी।</p>
                            </div>
                        )}
                        
                        {product.productType === 'PHYSICAL' && product.colors.length > 0 && (
                            <div className="mb-6">
                                <label className="block text-purple-200 text-lg mb-2">रंग चुनें</label>
                                <div className="flex gap-3 flex-wrap">
                                    {product.colors.map(color => (
                                        <button 
                                            key={color} 
                                            onClick={() => setSelectedColor(color)}
                                            className={`px-4 py-2 rounded-lg border-2 transition ${selectedColor === color ? 'border-pink-400 bg-pink-900/50' : 'border-purple-400/50'}`}
                                        >
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {product.productType === 'PHYSICAL' && product.sizes && product.sizes.length > 0 && (
                            <div className="mb-6">
                                <label className="block text-purple-200 text-lg mb-2">साइज चुनें</label>
                                <div className="flex gap-3 flex-wrap">
                                    {product.sizes.map(size => (
                                        <button 
                                            key={size} 
                                            onClick={() => setSelectedSize(size)}
                                            className={`px-4 py-2 rounded-lg border-2 transition ${selectedSize === size ? 'border-pink-400 bg-pink-900/50' : 'border-purple-400/50'}`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-4 mb-6">
                            <label className="block text-purple-200 text-lg">मात्रा</label>
                            <input 
                                type="number" 
                                min="1" 
                                value={quantity} 
                                onChange={(e) => setQuantity(parseInt(e.target.value))} 
                                className="w-20 bg-white/10 p-2 text-center rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400"
                            />
                        </div>
                        
                        {error && <p className="text-red-400 mb-4">{error}</p>}

                        <button 
                            onClick={handleAddToCart} 
                            className={`w-full px-8 py-4 font-bold rounded-full shadow-lg text-xl transition-all duration-300 ease-in-out ${addedToCart ? 'bg-green-600' : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105'}`}
                        >
                            {addedToCart ? 'कार्ट में जोड़ा गया!' : 'कार्ट में डालें'}
                        </button>
                    </div>
                </div>

                {/* Social Interaction Section */}
                <div className="mt-8 pt-6 border-t border-white/20">
                    <div className="flex items-center justify-around">
                         <button onClick={() => setIsLiked(!isLiked)} className={`flex flex-col items-center gap-1 text-purple-300 hover:text-white transition-colors duration-200 ${isLiked ? 'like-btn-liked' : ''}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 transition-transform duration-300 ${isLiked ? 'like-animation' : ''}`} viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                            <span className="text-xs font-semibold">पसंद</span>
                        </button>
                         <button onClick={handleShare} className="flex flex-col items-center gap-1 text-purple-300 hover:text-white transition-colors duration-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                              <polyline points="16 6 12 2 8 6"></polyline>
                              <line x1="12" y1="2" x2="12" y2="15"></line>
                            </svg>
                            <span className="text-xs font-semibold">{isCopied ? 'कॉपी हुआ!' : 'साझा करें'}</span>
                        </button>
                         <button onClick={() => setShowComments(!showComments)} className="flex flex-col items-center gap-1 text-purple-300 hover:text-white transition-colors duration-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            <span className="text-xs font-semibold">टिप्पणी</span>
                        </button>
                    </div>

                    {showComments && (
                        <div className="mt-6 pt-6 border-t border-white/20 animate-fade-in">
                            <h4 className="text-xl font-hindi font-bold text-white mb-4 text-left">टिप्पणियाँ</h4>
                            <form onSubmit={handlePostComment} className="flex gap-2 mb-4">
                                <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="अपनी टिप्पणी लिखें..." rows={1} className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition"></textarea>
                                <button type="submit" className="px-4 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition">पोस्ट</button>
                            </form>
                            <div className="space-y-4 max-h-60 overflow-y-auto pr-2 text-left">
                                {comments.map((comment, index) => (
                                    <div key={`user-${index}`} className="bg-white/10 p-3 rounded-lg">
                                        <p className="font-bold text-pink-300 text-sm">{comment.author}</p>
                                        <p className="text-white/90">{comment.text}</p>
                                    </div>
                                ))}
                                {dummyComments.map((comment, index) => (
                                    <div key={`dummy-${index}`} className="bg-white/5 p-3 rounded-lg">
                                        <p className="font-bold text-purple-300 text-sm">{comment.author}</p>
                                        <p className="text-white/80">{comment.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </>
    );
};

export default ProductDetailScreen;
