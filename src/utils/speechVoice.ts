/**
 * Multi-language Text-to-Speech synthesizer for J.A.R.V.I.S.
 * Supports English (refined British) and Bengali (বাংলা - bn-BD / bn-IN)
 */

type SpeechCallback = (isSpeaking: boolean) => void;

class JarvisSpeechSynthesizer {
  private selectedVoiceEn: SpeechSynthesisVoice | null = null;
  private selectedVoiceBn: SpeechSynthesisVoice | null = null;
  private isMuted: boolean = false;
  private listeners: Set<SpeechCallback> = new Set();
  private isSpeaking: boolean = false;
  private currentLanguage: 'en' | 'bn' = 'en';

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.initVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  private initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return;

    // 1. English British preferred
    const preferredBritish = [
      'Google UK English Male',
      'Daniel',
      'Oliver',
      'Arthur',
      'George',
      'en-GB',
      'en_GB',
    ];

    let matchEn = voices.find((v) => preferredBritish.some((pref) => v.name.includes(pref) || v.lang.includes(pref)));
    if (!matchEn) {
      matchEn = voices.find((v) => v.lang.startsWith('en-GB') || v.lang.startsWith('en_GB'));
    }
    if (!matchEn) {
      matchEn = voices.find((v) => v.lang.startsWith('en'));
    }
    this.selectedVoiceEn = matchEn || voices[0] || null;

    // 2. Bengali (বাংলা) voices
    const matchBn = voices.find((v) => v.lang.startsWith('bn') || v.name.toLowerCase().includes('bangla') || v.name.toLowerCase().includes('bengali'));
    this.selectedVoiceBn = matchBn || null;
  }

  public setLanguage(lang: 'en' | 'bn') {
    this.currentLanguage = lang;
  }

  public getLanguage(): 'en' | 'bn' {
    return this.currentLanguage;
  }

  public subscribe(cb: SpeechCallback) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private setSpeaking(val: boolean) {
    this.isSpeaking = val;
    this.listeners.forEach((cb) => cb(val));
  }

  public getSpeaking(): boolean {
    return this.isSpeaking;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.setSpeaking(false);
    }
  }

  public speak(text: string, forceLanguage?: 'en' | 'bn'): Promise<void> {
    return new Promise((resolve) => {
      if (this.isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
        resolve();
        return;
      }

      const langToUse = forceLanguage || this.currentLanguage;

      // Clean text
      const cleaned = text
        .replace(/[*_#`~[\]]/g, '')
        .replace(/https?:\/\/\S+/g, '')
        .trim();

      if (!cleaned) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();
      try {
        window.speechSynthesis.resume();
      } catch {}

      const utterance = new SpeechSynthesisUtterance(cleaned);

      if (langToUse === 'bn') {
        utterance.lang = 'bn-BD';
        if (this.selectedVoiceBn) {
          utterance.voice = this.selectedVoiceBn;
        } else {
          this.initVoices();
          if (this.selectedVoiceBn) utterance.voice = this.selectedVoiceBn;
        }
        utterance.rate = 1.08;
        utterance.pitch = 0.95;
      } else {
        utterance.lang = 'en-GB';
        if (this.selectedVoiceEn) {
          utterance.voice = this.selectedVoiceEn;
        } else {
          this.initVoices();
          if (this.selectedVoiceEn) utterance.voice = this.selectedVoiceEn;
        }
        utterance.rate = 1.12;
        utterance.pitch = 0.92;
      }

      let hasResolved = false;
      const safeResolve = () => {
        if (!hasResolved) {
          hasResolved = true;
          this.setSpeaking(false);
          resolve();
        }
      };

      utterance.onstart = () => {
        this.setSpeaking(true);
      };

      utterance.onend = () => {
        safeResolve();
      };

      utterance.onerror = () => {
        safeResolve();
      };

      // Safety timeout to avoid getting stuck in speaking state on mobile
      setTimeout(() => {
        safeResolve();
      }, 7000);

      try {
        window.speechSynthesis.speak(utterance);
      } catch {
        safeResolve();
      }
    });
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.setSpeaking(false);
    }
  }
}

export const jarvisVoice = new JarvisSpeechSynthesizer();
