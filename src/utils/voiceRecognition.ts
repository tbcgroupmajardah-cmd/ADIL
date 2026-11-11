/**
 * Speech Recognition controller for J.A.R.V.I.S. Voice Commands
 * Supports Web Speech Recognition API with English and Bangla (বাংলা - bn-BD) support.
 * Features Instant Talking Engine with sub-second silence detection and fast keyword triggers.
 */

type TranscriptCallback = (transcript: string, isFinal: boolean) => void;
type StatusCallback = (isListening: boolean, error?: string) => void;

interface IWindowWithSpeech extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

const INSTANT_TRIGGER_KEYWORDS = [
  'fire', 'repulsor', 'torch', 'light', 'battery', 'charge', 'status', 
  'veronica', 'party', 'stealth', 'overdrive', 'clean slate', 'who are you', 
  'how are you', 'joke', 'help', 'scan', 'biometric', 'camera', 'vibrate',
  // Bangla triggers
  'রিপালসর', 'গুলি', 'টর্চ', 'আলো', 'চার্জ', 'ব্যাটারি', 'অবস্থা', 
  'স্ট্যাটাস', 'হাউস পার্টি', 'ভেরোনিকা', 'স্টিলথ', 'ওভারড্রাইভ', 
  'কেমন আছো', 'তুমি কে', 'স্ক্যান', 'বায়োমেট্রিক', 'ক্যামেরা', 'ভাইব্রেট'
];

export class VoiceRecognitionService {
  private recognition: any = null;
  private isListening: boolean = false;
  private isSupported: boolean = false;
  private transcriptListeners: Set<TranscriptCallback> = new Set();
  private statusListeners: Set<StatusCallback> = new Set();
  private autoRestart: boolean = false;
  private currentLanguage: 'en' | 'bn' = 'en';

  // Instant Talking Latency Optimization
  private instantMode: boolean = true;
  private debounceTimer: any = null;
  private lastProcessedTranscript: string = '';
  private lastProcessedTime: number = 0;

  constructor() {
    this.initRecognition();
  }

  private initRecognition() {
    if (typeof window !== 'undefined') {
      const win = window as unknown as IWindowWithSpeech;
      const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

      if (SpeechRecognitionClass) {
        this.isSupported = true;
        try {
          this.recognition = new SpeechRecognitionClass();
          this.recognition.continuous = true;
          this.recognition.interimResults = true;
          this.recognition.lang = this.currentLanguage === 'bn' ? 'bn-BD' : 'en-US';

          this.recognition.onstart = () => {
            this.isListening = true;
            this.notifyStatus(true);
          };

          this.recognition.onresult = (event: any) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
              const result = event.results[i];
              if (result.isFinal) {
                finalTranscript += result[0].transcript;
              } else {
                interimTranscript += result[0].transcript;
              }
            }

            const cleanFinal = finalTranscript.trim();
            const cleanInterim = interimTranscript.trim();

            if (cleanFinal) {
              if (this.debounceTimer) clearTimeout(this.debounceTimer);
              this.dispatchCommand(cleanFinal, true);
            } else if (cleanInterim) {
              this.notifyTranscript(cleanInterim, false);

              // Instant Talking Mode Logic
              if (this.instantMode) {
                if (this.debounceTimer) clearTimeout(this.debounceTimer);

                const lowerInterim = cleanInterim.toLowerCase();
                const hasInstantKeyword = INSTANT_TRIGGER_KEYWORDS.some(k => lowerInterim.includes(k));

                // If known command keyword is uttered, respond after minimal 220ms pause
                // Otherwise debounce 400ms after speech pause instead of waiting seconds for browser isFinal
                const delayMs = hasInstantKeyword ? 220 : 420;

                this.debounceTimer = setTimeout(() => {
                  this.dispatchCommand(cleanInterim, true);
                }, delayMs);
              }
            }
          };

          this.recognition.onerror = (event: any) => {
            if (event.error !== 'no-speech') {
              console.warn('Speech recognition warning:', event.error);
              this.notifyStatus(this.isListening, event.error);
            }
          };

          this.recognition.onend = () => {
            if (this.autoRestart && this.isListening) {
              try {
                this.recognition.start();
                return;
              } catch {}
            }
            this.isListening = false;
            this.notifyStatus(false);
          };
        } catch (e) {
          console.warn('Speech recognition initialization error:', e);
          this.isSupported = false;
        }
      }
    }
  }

  private dispatchCommand(text: string, isFinal: boolean) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const now = Date.now();
    // Prevent double execution within 1.2s for identical or substring text
    if (
      this.lastProcessedTranscript &&
      now - this.lastProcessedTime < 1200 &&
      (this.lastProcessedTranscript === trimmed || trimmed.includes(this.lastProcessedTranscript))
    ) {
      return;
    }

    this.lastProcessedTranscript = trimmed;
    this.lastProcessedTime = now;
    this.notifyTranscript(trimmed, isFinal);
  }

  public setInstantMode(enabled: boolean) {
    this.instantMode = enabled;
  }

  public getInstantMode(): boolean {
    return this.instantMode;
  }

  public setLanguage(lang: 'en' | 'bn') {
    this.currentLanguage = lang;
    if (this.recognition) {
      const wasListening = this.isListening;
      if (wasListening) {
        this.stop();
      }
      this.recognition.lang = lang === 'bn' ? 'bn-BD' : 'en-US';
      if (wasListening) {
        this.start(this.autoRestart);
      }
    }
  }

  public getLanguage(): 'en' | 'bn' {
    return this.currentLanguage;
  }

  public getSupported(): boolean {
    return this.isSupported;
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  public onTranscript(cb: TranscriptCallback) {
    this.transcriptListeners.add(cb);
    return () => this.transcriptListeners.delete(cb);
  }

  public onStatus(cb: StatusCallback) {
    this.statusListeners.add(cb);
    return () => this.statusListeners.delete(cb);
  }

  private notifyTranscript(text: string, isFinal: boolean) {
    this.transcriptListeners.forEach((cb) => cb(text, isFinal));
  }

  private notifyStatus(listening: boolean, error?: string) {
    this.statusListeners.forEach((cb) => cb(listening, error));
  }

  public start(continuous: boolean = false): boolean {
    if (!this.recognition) return false;
    this.autoRestart = continuous;
    try {
      this.recognition.start();
      return true;
    } catch {
      return false;
    }
  }

  public stop() {
    this.autoRestart = false;
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    if (!this.recognition) return;
    try {
      this.recognition.stop();
    } catch {}
    this.isListening = false;
    this.notifyStatus(false);
  }

  public toggle(continuous: boolean = false): boolean {
    if (this.isListening) {
      this.stop();
      return false;
    } else {
      return this.start(continuous);
    }
  }
}

export const voiceRecognition = new VoiceRecognitionService();
