/**
 * Dynamic Configuration for J.A.R.V.I.S. / Sahal AI
 * Allows switching the assistant's call name (default: "Sahal") and user's commander name (default: "Adil") anytime.
 */

export interface AssistantSettings {
  assistantName: string;
  commanderName: string;
  language: 'en' | 'bn';
  isHandsFree: boolean;
  voiceGender: 'male' | 'female';
}

const SETTINGS_KEY = 'stark_assistant_settings_v1';

export function loadAssistantSettings(): AssistantSettings {
  if (typeof window === 'undefined') {
    return {
      assistantName: 'Sahal',
      commanderName: 'Adil',
      language: 'bn',
      isHandsFree: true,
      voiceGender: 'male',
    };
  }

  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        assistantName: parsed.assistantName || 'Sahal',
        commanderName: parsed.commanderName || 'Adil',
        language: parsed.language || 'bn',
        isHandsFree: parsed.isHandsFree ?? true,
        voiceGender: parsed.voiceGender || 'male',
      };
    }
  } catch {}

  return {
    assistantName: 'Sahal',
    commanderName: 'Adil',
    language: 'bn',
    isHandsFree: true,
    voiceGender: 'male',
  };
}

export function saveAssistantSettings(settings: AssistantSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {}
}
