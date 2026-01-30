import { useCallback, useEffect } from 'react';
import { playSound, initAudio, isSoundEnabled, setSoundEnabled } from '../lib/sounds';

/**
 * Hook for using sounds throughout the app
 * Provides easy access to all sound effects
 */
export function useSounds() {
    // Initialize audio on mount
    useEffect(() => {
        const handleInteraction = () => {
            initAudio();
            document.removeEventListener('click', handleInteraction);
            document.removeEventListener('keydown', handleInteraction);
        };

        document.addEventListener('click', handleInteraction);
        document.addEventListener('keydown', handleInteraction);

        return () => {
            document.removeEventListener('click', handleInteraction);
            document.removeEventListener('keydown', handleInteraction);
        };
    }, []);

    const click = useCallback(() => playSound.click(), []);
    const hover = useCallback(() => playSound.hover(), []);
    const success = useCallback(() => playSound.success(), []);
    const pop = useCallback(() => playSound.pop(), []);
    const swoosh = useCallback(() => playSound.swoosh(), []);
    const toggle = useCallback(() => playSound.toggle(), []);
    const drop = useCallback(() => playSound.drop(), []);
    const notification = useCallback(() => playSound.notification(), []);

    return {
        click,
        hover,
        success,
        pop,
        swoosh,
        toggle,
        drop,
        notification,
        isEnabled: isSoundEnabled,
        setEnabled: setSoundEnabled,
    };
}
