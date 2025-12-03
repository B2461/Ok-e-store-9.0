import React, { useState, useMemo, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Product, ProductCategory } from '../types';
import Card from './Card';

interface PujanSamagriStoreProps {
    products: Product[];
}

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
    const discountedPrice = product.mrp - (product.mrp * product.discountPercentage / 100);

    return (
        <Link to={`/product/${product.id}`} className="group block">
            <Card className="p-4 h-full flex flex-col justify-between !bg-white/5 hover:!bg-purple-500/10 transition-all duration-300">
                <div className="overflow-hidden rounded-lg mb-4">
                    <img 
                        src={product.imageUrl1} 
                        alt={product.name} 
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                </div>
                <div>
                    <h3 className="text-lg font-hindi font-bold text-white truncate">{product.name}</h3>
                    <div className="flex items-center gap-3 mt-2">
                        <p className="text-xl font-bold text-pink-400">₹{discountedPrice.toFixed(2)}</p>
                        {product.discountPercentage > 0 && (
                            <p className="text-md text-purple-300 line-through">₹{product.mrp.toFixed(2)}</p>
                        )}
                    </div>
                </div>
            </Card>
        </Link>
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