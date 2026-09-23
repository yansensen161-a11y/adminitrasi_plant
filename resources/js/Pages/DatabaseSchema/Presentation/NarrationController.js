/**
 * NarrationController.js
 * Controls audio narration using Web Speech API (Indonesian id-ID voice).
 */

export class NarrationController {
    constructor() {
        this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
        this.isEnabled = false; // Audio narration muted by default, can be toggled on
        this.currentUtterance = null;
        this.rate = 1.05; // Slightly brisk, clear pace
        this.pitch = 1.0;
        this.voice = null;

        if (this.synth) {
            this.initVoices();
            if (speechSynthesis.onvoiceschanged !== undefined) {
                speechSynthesis.onvoiceschanged = () => this.initVoices();
            }
        }
    }

    initVoices() {
        if (!this.synth) return;
        const voices = this.synth.getVoices();
        // Prefer Indonesian voice
        const idVoice = voices.find(
            (v) => v.lang.startsWith('id') || v.lang.includes('ID') || v.name.toLowerCase().includes('indonesia')
        );
        this.voice = idVoice || voices.find((v) => v.lang.startsWith('en')) || voices[0] || null;
    }

    setEnabled(enabled) {
        this.isEnabled = enabled;
        if (!enabled) {
            this.stop();
        }
    }

    speak(text) {
        if (!this.synth || !this.isEnabled || !text) {
            return;
        }

        this.stop();

        try {
            const utterance = new SpeechSynthesisUtterance(text);
            if (this.voice) {
                utterance.voice = this.voice;
            }
            utterance.rate = this.rate;
            utterance.pitch = this.pitch;
            utterance.lang = this.voice?.lang || 'id-ID';

            this.currentUtterance = utterance;
            this.synth.speak(utterance);
        } catch (e) {
            console.warn('Speech synthesis error:', e);
        }
    }

    pause() {
        if (this.synth && this.synth.speaking) {
            this.synth.pause();
        }
    }

    resume() {
        if (this.synth && this.synth.paused) {
            this.synth.resume();
        }
    }

    stop() {
        if (this.synth) {
            this.synth.cancel();
            this.currentUtterance = null;
        }
    }
}
