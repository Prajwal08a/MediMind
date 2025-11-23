import { useState, useCallback, useRef, useEffect } from 'react';
import { generateSpeech } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audioUtils';
import { Voice } from '../types';

type SpeechState = 'idle' | 'loading' | 'playing';

// Re-usable AudioContext to avoid creating multiple contexts.
let audioContext: AudioContext | null = null;
const getAudioContext = () => {
    if (!audioContext) {
        // The Gemini TTS model returns audio at a 24000 sample rate.
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    return audioContext;
};

export const useTextToSpeech = (text: string, voice: Voice) => {
    const [speechState, setSpeechState] = useState<SpeechState>('idle');
    const sourceRef = useRef<AudioBufferSourceNode | null>(null);

    const stopSpeech = useCallback(() => {
        if (sourceRef.current) {
            try {
                sourceRef.current.stop();
                sourceRef.current.disconnect();
            } catch (error) {
                // Ignore errors that can happen if the source is already stopped.
            }
            sourceRef.current = null;
        }
        setSpeechState('idle');
    }, []);

    const toggleSpeech = useCallback(async () => {
        // If already playing, stop the speech.
        if (speechState === 'playing') {
            stopSpeech();
            return;
        }
        // If loading, do nothing to prevent multiple requests.
        if (speechState === 'loading') {
            return; 
        }

        setSpeechState('loading');
        const base64Audio = await generateSpeech(text, voice);

        if (!base64Audio) {
            console.error("Failed to generate speech audio.");
            setSpeechState('idle');
            // Optionally: show an error to the user.
            return;
        }

        try {
            const ctx = getAudioContext();
            const audioBuffer = await decodeAudioData(
                decode(base64Audio),
                ctx,
                24000, // sample rate for gemini-tts
                1,       // num channels
            );
            
            // In case a previous sound is somehow still playing, stop it.
            if (sourceRef.current) {
                stopSpeech();
            }

            const newSource = ctx.createBufferSource();
            newSource.buffer = audioBuffer;
            newSource.connect(ctx.destination);
            
            newSource.onended = () => {
                if (sourceRef.current === newSource) {
                    setSpeechState('idle');
                    sourceRef.current = null;
                }
            };

            newSource.start();
            sourceRef.current = newSource;
            setSpeechState('playing');

        } catch (error) {
            console.error('Error playing audio:', error);
            setSpeechState('idle');
        }
    }, [text, voice, speechState, stopSpeech]);

    // Cleanup effect to stop any playing audio when the component unmounts.
    useEffect(() => {
        return () => {
            stopSpeech();
        };
    }, [stopSpeech]);

    return { speechState, toggleSpeech };
};