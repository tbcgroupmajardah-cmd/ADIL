import React, { useState } from 'react';
import { Sparkles, User, Bot, Check, X, Shield } from 'lucide-react';
import { soundEffects } from '../utils/audioEffects';

interface AssistantNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAssistantName: string;
  currentCommanderName: string;
  onSave: (assistantName: string, commanderName: string) => void;
  language: 'en' | 'bn';
}

const PRESET_ASSISTANT_NAMES = [
  'Sahal',
  'Jarvis',
  'Friday',
  'Edith',
  'Karen',
  'Veronica'
];

export const AssistantNameModal: React.FC<AssistantNameModalProps> = ({
  isOpen,
  onClose,
  currentAssistantName,
  currentCommanderName,
  onSave,
  language,
}) => {
  const [assistantName, setAssistantName] = useState(currentAssistantName);
  const [commanderName, setCommanderName] = useState(currentCommanderName);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assistantName.trim() || !commanderName.trim()) return;
    soundEffects.playJarvisChime();
    onSave(assistantName.trim(), commanderName.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="w-full max-w-md bg-[#040e1b] border-2 border-cyan-400 rounded-xl p-5 shadow-[0_0_35px_rgba(0,229,255,0.4)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30 mb-4">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-cyan-400" />
            <h3 className="font-orbitron font-bold text-white text-base">
              {language === 'bn' ? 'কমান্ড ও সহকারীর নাম পরিবর্তন' : 'CHANGE CALL NAME ANYTIME'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs font-mono-tech text-gray-300 mb-4">
          {language === 'bn'
            ? 'আপনি যে কোনো সময় আপনার সহকারীর নাম (যেমন "Sahal") এবং আপনার নিজের নাম ("Adil") পরিবর্তন করতে পারেন।'
            : 'Customize the AI Assistant Wake/Call Name and your Commander Name anytime.'}
        </p>

        <form onSubmit={handleSave} className="space-y-4 text-xs font-mono-tech">
          {/* Assistant Call Name */}
          <div>
            <label className="block text-cyan-300 font-bold mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-cyan-400" />
              {language === 'bn' ? 'সহকারীর নাম (Wake Word / Call Name):' : 'AI Assistant Call Name:'}
            </label>
            <input
              type="text"
              value={assistantName}
              onChange={(e) => setAssistantName(e.target.value)}
              placeholder="e.g. Sahal, Jarvis..."
              className="w-full bg-black/70 border border-cyan-500/50 rounded-lg px-3 py-2 text-sm text-cyan-100 placeholder-gray-600 focus:outline-none focus:border-cyan-300 font-mono-tech"
              required
            />

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[10px] text-gray-400">
                {language === 'bn' ? 'প্রিসেট:' : 'PRESETS:'}
              </span>
              {PRESET_ASSISTANT_NAMES.map((name) => (
                <button
                  type="button"
                  key={name}
                  onClick={() => {
                    soundEffects.playBeep(800);
                    setAssistantName(name);
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] border transition ${
                    assistantName.toLowerCase() === name.toLowerCase()
                      ? 'bg-cyan-500/30 text-cyan-200 border-cyan-400 font-bold'
                      : 'bg-black/40 text-gray-400 border-gray-700 hover:text-cyan-300 hover:border-cyan-500/40'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Commander / User Name */}
          <div>
            <label className="block text-cyan-300 font-bold mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-cyan-400" />
              {language === 'bn' ? 'আপনার নাম (কমান্ডার / ইউজার):' : 'Your Commander Name:'}
            </label>
            <input
              type="text"
              value={commanderName}
              onChange={(e) => setCommanderName(e.target.value)}
              placeholder="e.g. Adil..."
              className="w-full bg-black/70 border border-cyan-500/50 rounded-lg px-3 py-2 text-sm text-cyan-100 placeholder-gray-600 focus:outline-none focus:border-cyan-300 font-mono-tech"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-cyan-500/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 text-xs font-bold transition"
            >
              {language === 'bn' ? 'বাতিল' : 'CANCEL'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold tracking-wider transition shadow-[0_0_12px_rgba(0,229,255,0.4)]"
            >
              {language === 'bn' ? 'সংরক্ষণ করুন' : 'SAVE NAME'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
