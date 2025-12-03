
import React, { useMemo } from 'react';
import { DivinationType, Product } from '../types';
import { toolCategories } from '../data/tools';
import ToolShowcaseSlider from './ToolShowcaseSlider';
import { useAppContext } from '../App';
import ProductShowcaseSlider from './ProductShowcaseSlider';

interface SelectionScreenProps {
    onSelect: (type: DivinationType) => void;
    isPremiumActive: boolean;
    products: Product[];
    categoryVisibility: Record<string, boolean>;
}

const SelectionScreen: React.FC<SelectionScreenProps> = ({ onSelect, isPremiumActive, products, categoryVisibility }) => {
    const { t, tDiv } = useAppContext();

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


    const visibleToolCategories = useMemo(() =>
        toolCategories.filter(category => categoryVisibility[category.name] ?? true),
        [categoryVisibility]
    );

    return (
        <div className="text-center animate-fade-in w-full">
            <ToolShowcaseSlider onSelect={onSelect} />

            <section className="mt-12">
                <h2 className="text-2xl md:text-3xl font-hindi font-bold text-purple-300 border-b-2 border-purple-500/20 pb-3 mb-6 text-left">
                    मुख्य श्रेणियाँ
                </h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 md:gap-6">
                    {visibleToolCategories.flatMap(category => category.tools).map((option) => {
                        const isLocked = option.isPremium && !isPremiumActive;
                        const toolName = tDiv(option.type);
                        return (
                        <button
                            key={option.type}
                            onClick={() => onSelect(option.type)}
                            className={`group relative flex flex-col items-center justify-start gap-3 p-2 sm:p-3 bg-white/5 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 text-center transform transition-all duration-300 ${isLocked ? 'cursor-pointer' : 'hover:bg-purple-500/20 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/30'}`}
                            aria-label={`${toolName.en} ${isLocked ? '(Locked)' : ''}`}
                        >
                            {option.isPremium && (
                                <div className="absolute top-1 right-1 text-xl z-10" title="प्रीमियम टूल">
                                    <span className={!isLocked ? 'icon-glow drop-shadow-[0_2px_2px_rgba(0,0,0,1)]' : 'opacity-70'}>💎</span>
                                </div>
                            )}
                            {isLocked && (
                                <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center z-20">
                                    <span className="text-3xl" role="img" aria-label="Locked">🔒</span>
                                </div>
                            )}
                            <div className={`w-full aspect-square rounded-xl overflow-hidden shadow-md bg-gradient-radial from-purple-800 via-slate-900 to-black flex items-center justify-center ${isLocked ? 'grayscale' : ''}`}>
                            <span
                                    className={`text-4xl sm:text-5xl text-white transition-transform duration-300 ${isLocked ? '' : 'group-hover:scale-125'}`}
                            >
                                {option.icon}
                            </span>
                            </div>
                            <div className={`text-center leading-tight h-12 flex flex-col items-center justify-center p-1 ${isLocked ? 'text-gray-400' : 'text-white'}`}>
                                <span className="font-sans font-semibold text-white text-[11px] sm:text-xs leading-tight">{toolName.en}</span>
                                <span className="font-hindi text-purple-200/90 text-[11px] sm:text-xs leading-tight">{toolName.hi}</span>
                            </div>
                        </button>
                        );
                    })}
                </div>
            </section>

            <div className="space-y-12 mt-12">
                {/* 1. E-books (Priority) */}
                <ProductShowcaseSlider
                    title={tDiv(DivinationType.TANTRA_MANTRA_YANTRA_EBOOK).hi}
                    products={ebookProducts}
                    viewAllLink="/store/ebooks"
                />

                {/* 2. Pujan Samagri */}
                <ProductShowcaseSlider
                    title={tDiv(DivinationType.PUJAN_SAMAGRI).hi}
                    products={pujanProducts}
                    viewAllLink="/store/pujan-samagri"
                />

                {/* 3. Gems & Jewelry */}
                <ProductShowcaseSlider
                    title={tDiv(DivinationType.GEMS_JEWELRY).hi}
                    products={gemsProducts}
                    viewAllLink="/store/gems-jewelry"
                />

                {/* 4. Mobile Accessories */}
                <ProductShowcaseSlider
                    title={tDiv(DivinationType.MOBILE_ACCESSORIES).hi}
                    products={mobileProducts}
                    viewAllLink="/store/mobile-accessories"
                />

                {/* 5. Shoes */}
                <ProductShowcaseSlider
                    title={tDiv(DivinationType.LADIES_GENTS_BABY_SHOES).hi}
                    products={shoesProducts}
                    viewAllLink="/store/shoes"
                />

                {/* 6. Accessories */}
                <ProductShowcaseSlider
                    title={tDiv(DivinationType.LADIES_GENTS_ACCESSORIES).hi}
                    products={accessoriesProducts}
                    viewAllLink="/store/accessories"
                />
            </div>
        </div>
    );
};

export default SelectionScreen;
