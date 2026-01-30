/**
 * Sound System - Ultra satisfying audio feedback
 * Crujientes, ricos y sensuales sonidos para una experiencia premium
 */

// Sound types available
type SoundType =
    | 'click'      // Soft tap for buttons
    | 'hover'      // Subtle whoosh on hover
    | 'success'    // Satisfying ding
    | 'pop'        // Bubbly pop for selections
    | 'swoosh'     // Smooth transition sound
    | 'toggle'     // Switch/toggle sound
    | 'drop'       // Drag and drop
    | 'notification'; // Alert sound

// Audio context singleton
let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContext;
};

// Store user preference
let soundEnabled = true;

export const setSoundEnabled = (enabled: boolean) => {
    soundEnabled = enabled;
    localStorage.setItem('sound-enabled', String(enabled));
};

export const isSoundEnabled = (): boolean => {
    const stored = localStorage.getItem('sound-enabled');
    if (stored !== null) {
        soundEnabled = stored === 'true';
    }
    return soundEnabled;
};

// Generate satisfying sounds programmatically
const createSound = (type: SoundType): void => {
    if (!isSoundEnabled()) return;

    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;

        switch (type) {
            case 'click': {
                // Soft, crispy click - like typing on a premium keyboard
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
                osc.type = 'sine';

                gain.gain.setValueAtTime(0.15, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

                osc.start(now);
                osc.stop(now + 0.08);
                break;
            }

            case 'hover': {
                // Whisper-soft hover - like silk
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                const filter = ctx.createBiquadFilter();

                osc.connect(filter);
                filter.connect(gain);
                gain.connect(ctx.destination);

                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(2000, now);

                osc.frequency.setValueAtTime(600, now);
                osc.frequency.linearRampToValueAtTime(800, now + 0.05);
                osc.type = 'sine';

                gain.gain.setValueAtTime(0.03, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

                osc.start(now);
                osc.stop(now + 0.06);
                break;
            }

            case 'success': {
                // Triumphant chime - two notes ascending
                [0, 0.1].forEach((delay, i) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();

                    osc.connect(gain);
                    gain.connect(ctx.destination);

                    const freq = i === 0 ? 523.25 : 783.99; // C5 to G5
                    osc.frequency.setValueAtTime(freq, now + delay);
                    osc.type = 'sine';

                    gain.gain.setValueAtTime(0.2, now + delay);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.3);

                    osc.start(now + delay);
                    osc.stop(now + delay + 0.3);
                });
                break;
            }

            case 'pop': {
                // Bubbly pop - satisfying and playful
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(150, now + 0.1);
                osc.type = 'sine';

                gain.gain.setValueAtTime(0.25, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

                osc.start(now);
                osc.stop(now + 0.15);
                break;
            }

            case 'swoosh': {
                // Smooth swoosh - like a gentle breeze
                const noise = ctx.createBufferSource();
                const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
                const output = noiseBuffer.getChannelData(0);

                for (let i = 0; i < noiseBuffer.length; i++) {
                    output[i] = Math.random() * 2 - 1;
                }

                noise.buffer = noiseBuffer;

                const filter = ctx.createBiquadFilter();
                filter.type = 'bandpass';
                filter.frequency.setValueAtTime(1000, now);
                filter.frequency.exponentialRampToValueAtTime(3000, now + 0.1);
                filter.Q.value = 5;

                const gain = ctx.createGain();
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

                noise.connect(filter);
                filter.connect(gain);
                gain.connect(ctx.destination);

                noise.start(now);
                break;
            }

            case 'toggle': {
                // Crispy toggle - satisfying click
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.frequency.setValueAtTime(1200, now);
                osc.frequency.exponentialRampToValueAtTime(600, now + 0.03);
                osc.type = 'square';

                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

                osc.start(now);
                osc.stop(now + 0.05);
                break;
            }

            case 'drop': {
                // Satisfying drop - like placing a piece
                const osc = ctx.createOscillator();
                const osc2 = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.connect(gain);
                osc2.connect(gain);
                gain.connect(ctx.destination);

                osc.frequency.setValueAtTime(200, now);
                osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
                osc.type = 'sine';

                osc2.frequency.setValueAtTime(400, now);
                osc2.frequency.exponentialRampToValueAtTime(200, now + 0.08);
                osc2.type = 'sine';

                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

                osc.start(now);
                osc2.start(now);
                osc.stop(now + 0.12);
                osc2.stop(now + 0.12);
                break;
            }

            case 'notification': {
                // Gentle notification - pleasant alert
                [0, 0.15, 0.3].forEach((delay, i) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();

                    osc.connect(gain);
                    gain.connect(ctx.destination);

                    const freqs = [880, 1108.73, 1318.51]; // A5, C#6, E6 (A major chord)
                    osc.frequency.setValueAtTime(freqs[i], now + delay);
                    osc.type = 'sine';

                    gain.gain.setValueAtTime(0.12, now + delay);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.2);

                    osc.start(now + delay);
                    osc.stop(now + delay + 0.2);
                });
                break;
            }
        }
    } catch (e) {
        console.warn('Sound playback failed:', e);
    }
};

// Export sound functions
export const playSound = {
    click: () => createSound('click'),
    hover: () => createSound('hover'),
    success: () => createSound('success'),
    pop: () => createSound('pop'),
    swoosh: () => createSound('swoosh'),
    toggle: () => createSound('toggle'),
    drop: () => createSound('drop'),
    notification: () => createSound('notification'),
};

// Initialize audio context on first user interaction
export const initAudio = () => {
    try {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') {
            ctx.resume();
        }
    } catch (e) {
        console.warn('Audio init failed:', e);
    }
};
