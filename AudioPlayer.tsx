
import React, { useState, useEffect } from 'react';

interface AudioPlayerProps {
    audioRef: React.RefObject<HTMLAudioElement>;
    size?: 'sm' | 'lg';
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioRef, size = 'sm' }) => {
    const [isMuted, setIsMuted] = useState(false);

    // Effect to listen to the audio element's state changes (e.g., if muted by other means)
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const syncMuteState = () => {
            setIsMuted(audio.muted);
        };

        audio.addEventListener('volumechange', syncMuteState);
        // Initial sync
        syncMuteState();

        return () => {
            audio.removeEventListener('volumechange', syncMuteState);
        };
    }, [audioRef]);

    const toggleMute = () => {
        if (audioRef.current) {
            // Directly manipulate the audio element
            const newMutedState = !audioRef.current.muted;
            audioRef.current.muted = newMutedState;
            setIsMuted(newMutedState);
        }
    };

    const buttonClass = size === 'sm' 
        ? "p-1"
        : "p-4";
    const iconClass = size === 'sm' 
        ? "h-7 w-7"
        : "h-10 w-10";

    return (
        <button
            onClick={toggleMute}
            className={`relative rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400 ${buttonClass}`}
            aria-label={isMuted ? "Unmute music" : "Mute music"}
        >
            {isMuted ? (
                <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                </svg>
            )}
        </button>
    );
};

export default AudioPlayer;