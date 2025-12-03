import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import Card from './Card';

// Reusable Product Card component for the showcase
const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
    const discountedPrice = product.mrp - (product.mrp * product.discountPercentage / 100);

    return (
        <Link to={`/product/${product.id}`} className="group block flex-none w-40 sm:w-48">
            <Card className="p-3 h-full flex flex-col justify-between !bg-white/5 hover:!bg-purple-500/10 transition-all duration-300">
                <div className="overflow-hidden rounded-lg mb-3">
                    <img
                        src={product.imageUrl1}
                        alt={product.name}
                        className="w-full h-28 sm:h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                </div>
                <div>
                    <h3 className="text-sm font-hindi font-bold text-white truncate">{product.name}</h3>
                    <div className="flex items-baseline gap-2 mt-1">
                        <p className="text-lg font-bold text-pink-400">₹{discountedPrice.toFixed(0)}</p>
                        {product.discountPercentage > 0 && (
                            <p className="text-xs text-purple-300 line-through">₹{product.mrp.toFixed(0)}</p>
                        )}
                    </div>
                </div>
            </Card>
        </Link>
    );
};

interface ProductShowcaseSliderProps {
    title: string;
    products: Product[];
    viewAllLink: string;
}

const ProductShowcaseSlider: React.FC<ProductShowcaseSliderProps> = ({ title, products, viewAllLink }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const intervalRef = useRef<number | null>(null);
    const [isHovering, setIsHovering] = useState(false);

    const scroll = (scrollOffset: number) => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: scrollOffset, behavior: 'smooth' });
        }
    };

    const startAutoScroll = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = window.setInterval(() => {
            if (scrollContainerRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
                if (scrollLeft + clientWidth >= scrollWidth - 10) { // Add tolerance
                    scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    scroll(clientWidth / 2);
                }
            }
        }, 4000);
    };

    const stopAutoScroll = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    useEffect(() => {
        if (!isHovering) {
            startAutoScroll();
        } else {
            stopAutoScroll();
        }
        return () => stopAutoScroll();
    }, [isHovering, products]); // re-trigger if products change

    if (products.length === 0) return null;

    return (
        <div
            className="text-left relative group"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl md:text-3xl font-hindi font-bold text-purple-300 border-b-2 border-purple-500/20 pb-3">
                    {title}
                </h3>
                <Link to={viewAllLink} className="text-purple-300 hover:text-white transition font-semibold">
                    सभी देखें &rarr;
                </Link>
            </div>
            <div className="relative">
                <div ref={scrollContainerRef} className="flex overflow-x-auto space-x-4 pb-4 category-tabs -mx-4 px-4" style={{ scrollSnapType: 'x mandatory' }}>
                    {products.map(product => (
                        <div key={product.id} style={{ scrollSnapAlign: 'start' }}>
                             <ProductCard product={product} />
                        </div>
                    ))}
                </div>
                <button
                    onClick={() => scroll(-300)}
                    className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-slate-800/50 backdrop-blur-sm text-white w-10 h-10 rounded-full hover:bg-purple-500/50 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 z-10 flex items-center justify-center shadow-lg"
                    aria-label="Scroll left"
                >
                    &lt;
                </button>
                <button
                    onClick={() => scroll(300)}
                    className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-slate-800/50 backdrop-blur-sm text-white w-10 h-10 rounded-full hover:bg-purple-500/50 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 z-10 flex items-center justify-center shadow-lg"
                    aria-label="Scroll right"
                >
                    &gt;
                </button>
            </div>
        </div>
    );
};

export default ProductShowcaseSlider;