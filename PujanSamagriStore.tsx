
import React, { useState, useMemo, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Product, ProductCategory } from '../types';
import Card from './Card';
import { useAppContext } from '../App';

interface PujanSamagriStoreProps {
    products: Product[];
}

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
    const discountedPrice = product.mrp - (product.mrp * product.discountPercentage / 100);
    const { wishlist, toggleWishlist } = useAppContext();
    const isLiked = wishlist.includes(product.id);

    return (
        <div className="group block relative">
            <Card className="p-4 h-full flex flex-col justify-between !bg-white/5 hover:!bg-purple-500/10 active:!bg-amber-500/40 active:!border-amber-400 active:shadow-[0_0_20px_rgba(251,191,36,0.5)] transition-all duration-200">
                <div className="relative overflow-hidden rounded-lg mb-4 icon-glow-saffron">
                    <Link to={`/product/${product.id}`}>
                        <img 
                            src={product.imageUrl1} 
                            alt={product.name} 
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    </Link>
                    <button
                        onClick={(e) => {
                            e.preventDefault(); // Prevent navigation
                            toggleWishlist(product.id);
                        }}
                        className="absolute top-2 right-2 z-10 p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all active:scale-95"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-colors ${isLiked ? 'text-pink-500 fill-pink-500' : 'text-white/70'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isLiked ? 0 : 2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </button>
                </div>
                <Link to={`/product/${product.id}`}>
                    <div>
                        <h3 className="text-lg font-hindi font-bold text-white truncate">{product.name}</h3>
                        <div className="flex items-center gap-3 mt-2">
                            <p className="text-xl font-bold text-pink-400">₹{discountedPrice.toFixed(2)}</p>
                            {product.discountPercentage > 0 && (
                                <p className="text-md text-purple-300 line-through">₹{product.mrp.toFixed(2)}</p>
                            )}
                        </div>
                    </div>
                </Link>
            </Card>
        </div>
    );
};

const PujanSamagriStore: React.FC<PujanSamagriStoreProps> = ({ products }) => {
    const { categoryUrl } = useParams<{ categoryUrl: string }>();
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState<'All' | ProductCategory>('All');
    
    const shoppingCategoryUrlMap: Record<string, ProductCategory> = {
        'mobile-accessories': 'Mobile Accessories',
        'shoes': 'Shoes',
        'accessories': 'Accessories',
    };
    const spiritualCategoryUrlMap: Record<string, ProductCategory> = {
        'pujan-samagri': 'Pujan Samagri',
        'ebooks': 'Tantra Mantra Yantra E-book',
        'gems-jewelry': 'Gems & Jewelry',
    };
    const allCategoryUrlMap = { ...shoppingCategoryUrlMap, ...spiritualCategoryUrlMap };

    const currentMappedCategory = categoryUrl ? allCategoryUrlMap[categoryUrl] : undefined;
    
    // Determine if we are in "Shopping" section or "Spiritual" section based on the URL or default
    const isShoppingView = !!(currentMappedCategory && (shoppingCategoryUrlMap as Record<string, string>)[categoryUrl!]) || (categoryUrl === 'shopping');
    
    const title = isShoppingView ? 'शॉपिंग' : 'आध्यात्मिक स्टोर';

    const categories = useMemo(() => {
        return isShoppingView
            ? ['All', ...Object.values(shoppingCategoryUrlMap)]
            : ['All', ...Object.values(spiritualCategoryUrlMap)];
    }, [isShoppingView]);

    useEffect(() => {
        if (currentMappedCategory) {
            setSelectedCategory(currentMappedCategory);
        } else {
            setSelectedCategory('All');
        }
    }, [categoryUrl, currentMappedCategory]);
    
    const filteredProducts = useMemo(() => {
        let productPool: Product[] = [];
        const relevantCategories = isShoppingView ? Object.values(shoppingCategoryUrlMap) : Object.values(spiritualCategoryUrlMap);
        
        productPool = products.filter(p => relevantCategories.includes(p.category));

        if (selectedCategory === 'All') {
            return productPool;
        }
        return productPool.filter(product => product.category === selectedCategory);
    }, [selectedCategory, products, isShoppingView]);

    const handleCategoryClick = (category: string) => {
        setSelectedCategory(category as any);
        // Find URL key for this category to update URL (optional, but good for UX)
        // For simplicity, we just update local state here as the requirement is about the visual box
    };

    return (
        <div className="animate-fade-in w-full pb-20">
            <Link to="/home" className="absolute top-24 left-4 text-purple-300 hover:text-white transition z-10">&larr; होम</Link>
            
            <h2 className="text-3xl font-hindi font-bold mb-6 text-center mt-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                {title}
            </h2>

            {/* Category Filter Buttons - Updated to Yellow Active State */}
            <div className="flex overflow-x-auto gap-3 pb-4 mb-6 px-4 category-tabs justify-start md:justify-center">
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => handleCategoryClick(category)}
                        className={`px-6 py-2 rounded-full whitespace-nowrap transition-all border font-bold ${
                            selectedCategory === category
                                ? 'bg-yellow-400 border-yellow-500 text-black shadow-[0_0_15px_rgba(250,204,21,0.5)] scale-105'
                                : 'bg-white/5 border-white/20 text-purple-200 hover:bg-white/10'
                        }`}
                    >
                        {category === 'All' ? 'सभी' : category}
                    </button>
                ))}
            </div>

            {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-purple-200 text-lg">इस श्रेणी में कोई उत्पाद नहीं मिला।</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-2 sm:px-4">
                    {filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default PujanSamagriStore;
