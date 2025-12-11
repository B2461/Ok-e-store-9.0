
import { DivinationType, UserInput, Reading } from '../types';

export const getApiKey = (): string => {
    return "";
};

export const generatePalmImage = async (): Promise<string> => {
    return "";
};

export const generateSpeech = async (text: string): Promise<string> => {
    return "";
};

export const findLocalExperts = async (query: string): Promise<{name: string, address: string}[]> => {
    return [];
};

export const generateHtmlFromUrl = async (prompt: string): Promise<string> => {
    return "";
};

export const generateReading = async (type: DivinationType, input: UserInput): Promise<Reading> => {
    return {
        past: "Feature Removed",
        present: "This feature has been removed as per request.",
        future: "Please use the store section.",
        cardName: "",
        compatibilityPercentage: 0
    };
};
