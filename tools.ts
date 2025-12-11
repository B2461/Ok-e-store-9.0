
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
        name: 'Shopping Store',
        tools: [
            { type: DivinationType.PUJAN_SAMAGRI, icon: '🛍️' },
            { type: DivinationType.TANTRA_MANTRA_YANTRA_EBOOK, icon: '📚' },
            { type: DivinationType.GEMS_JEWELRY, icon: '💎' },
            { type: DivinationType.MOBILE_ACCESSORIES, icon: '📱' },
            { type: DivinationType.LADIES_GENTS_BABY_SHOES, icon: '👟' },
            { type: DivinationType.LADIES_GENTS_ACCESSORIES, icon: '👜' },
        ]
    },
    {
        name: 'Admin',
        tools: [
            { type: DivinationType.ADMIN_PANEL, icon: '⚙️' },
        ]
    }
];
