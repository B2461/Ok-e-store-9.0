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
            <Card className="p-4 h-full flex flex-col justify-between !bg-white/5 hover:!bg-purple-500/10 transition-all duration-300">
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
    const isShoppingView = !!(currentMappedCategory && (shoppingCategoryUrlMap as Record<string, string>)[categoryUrl!]);
    
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
    }, [categoryUrl]);
    
    const filteredProducts = useMemo(() => {
        const productPool: ProductCategory[] = isShoppingView 
            ? Object.values(shoppingCategoryUrlMap) 
            : Object.values(spiritualCategoryUrlMap);

        if (selectedCategory === 'All') {
            return products.filter(p => productPool.includes(p.category));
        }
        return products.filter(p => p.category === selectedCategory);
    }, [products, selectedCategory, isShoppingView]);

    return (
        <div className="animate-fade-in">
            <h2 className="text-4xl font-hindi font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-8">
                {title}
            </h2>
            <div className="flex justify-center gap-2 md:gap-4 mb-8 flex-wrap">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat as 'All' | ProductCategory)}
                        className={`px-4 py-2 text-sm md:px-5 md:text-base rounded-full font-semibold transition-all duration-300 ${
                            selectedCategory === cat
                                ? 'bg-purple-600 text-white shadow-lg'
                                : 'bg-white/10 text-purple-200 hover:bg-white/20'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
};

export default PujanSamagriStore;