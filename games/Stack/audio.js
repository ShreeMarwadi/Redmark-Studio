/**
 * EchoStep - Audio System
 * Generates procedural audio using Web Audio API
 * Synchronizes with the 3-second echo cycle
 */

class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.initialized = false;

        // Audio nodes
        this.ambientDrone = null;
        this.metronomeOsc = null;
        this.metronomeGain = null;

        // Cycle synchronization
        this.cycleDuration = 3000; // 3 seconds in milliseconds
        this.currentBeat = 0;
        this.beatInterval = 500; // 120 BPM = 500ms per beat

        // Sound effect nodes for cleanup
        this.activeSounds = [];

        // Audio settings
        this.settings = {
            masterVolume: 0.6,
            ambientVolume: 0.15,
            metronomeVolume: 0.08,
            jumpVolume: 0.2,
            landVolume: 0.15,
            echoVolume: 0.25,
            hazardVolume: 0.3,
            goalVolume: 0.35
        };
    }

    /**
     * Initialize the audio system
     * Must be called after user interaction due to browser autoplay policies
     */
    async init() {
        if (this.initialized) return;

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Create master gain node
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = this.settings.masterVolume;
            this.masterGain.connect(this.audioContext.destination);

            // Start ambient drone
            this.startAmbientDrone();

            // Start metronome
            this.startMetronome();

            this.initialized = true;
            console.log('Audio system initialized');
        } catch (error) {
            console.warn('Audio initialization failed:', error);
        }
    }

    /**
     * Create ambient drone background sound
     */
    startAmbientDrone() {
        const frequencies = [55, 82.5, 110, 165]; // A1, E2, A2, E3

        frequencies.forEach((freq, index) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();

            // Use sine waves for a calm, ethereal sound
            osc.type = 'sine';
            osc.frequency.value = freq;

            // Subtle filter for warmth
            filter.type = 'lowpass';
            filter.frequency.value = 800;
            filter.Q.value = 1;

            // Gentle volume
            gain.gain.value = 0.03 / (index + 1);

            // Connect: oscillator -> filter -> gain -> master
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);

            osc.start();

            // Store for cleanup
            this.activeSounds.push({ osc, gain });
        });
    }

    /**
     * Start the metronome that syncs with the echo cycle
     */
    startMetronome() {
        const scheduleBeat = () => {
            if (!this.initialized) return;

            const nextBeatTime = this.audioContext.currentTime + this.beatInterval / 1000;
            this.scheduleMetronomeTick(nextBeatTime);

            this.metronomeTimer = setTimeout(() => {
                this.currentBeat = (this.currentBeat + 1) % (this.cycleDuration / this.beatInterval);
                scheduleBeat();
            }, this.beatInterval);
        };

        scheduleBeat();
    }

    /**
     * Schedule a metronome tick
     */
    scheduleMetronomeTick(time) {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        osc.type = 'sine';
        // Different pitches for different beats in the cycle
        const pitches = [220, 196.5, 220, 196.5]; // A3, G3, A3, G3
        osc.frequency.value = pitches[this.currentBeat] || 220;

        filter.type = 'lowpass';
        filter.frequency.value = 2000;

        gain.gain.setValueAtTime(this.settings.metronomeVolume, time);
        gain.gain.exponentialDecayTo = (value, endTime) => {
            gain.gain.exponentialRampToValueAtTime(value, endTime);
        };
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(time);
        osc.stop(time + 0.15);

        // Cleanup after sound finishes
        setTimeout(() => {
            osc.disconnect();
            gain.disconnect();
        }, 200);
    }

    /**
     * Play a short click sound for cycle reset
     */
    playCycleReset() {
        if (!this.initialized) return;

        const now = this.audioContext.currentTime;

        // Create a subtle "ping" sound
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now); // A5
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.3);

        filter.type = 'lowpass';
        filter.frequency.value = 3000;

        gain.gain.setValueAtTime(this.settings.echoVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.5);

        setTimeout(() => {
            osc.disconnect();
            gain.disconnect();
        }, 600);
    }

    /**
     * Play jump sound
     */
    playJump() {
        if (!this.initialized) return;

        const now = this.audioContext.currentTime;

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(330, now); // E4
        osc.frequency.exponentialRampToValueAtTime(660, now + 0.1);

        gain.gain.setValueAtTime(this.settings.jumpVolume * 0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.2);

        setTimeout(() => {
            osc.disconnect();
            gain.disconnect();
        }, 300);
    }

    /**
     * Play landing sound
     */
    playLand() {
        if (!this.initialized) return;

        const now = this.audioContext.currentTime;

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(165, now); // E3
        osc.frequency.exponentialRampToValueAtTime(82.5, now + 0.1);

        filter.type = 'lowpass';
        filter.frequency.value = 500;

        gain.gain.setValueAtTime(this.settings.landVolume * 0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.15);

        setTimeout(() => {
            osc.disconnect();
            gain.disconnect();
        }, 250);
    }

    /**
     * Play echo platform creation sound
     */
    playEchoCreate() {
        if (!this.initialized) return;

        const now = this.audioContext.currentTime;

        // Create a shimmering sound
        const osc1 = this.audioContext.createOscillator();
        const osc2 = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc1.type = 'sine';
        osc2.type = 'sine';

        osc1.frequency.setValueAtTime(523.25, now); // C5
        osc2.frequency.setValueAtTime(659.25, now); // E5

        osc1.frequency.linearRampToValueAtTime(1046.5, now + 0.2); // C6
        osc2.frequency.linearRampToValueAtTime(1318.5, now + 0.2); // E6

        gain.gain.setValueAtTime(this.settings.echoVolume * 0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.masterGain);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.35);
        osc2.stop(now + 0.35);

        setTimeout(() => {
            osc1.disconnect();
            osc2.disconnect();
            gain.disconnect();
        }, 450);
    }

    /**
     * Play echo fade sound (when old echo disappears)
     */
    playEchoFade() {
        if (!this.initialized) return;

        const now = this.audioContext.currentTime;

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(392, now); // G4
        osc.frequency.exponentialRampToValueAtTime(196, now + 0.25); // G3

        gain.gain.setValueAtTime(this.settings.echoVolume * 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.35);

        setTimeout(() => {
            osc.disconnect();
            gain.disconnect();
        }, 450);
    }

    /**
     * Play hazard/death sound
     */
    playHazard() {
        if (!this.initialized) return;

        const now = this.audioContext.currentTime;

        // Create a dissonant sound
        const osc1 = this.audioContext.createOscillator();
        const osc2 = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc1.type = 'sawtooth';
        osc2.type = 'sawtooth';

        osc1.frequency.setValueAtTime(110, now); // A2
        osc2.frequency.setValueAtTime(116.54, now); // A#2 (dissonant)

        osc1.frequency.exponentialRampToValueAtTime(55, now + 0.4);
        osc2.frequency.exponentialRampToValueAtTime(58.27, now + 0.4);

        gain.gain.setValueAtTime(this.settings.hazardVolume * 0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.masterGain);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.55);
        osc2.stop(now + 0.55);

        setTimeout(() => {
            osc1.disconnect();
            osc2.disconnect();
            gain.disconnect();
        }, 650);
    }

    /**
     * Play goal/reach level sound
     */
    playGoal() {
        if (!this.initialized) return;

        const now = this.audioContext.currentTime;

        // Create an ascending arpeggio
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        const durations = [0, 0.1, 0.2, 0.3];

        notes.forEach((freq, index) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.type = 'sine';
            osc.frequency.value = freq;

            const startTime = now + durations[index];
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(this.settings.goalVolume * 0.4, startTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(startTime);
            osc.stop(startTime + 0.4);

            setTimeout(() => {
                osc.disconnect();
                gain.disconnect();
            }, 500);
        });
    }

    /**
     * Play UI interaction sound
     */
    playUI() {
        if (!this.initialized) return;

        const now = this.audioContext.currentTime;

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.value = 880;

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.15);

        setTimeout(() => {
            osc.disconnect();
            gain.disconnect();
        }, 250);
    }

    /**
     * Update volume settings
     */
    setVolume(type, value) {
        if (this.settings.hasOwnProperty(type)) {
            this.settings[type] = value;
        }
    }

    /**
     * Get current cycle progress (0-1)
     */
    getCycleProgress() {
        return (this.currentBeat * this.beatInterval) / this.cycleDuration;
    }

    /**
     * Get current beat within cycle
     */
    getCurrentBeat() {
        return this.currentBeat;
    }

    /**
     * Clean up all audio resources
     */
    destroy() {
        // Clear timers
        if (this.metronomeTimer) {
            clearTimeout(this.metronomeTimer);
        }

        // Stop all active sounds
        this.activeSounds.forEach(sound => {
            if (sound.osc) {
                try {
                    sound.osc.stop();
                } catch (e) {}
                sound.osc.disconnect();
            }
            if (sound.gain) {
                sound.gain.disconnect();
            }
        });

        this.activeSounds = [];

        // Close audio context
        if (this.audioContext) {
            this.audioContext.close();
        }

        this.initialized = false;
    }
}

// Export for use in game.js
window.AudioSystem = AudioSystem;
