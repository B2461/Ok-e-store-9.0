
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
        name: 'astrology_tools',
        tools: [
            { type: DivinationType.PALMISTRY, icon: '✋' },
            { type: DivinationType.ASTROLOGY, icon: '✨' },
            { type: DivinationType.NUMEROLOGY, icon: '1️⃣' },
            { type: DivinationType.TAROT, icon: '🃏' },
            { type: DivinationType.HOROSCOPE, icon: '📅' },
            { type: DivinationType.DAILY_HOROSCOPE, icon: '☀️' },
            { type: DivinationType.DAILY_FORTUNE_CARD, icon: '🥠' },
            { type: DivinationType.DREAM, icon: '🌙' },
            { type: DivinationType.MOLE, icon: '⚫' },
            { type: DivinationType.LOVE_RELATIONSHIP, icon: '💖' },
            { type: DivinationType.MARRIAGE_COMPATIBILITY, icon: '💍' },
            { type: DivinationType.LOVE_COMPATIBILITY, icon: '💕' },
            { type: DivinationType.JANAM_KUNDLI, icon: '📜' },
            { type: DivinationType.ANG_SPHURAN, icon: '⚡' },
            { type: DivinationType.SNEEZING, icon: '🤧' },
            { type: DivinationType.BUSINESS_ASTROLOGY, icon: '💼' },
            { type: DivinationType.PRASHNA_PARIKSHA, icon: '❓' },
            { type: DivinationType.PRASHNA_CHAKRA, icon: '☸️' },
            { type: DivinationType.VASTU_SHASTRA, icon: '🏡' },
        ]
    },
    {
        name: 'ai_tools',
        tools: [
            { type: DivinationType.LIVE_ASTROLOGER, icon: '🎙️', isPremium: true },
            { type: DivinationType.AI_FACE_READING, icon: '👤', isPremium: true },
            { type: DivinationType.AI_TIME_MACHINE, icon: '⏳', isPremium: true },
            { type: DivinationType.AI_FUTURE_GENERATOR, icon: '🧠', isPremium: true },
            { type: DivinationType.FUTURE_STORY, icon: '📖', isPremium: true },
            { type: DivinationType.SCAN_TRANSLATE, icon: '📷', isPremium: true },
            { type: DivinationType.TEXT_TO_IMAGE, icon: '🎨', isPremium: true },
            { type: DivinationType.STORY_TO_IMAGES, icon: '🖼️', isPremium: true },
            { type: DivinationType.TEXT_TO_VOICE, icon: '🔊', isPremium: true },
            { type: DivinationType.STORY_TO_VIDEO, icon: '🎬', isPremium: true },
            { type: DivinationType.IMAGE_TO_VIDEO, icon: '🎞️', isPremium: true },
            { type: DivinationType.ENGLISH_GURU, icon: '👨‍🏫', isPremium: true },
            { type: DivinationType.PRODUCT_SCANNER, icon: '📦', isPremium: true },
            { type: DivinationType.OBJECT_COUNTER, icon: '🧐', isPremium: true },
            { type: DivinationType.AI_CALCULATOR, icon: '🧮', isPremium: true },
        ]
    },
    {
        name: 'lifestyle_info',
        tools: [
            { type: DivinationType.TIME_MANAGEMENT, icon: '⏱️' },
            { type: DivinationType.SEASONAL_FOOD, icon: '🥗' },
            { type: DivinationType.FOOD_COMBINATION, icon: '🍲' },
            { type: DivinationType.RELIGIOUS_RITUALS, icon: '🕉️' },
            { type: DivinationType.PILGRIMAGE, icon: '🙏' },
            { type: DivinationType.YOGA_GUIDE_HINDI, icon: '🧘' },
        ]
    },
    {
        name: 'travel_location',
        tools: [
            { type: DivinationType.TRAVEL, icon: '✈️' },
            { type: DivinationType.TRAIN_JOURNEY, icon: '🚂' },
            { type: DivinationType.DISHA_SHOOL, icon: '🧭' },
            { type: DivinationType.FAMOUS_PLACE_TRAVEL, icon: '🗺️' },
            { type: DivinationType.LOCAL_EXPERTS, icon: '📍' },
            { type: DivinationType.ROUTE_PLANNER, icon: '🗺️' },
        ]
    },
    {
        name: 'developer_tools',
        tools: [
            { type: DivinationType.CODE_INSPECTOR, icon: '💻' },
            { type: DivinationType.HTML_GENERATOR, icon: '🌐' },
        ]
    },
    {
        name: 'admin_tools',
        tools: [
            { type: DivinationType.ADMIN_PANEL, icon: '⚙️' },
        ]
    }
];
