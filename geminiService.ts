// Fix: Recreated this file and exported the necessary functions to resolve module and import errors.
import { GoogleGenAI, Modality, Type } from "@google/genai";

// Helper function to get API key from environment
export const getApiKey = (): string => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        // Fallback for development, but in production this should be set
        console.warn("API_KEY environment variable not set.");
        return ""; 
    }
    return apiKey;
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

export const generatePalmImage = async (): Promise<string> => {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: 'A mystical, artistic, and detailed image of a human palm with clear lines (heart, head, life lines), set against a cosmic, starry background. The style should be slightly abstract and beautiful.',
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
        },
    });

    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    if (!base64ImageBytes) {
        throw new Error("Failed to generate palm image.");
    }
    return base64ImageBytes;
};

export const generateSpeech = async (text: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
            },
        },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
        throw new Error("Failed to generate speech.");
    }
    return base64Audio;
};

export const findLocalExperts = async (query: string): Promise<{name: string, address: string}[]> => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Find places for the query: "${query}". Provide the response as a JSON array of objects with "name" and "address" properties. If you find places, give at least 3. If you can't find anything, return an empty array.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        address: { type: Type.STRING }
                    },
                    required: ["name", "address"]
                }
            }
        }
    });

    try {
        const result = JSON.parse(response.text);
        return result;
    } catch (e) {
        console.error("Failed to parse local experts response:", e, "Response text:", response.text);
        return [];
    }
};

export const generateHtmlFromUrl = async (prompt: string): Promise<string> => {
     const response = await ai.models.generateContent({
        model: "gemini-2.5-pro", // Using a more powerful model for better HTML generation
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });
    // The response is expected to be raw HTML. Clean it up if necessary.
    const rawText = response.text;
    if (rawText.startsWith('```html')) {
        return rawText.replace(/```html\n|```/g, '').trim();
    }
    return rawText;
};