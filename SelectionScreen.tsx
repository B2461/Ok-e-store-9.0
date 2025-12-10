


import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DivinationType, Product } from '../types';
import ToolShowcaseSlider from './ToolShowcaseSlider';
import { useAppContext } from '../App';
import ProductShowcaseSlider from './ProductShowcaseSlider';
import TrendingVideoCollection from './TrendingVideoCollection';
import { toolCategories } from '../data/tools';

interface SelectionScreenProps {
    onSelect: (type: DivinationType) => void;
    isPremiumActive: boolean;
    products: Product[];
    categoryVisibility: Record<string, boolean>;
}

const SelectionScreen: React.FC<SelectionScreenProps> = ({ onSelect, isPremiumActive, products, categoryVisibility }) => {
    const { tDiv, t } = useAppContext();

    // Helper to check if a category is visible (defaults to true if not set)
    const isVisible = (key: string) => categoryVisibility[key] !== false;

    // -- Split products into distinct categories --
    
    // Priority 1: E-books
    const ebookProducts = useMemo(() => 
        products.filter(p => p.category === 'Tantra Mantra Yantra E-book'),
    [products]);

    // Other Spiritual
    const pujanProducts = useMemo(() => 
        products.filter(p => p.category === 'Pujan Samagri'),
    [products]);

    const gemsProducts = useMemo(() => 
        products.filter(p => p.category === 'Gems & Jewelry'),
    [products]);

    // Shopping Categories
    const mobileProducts = useMemo(() => 
        products.filter(p => p.category === 'Mobile Accessories'),
    [products]);

    const shoesProducts = useMemo(() => 
        products.filter(p => p.category === 'Shoes'),
    [products]);

    const accessoriesProducts = useMemo(() => 
        products.filter(p => p.category === 'Accessories'),
    [products]);

    const categoryGridItems = [
        { 
            id: 'product_pujan', 
            titleEn: 'WORSHIP ITEMS', 
            titleHi: 'पूजन सामग्री', 
            icon: '🛍️', 
            link: '/store/pujan-samagri' 
        },
        { 
            id: 'product_ebooks', 
            titleEn: 'TANTRA MANTRA YANTRA PDF E-BOOK', 
            titleHi: 'तंत्र मंत्र यन्त्र PDF E-book', 
            icon: '📚', 
            link: '/store/ebooks' 
        },
        { 
            id: 'product_gems', 
            titleEn: 'GEMS & JEWELRY', 
            titleHi: 'रत्न आभूषण', 
            icon: '💎', 
            link: '/store/gems-jewelry' 
        },
        { 
            id: 'product_mobile', 
            titleEn: 'MOBILE ACCESSORIES', 
            titleHi: 'मोबाइल एक्सेसरीज', 
            icon: '📱', 
            link: '/store/mobile-accessories' 
        },
        { 
            id: 'product_shoes', 
            titleEn: 'LADIES, GENTS & BABY SHOES', 
            titleHi: 'लेडीज जेंट्स एंड बेबी शूज', 
            icon: '👟', 
            link: '/store/shoes' 
        },
        { 
            id: 'product_accessories', 
            titleEn: 'LADIES & GENTS ACCESSORIES', 
            titleHi: 'लेडीज एंड जेंट्स पर्स बैग बेल्ट चाबी का गुच्छा', 
            icon: '👜', 
            link: '/store/accessories' 
        }
    ];

    return (
        <div className="text-center animate-fade-in w-full mt-4">
            <ToolShowcaseSlider onSelect={onSelect} />

            {/* Main Category Grid - Dark Theme */}
            <div className="max-w-6xl mx-auto px-4 mb-6">
                <h2 className="text-2xl font-hindi font-bold text-purple-300 text-left mb-6 ml-1">मुख्य श्रेणियाँ</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {categoryGridItems.map(cat => (
                        isVisible(cat.id) && (
                            <Link key={cat.id} to={cat.link} className="block group">
                                <div className="h-full flex flex-col items-center justify-center p-6 bg-[#1c1c1e] border border-white/10 rounded-2xl transition-all duration-300 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-900/20 active:bg-amber-500/20 active:border-amber-400 active:shadow-[0_0_20px_rgba(251,191,36,0.3)] aspect-[4/5] md:aspect-[3/4]">
                                    <div className="flex-grow flex items-center justify-center">
                                        <span className="text-5xl sm:text-6xl transform group-hover:scale-110 transition-transform duration-300 icon-glow-saffron">{cat.icon}</span>
                                    </div>
                                    <div className="mt-4 text-center">
                                        <span className="block text-xs sm:text-sm font-bold text-white tracking-wider mb-1 uppercase">{cat.titleEn}</span>
                                        <span className="block text-[10px] sm:text-xs text-gray-400 font-hindi">{cat.titleHi}</span>
                                    </div>
                                </div>
                            </Link>
                        )
                    ))}
                </div>
            </div>

            {/* Trending Video Collection Section */}
            <TrendingVideoCollection products={products} />

            <div className="space-y-12 mb-12">
                {/* 1. E-books (Priority) */}
                {isVisible('product_ebooks') && (
                    <ProductShowcaseSlider
                        title={tDiv(DivinationType.TANTRA_MANTRA_YANTRA_EBOOK).hi}
                        products={ebookProducts}
                        viewAllLink="/store/ebooks"
                    />
                )}

                {/* 2. Mobile Accessories (Moved here as requested) */}
                {isVisible('product_mobile') && (
                    <ProductShowcaseSlider
                        title={tDiv(DivinationType.MOBILE_ACCESSORIES).hi}
                        products={mobileProducts}
                        viewAllLink="/store/mobile-accessories"
                    />
                )}

                {/* 3. Pujan Samagri */}
                {isVisible('product_pujan') && (
                    <ProductShowcaseSlider
                        title={tDiv(DivinationType.PUJAN_SAMAGRI).hi}
                        products={pujanProducts}
                        viewAllLink="/store/pujan-samagri"
                    />
                )}

                {/* 4. Gems & Jewelry */}
                {isVisible('product_gems') && (
                    <ProductShowcaseSlider
                        title={tDiv(DivinationType.GEMS_JEWELRY).hi}
                        products={gemsProducts}
                        viewAllLink="/store/gems-jewelry"
                    />
                )}

                {/* 5. Shoes */}
                {isVisible('product_shoes') && (
                    <ProductShowcaseSlider
                        title={tDiv(DivinationType.LADIES_GENTS_BABY_SHOES).hi}
                        products={shoesProducts}
                        viewAllLink="/store/shoes"
                    />
                )}

                {/* 6. Accessories */}
                {isVisible('product_accessories') && (
                    <ProductShowcaseSlider
                        title={tDiv(DivinationType.LADIES_GENTS_ACCESSORIES).hi}
                        products={accessoriesProducts}
                        viewAllLink="/store/accessories"
                    />
                )}
            </div>
        </div>
    );
};

export default SelectionScreen;