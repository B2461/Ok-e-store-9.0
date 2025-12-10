import React, { useState, FormEvent } from 'react';
import Card from './Card';
import { generateHtmlFromUrl } from '../services/geminiService';

interface HtmlCodeGeneratorProps {
    onBack: () => void;
}

const HtmlCodeGenerator: React.FC<HtmlCodeGeneratorProps> = ({ onBack }) => {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authError, setAuthError] = useState('');

    const [url, setUrl] = useState('');
    const [generatedHtml, setGeneratedHtml] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isCopied, setIsCopied] = useState(false);

    const handleAuth = (e: FormEvent) => {
        e.preventDefault();
        if (password === '1141') {
            setIsAuthenticated(true);
        } else {
            setAuthError('गलत पासवर्ड।');
            setPassword('');
        }
    };

    const handleGenerate = async () => {
        if (!url.trim().startsWith('http')) {
            setError('कृपया एक वैध URL दर्ज करें (http:// या https:// से शुरू)।');
            return;
        }
        setIsLoading(true);
        setError('');
        setGeneratedHtml('');
        try {
            const prompt = `Analyze the website at the following URL using your search capabilities: ${url}. Based on your analysis of its structure, content, and styling, generate a single, self-contained HTML file that visually and structurally represents this website as closely as possible. Inline all necessary CSS. For JavaScript, either inline it if it's simple and essential for the layout, or omit it. For images, use descriptive alt text and placeholders from https://placehold.co/. The goal is a portable HTML file that captures the essence of the page. Respond ONLY with the raw HTML code, without any wrapping markdown like \`\`\`html.`;
            const html = await generateHtmlFromUrl(prompt);
            setGeneratedHtml(html);
        } catch (e) {
            setError('HTML बनाने में विफल। वेबसाइट बहुत जटिल या दुर्गम हो सकती है।');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (!generatedHtml) return;
        navigator.clipboard.writeText(generatedHtml);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleDownload = () => {
        if (!generatedHtml) return;
        const blob = new Blob([generatedHtml], { type: 'text/html' });
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = 'generated-page.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
    };

    if (!isAuthenticated) {
        return (
            <Card className="animate-fade-in max-w-md mx-auto">
                <button onClick={onBack} className="absolute top-6 left-6 text-purple-300 hover:text-white transition">&larr; वापस</button>
                <h2 className="text-3xl font-hindi font-bold mb-6 text-center">प्रमाणीकरण आवश्यक</h2>
                <form onSubmit={handleAuth} className="space-y-6">
                    <div>
                        <label htmlFor="password" className="block text-purple-200 text-lg mb-2">पासवर्ड दर्ज करें</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition"
                        />
                    </div>
                    {authError && <p className="text-red-400 text-center">{authError}</p>}
                    <div className="text-center">
                        <button type="submit" className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 ease-in-out text-lg">
                            प्रवेश करें
                        </button>
                    </div>
                </form>
            </Card>
        );
    }

    return (
        <Card className="animate-fade-in max-w-4xl mx-auto">
            <button onClick={onBack} className="absolute top-6 left-6 text-purple-300 hover:text-white transition">&larr; वापस</button>
            <h2 className="text-3xl font-hindi font-bold mb-6 text-center">वेबसाइट से कोड बनाएं</h2>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="flex-grow bg-white/10 p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-purple-400 focus:outline-none transition"
                    disabled={isLoading}
                />
                <button onClick={handleGenerate} disabled={isLoading} className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 ease-in-out text-lg disabled:opacity-60 disabled:cursor-not-allowed">
                    {isLoading ? 'बनाया जा रहा है...' : 'बनाएं'}
                </button>
            </div>
            {error && <p className="text-red-400 text-center mb-4">{error}</p>}

            {isLoading && (
                <div className="flex flex-col items-center justify-center text-center p-8 min-h-[300px]">
                    <div className="relative w-16 h-16 mb-4">
                        <div className="absolute inset-0 border-4 border-purple-400/50 rounded-full animate-spin"></div>
                    </div>
                    <p className="text-lg text-purple-200">AI वेबसाइट का विश्लेषण कर रहा है... इसमें एक मिनट तक लग सकता है।</p>
                </div>
            )}
            
            {generatedHtml && !isLoading && (
                <div className="mt-6 animate-fade-in">
                    <div className="flex justify-end gap-4 mb-2">
                        <button onClick={handleCopy} className="px-4 py-2 bg-white/10 text-purple-200 border border-white/20 rounded-full font-semibold hover:bg-white/20 transition">{isCopied ? 'कॉपी हो गया!' : 'कॉपी करें'}</button>
                        <button onClick={handleDownload} className="px-4 py-2 bg-white/10 text-purple-200 border border-white/20 rounded-full font-semibold hover:bg-white/20 transition">डाउनलोड करें</button>
                    </div>
                    <textarea
                        readOnly
                        value={generatedHtml}
                        className="w-full h-96 bg-black/30 font-mono text-sm p-4 rounded-lg border border-white/20"
                    ></textarea>
                </div>
            )}
        </Card>
    );
};

export default HtmlCodeGenerator;
