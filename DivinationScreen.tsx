import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DivinationType, UserInput, Reading } from '../types';
import InputForm from './InputForm';
import LoadingIndicator from './LoadingIndicator';
import ResultDisplay from './ResultDisplay';
import { generateReading } from '../services/geminiService';
import { useAppContext } from '../App';
import LiveAstrologerScreen from './LiveAstrologerScreen';
import FutureStoryScreen from './FutureStoryScreen';
import TimeManagementScreen from './TimeManagementScreen';
import LocalExpertsScreen from './LocalExpertsScreen';
import HtmlCodeGenerator from './HtmlCodeGenerator';
import PrashnaChakraScreen from './PrashnaChakraScreen';

const DivinationScreen: React.FC = () => {
    const { toolType } = useParams<{ toolType: string }>();
    const navigate = useNavigate();
    const { currentUser, setExtendedProfiles } = useAppContext();
    
    // Decode toolType from URL safely
    const decodedToolType = toolType ? decodeURIComponent(toolType) as DivinationType : DivinationType.ASTROLOGY;

    const [step, setStep] = useState<'input' | 'loading' | 'result'>('input');
    const [reading, setReading] = useState<Reading | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSaved, setIsSaved] = useState(false);
    const [currentInput, setCurrentInput] = useState<UserInput>({});

    const handleSubmit = async (input: UserInput) => {
        setCurrentInput(input);
        setStep('loading');
        setError(null);
        try {
            const result = await generateReading(decodedToolType, input);
            setReading(result);
            setStep('result');
        } catch (err: any) {
            console.error(err);
            setError("भविष्यवाणी प्राप्त करने में विफल। कृपया पुनः प्रयास करें।");
            setStep('input');
        }
    };

    const handleReset = () => {
        setReading(null);
        setStep('input');
        setIsSaved(false);
    };

    const handleSave = () => {
        if (!reading || !currentUser?.email) return;
        
        // Save to local storage/profile for now as per app pattern
        const newSavedReading = {
            id: `reading-${Date.now()}`,
            date: new Date().toISOString(),
            divinationType: decodedToolType,
            reading: reading
        };

        setExtendedProfiles(prev => {
            const userEmail = currentUser.email!;
            // This is a simplified logic. In a real app, you'd push to a 'savedReadings' array in the profile
            // For now, we simulate saving by just toggling state to show feedback
            return prev; 
        });
        
        // Actually save to a specific local storage key for "My Readings" screen
        const savedReadings = JSON.parse(localStorage.getItem('okFutureZoneSavedReadings') || '[]');
        localStorage.setItem('okFutureZoneSavedReadings', JSON.stringify([...savedReadings, newSavedReading]));
        
        setIsSaved(true);
    };

    // Render Specific Complex Components if needed
    if (decodedToolType === DivinationType.LIVE_ASTROLOGER) {
        return <LiveAstrologerScreen onBack={() => navigate('/home')} />;
    }
    
    if (decodedToolType === DivinationType.FUTURE_STORY) {
        // If we have input, show story, else show input
        if (step === 'result') {
             return <FutureStoryScreen userInput={currentInput} onReset={handleReset} />;
        }
        // Use default input form for prompt
    }

    if (decodedToolType === DivinationType.TIME_MANAGEMENT) {
        return <TimeManagementScreen onBack={() => navigate('/home')} />;
    }

    if (decodedToolType === DivinationType.LOCAL_EXPERTS) {
        return <LocalExpertsScreen onBack={() => navigate('/home')} />;
    }

    if (decodedToolType === DivinationType.HTML_GENERATOR) {
        return <HtmlCodeGenerator onBack={() => navigate('/home')} />;
    }

    if (decodedToolType === DivinationType.PRASHNA_CHAKRA) {
        // Wrapper for Prashna Chakra logic
        if (step === 'input') {
             return <PrashnaChakraScreen onSubmit={handleSubmit} error={error} onBack={() => navigate('/home')} />;
        }
    }

    return (
        <div className="w-full">
            {step === 'input' && (
                <InputForm 
                    divinationType={decodedToolType} 
                    onSubmit={handleSubmit} 
                    error={error} 
                    onBack={() => navigate('/home')}
                    userProfile={currentUser}
                />
            )}
            {step === 'loading' && (
                <LoadingIndicator divinationType={decodedToolType} />
            )}
            {step === 'result' && (
                <ResultDisplay 
                    reading={reading} 
                    divinationType={decodedToolType} 
                    onReset={handleReset}
                    onSave={handleSave}
                    isSaved={isSaved}
                />
            )}
        </div>
    );
};

export default DivinationScreen;