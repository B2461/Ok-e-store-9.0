import { DivinationType } from '../types';

export interface Tool {
    type: DivinationType;
    icon: string;
    isPremium?: boolean;
}

export interface ToolCategory {
    name: string;
    tools: Tool[];
}

export const toolCategories: ToolCategory[] = [
    {
        name: 'spiritual_store',
        tools: [
            { type: DivinationType.PUJAN_SAMAGRI, icon: '🛍️' },
            { type: DivinationType.TANTRA_MANTRA_YANTRA_EBOOK, icon: '📚' },
            { type: DivinationType.GEMS_JEWELRY, icon: '💎' },
        ]
    },
    {
        name: 'shopping',
        tools: [
            { type: DivinationType.MOBILE_ACCESSORIES, icon: '📱' },
            { type: DivinationType.LADIES_GENTS_BABY_SHOES, icon: '👟' },
            { type: DivinationType.LADIES_GENTS_ACCESSORIES, icon: '👜' },
        ]
    },
    {
        name: 'admin_tools',
        tools: [
        ]
    }
];
