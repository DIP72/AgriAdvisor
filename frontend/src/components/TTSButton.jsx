import React, { useState, useRef } from 'react';
import { Volume2, Loader2 } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const TTSButton = ({ textToRead, isDarkMode, className = "" }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { isEnglish } = useLanguage();
    const audioRef = useRef(null);

    const handlePlay = async () => {
        if (isPlaying) {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            setIsPlaying(false);
            return;
        }

        if (!textToRead) return;

        setIsLoading(true);
        try {
            // Calling our own backend API which now uses Sarvam AI
            const apiUrl = import.meta.env.VITE_API_URL || '';
            const response = await fetch(`${apiUrl}/api/tts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: textToRead,
                    lang: isEnglish ? 'en' : 'mr',
                }),
            });

            if (!response.ok) {
                throw new Error('TTS request failed');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            audioRef.current = audio;

            audio.onplay = () => {
                setIsLoading(false);
                setIsPlaying(true);
            };

            audio.onended = () => {
                setIsPlaying(false);
                audioRef.current = null;
                URL.revokeObjectURL(url);
            };

            audio.onerror = () => {
                setIsLoading(false);
                setIsPlaying(false);
                audioRef.current = null;
            };

            await audio.play();
        } catch (error) {
            console.error('TTS Error:', error);
            setIsLoading(false);
            setIsPlaying(false);
            // alert('Speech service currently unavailable.');
        }
    };

    return (
        <Motion.div
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
                e.stopPropagation();
                handlePlay();
            }}
            className={`tts-button ${className}`}
            style={{
                background: isPlaying ? '#16a34a' : (isDarkMode ? 'rgba(255,255,255,0.1)' : 'white'),
                padding: '10px',
                margin:'10px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isLoading ? 'default' : 'pointer',
                boxShadow: isPlaying ? '0 4px 12px rgba(22, 163, 74, 0.3)' : '0 2px 8px rgba(0,0,0,0.05)',
                border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb',
                transition: 'all 0.2s ease',
                width: '40px',
                height: '40px',
                opacity: isLoading ? 0.7 : 1
            }}
        >
            {isLoading ? (
                <Loader2 size={20} className="animate-spin" color={isDarkMode ? 'white' : 'var(--primary)'} />
            ) : (
                <Volume2 size={20} color={isPlaying ? 'white' : (isDarkMode ? 'white' : '#1f2937')} />
            )}
        </Motion.div>
    );
};

export default TTSButton;
