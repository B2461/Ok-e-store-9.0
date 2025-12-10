


import React, { useRef, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import Card from './Card';
import { useAppContext } from '../App';

interface TrendingVideoCollectionProps {
    products: Product[];
}

const VideoProductCard: React.FC<{ product: Product; isNew?: boolean }> = ({ product, isNew }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const { wishlist, toggleWishlist } = useAppContext();
    const isLiked = wishlist.includes(product.id);

    const handleMouseEnter = () => {
        if (videoRef.current) {
            videoRef.current.play().catch(e => console.log("Auto-play prevented", e));
            setIsPlaying(true);
        }
    };

    const handleMouseLeave = () => {
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
            setIsPlaying(false);
        }
    };

    return (
        <div className="flex-none w-48 sm:w-56 relative group">
            <Card className="p-0 h-full overflow-hidden border-pink-500/30 !bg-gray-900 icon-glow-saffron active:!bg-amber-500/20 active:!border-amber-400 active:shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-all duration-300">
                <div 
                    className="relative aspect-[9/16] w-full bg-black"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    {isNew && (
                        <div className="absolute top-2 left-2 z-20 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded animate-pulse shadow-lg border border-white/20">
                            NEW UPDATE
                        </div>
                    )}
                    <Link to={`/product/${product.id}`} className="block w-full h-full">
                        <video
                            ref={videoRef}
                            src={product.reviewVideoUrl}
                            poster={product.imageUrl1}
                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                            muted
                            loop
                            playsInline
                        />
                        {/* Play Icon Overlay (hidden when playing) */}
                        {!isPlaying && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border border-white/30">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                            </div>
                        )}
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20 pointer-events-none"></div>
                    </Link>

                    {/* Like Button */}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            toggleWishlist(product.id);
                        }}
                        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/40 backdrop-blur-md hover:bg-pink-600/80 transition-all"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-colors ${isLiked ? 'text-pink-500 fill-pink-500' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isLiked ? 0 : 2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </button>
                </div>

                {/* Product Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-3 pointer-events-none">
                    <h3 className="text-white font-hindi font-bold text-sm truncate shadow-black drop-shadow-md">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-pink-400 font-bold text-lg drop-shadow-md">₹{(product.mrp - (product.mrp * product.discountPercentage / 100)).toFixed(0)}</span>
                        <span className="text-gray-400 text-xs line-through drop-shadow-md">₹{product.mrp}</span>
                    </div>
                </div>
            </Card>
        </div>
    );
};

const TrendingVideoCollection: React.FC<TrendingVideoCollectionProps> = ({ products }) => {
    // Filter products that have a video URL and REVERSE array to show newest additions first
    const videoProducts = useMemo(() => {
        return products
            .filter(p => p.reviewVideoUrl && p.reviewVideoUrl.trim() !== '')
            .reverse();
    }, [products]);

    if (videoProducts.length === 0) return null;

    return (
        <div className="w-full mb-12 animate-fade-in mt-4">
            <div className="flex items-center gap-3 mb-6 px-4">
                <div className="bg-red-600 p-2 rounded-lg animate-pulse icon-glow-saffron">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z"/>
                    </svg>
                </div>
                <h2 className="text-xl md:text-2xl font-hindi font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-500">
                    Trending Collection Mix Category Video Product
                </h2>
            </div>

            <div className="flex overflow-x-auto gap-4 pb-6 px-4 category-tabs scroll-smooth" style={{ scrollSnapType: 'x mandatory' }}>
                {videoProducts.map((product, index) => (
                    <div key={product.id} style={{ scrollSnapAlign: 'start' }}>
                        {/* Pass isNew prop to first few items to highlight them */}
                        <VideoProductCard product={product} isNew={index < 3} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TrendingVideoCollection;