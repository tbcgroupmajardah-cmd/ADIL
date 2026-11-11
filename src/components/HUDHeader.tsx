import React from 'react';
import { 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Download, 
  ShieldCheck, 
  Zap, 
  Flashlight, 
  Sparkles,
  Smartphone
} from 'lucide-react';
import { soundEffects } from '../utils/audioEffects';

interface HUDHeaderProps {
  suitMode: string;
  isMuted: boolean;
  onToggleMute: () => void;
  isHandsFree: boolean;
  onToggleHandsFree: () => void;
  isInstantTalk: boolean;
  onToggleInstantTalk: () => void;
  language: 'en' | 'bn';
  onToggleLanguage: () => void;
  onOpenAPKModal: () => void;
  torchActive: boolean;
  onToggleTorch: () => void;
  batteryLevel: number | null;
  isCharging: boolean;
}

export const HUDHeader: React.FC<HUDHeaderProps> = ({
  suitMode,
  isMuted,
  onToggleMute,
  isHandsFree,
  onToggleHandsFree,
  isInstantTalk,
  onToggleInstantTalk,
  language,
  onToggleLanguage,
  onOpenAPKModal,
  torchActive,
  onToggleTorch,
  batteryLevel,
  isCharging,
}) => {
  return (
    <header className="w-full bg-[#040911]/90 border-b border-cyan-500/30 backdrop-blur-md px-3 py-2 z-30 sticky top-0">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Left: Brand & Adil Identity */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-cyan-950/40 border border-cyan-400/50 shadow-[0_0_12px_rgba(0,229,255,0.4)]">
            {/* Hydro Arc Reactor Water Drop Emblem with AS Monogram */}
            <svg className="w-7 h-7" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="46" fill="none" stroke="#00e5ff" strokeWidth="2.5" strokeDasharray="8 4" className="animate-spin-slow" />
              <path
                d="M50,14 C50,14 78,50 78,68 C78,82 65,92 50,92 C35,92 22,82 22,68 C22,50 50,14 50,14 Z"
                fill="url(#headerWaterGlow)"
                className="filter drop-shadow-[0_0_8px_#38bdf8]"
              />
              {/* AS Symbol Monogram */}
              <text
                x="50"
                y="74"
                textAnchor="middle"
                fill="#ffffff"
                fontFamily="'Orbitron', monospace, sans-serif"
                fontWeight="900"
                fontSize="26"
                letterSpacing="-2"
                className="filter drop-shadow-[0_0_4px_#00e5ff]"
              >
                AS
              </text>
              <defs>
                <linearGradient id="headerWaterGlow" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="40%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#0284c7" />
                </linearGradient>
              </defs>
            </svg>
            {isHandsFree && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse border-2 border-[#040911]" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-orbitron font-extrabold tracking-wider text-base sm:text-lg text-white text-glow">
                ADIL <span className="text-cyan-400 text-glow">J.A.R.V.I.S.</span>
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono-tech tracking-wider bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                MARK LXXXV
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono-tech text-cyan-400/80">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {language === 'bn' ? 'অফলাইন এআই সক্রিয়' : '100% OFFLINE AI'}
              </span>
              <span>•</span>
              <span className="text-gray-400">
                {language === 'bn' ? `মোড: ${suitMode.toUpperCase()}` : `MODE: ${suitMode.toUpperCase()}`}
              </span>
              {batteryLevel !== null && (
                <>
                  <span className="hidden md:inline">•</span>
                  <span className="hidden md:inline text-amber-300">
                    BATT: {batteryLevel}%{isCharging ? '⚡' : ''}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Center / Right Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-mono-tech">
          {/* Hands-Free Voice Control Toggle */}
          <button
            onClick={() => {
              soundEffects.playBeep(isHandsFree ? 440 : 880);
              onToggleHandsFree();
            }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md border transition-all ${
              isHandsFree
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_10px_rgba(0,229,255,0.4)] animate-pulse'
                : 'bg-black/40 text-gray-400 border-gray-700 hover:text-cyan-300 hover:border-cyan-500/50'
            }`}
            title={language === 'bn' ? 'হ্যান্ডস-ফ্রি ভয়েস কমান্ড অন/অফ' : 'Hands-Free Always-Listening Voice Control'}
          >
            {isHandsFree ? <Mic className="w-3.5 h-3.5 text-cyan-300" /> : <MicOff className="w-3.5 h-3.5" />}
            <span className="font-bold tracking-wider hidden sm:inline">
              {language === 'bn' ? (isHandsFree ? 'হ্যান্ডস-ফ্রি অন' : 'হ্যান্ডস-ফ্রি') : (isHandsFree ? 'HANDS-FREE ON' : 'HANDS-FREE')}
            </span>
          </button>

          {/* Instant Talk Toggle Button */}
          <button
            onClick={() => {
              soundEffects.playBeep(isInstantTalk ? 500 : 960);
              onToggleInstantTalk();
            }}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-md border transition-all ${
              isInstantTalk
                ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                : 'bg-black/40 text-gray-400 border-gray-700 hover:text-amber-300'
            }`}
            title={language === 'bn' ? 'তাত্ক্ষণিক উত্তর মোড (জিরো ল্যাটেন্সি)' : 'Instant Talking Mode (Zero Latency)'}
          >
            <Zap className={`w-3.5 h-3.5 ${isInstantTalk ? 'text-amber-400 animate-pulse' : ''}`} />
            <span className="font-bold tracking-wider hidden md:inline text-[10px]">
              {language === 'bn' ? (isInstantTalk ? 'ইনস্ট্যান্ট অন' : 'ইনস্ট্যান্ট') : (isInstantTalk ? 'INSTANT TALK' : 'INSTANT')}
            </span>
          </button>

          {/* Flashlight / Torch Quick Button */}
          <button
            onClick={() => {
              soundEffects.playBeep(700);
              onToggleTorch();
            }}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-md border transition-all flex items-center gap-1 ${
              torchActive
                ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                : 'bg-black/40 text-gray-400 border-gray-700 hover:text-amber-300 hover:border-amber-500/50'
            }`}
            title={language === 'bn' ? 'ফোনের ফ্ল্যাশলাইট অন/অফ' : 'Phone Torch / Flashlight'}
          >
            <Flashlight className="w-3.5 h-3.5" />
            <span className="hidden md:inline font-bold">
              {language === 'bn' ? 'টর্চ' : 'TORCH'}
            </span>
          </button>

          {/* Language Switcher (EN / বাংলা) */}
          <button
            onClick={() => {
              soundEffects.playBeep(920);
              onToggleLanguage();
            }}
            className="px-2 py-1.5 rounded-md bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60 transition flex items-center gap-1 font-bold"
            title="Toggle Language: English / বাংলা"
          >
            <span className={language === 'en' ? 'text-white' : 'text-gray-400'}>EN</span>
            <span className="text-gray-500">/</span>
            <span className={language === 'bn' ? 'text-amber-300 font-bold' : 'text-gray-400'}>বাং</span>
          </button>

          {/* Audio Mute / Unmute */}
          <button
            onClick={() => {
              soundEffects.playBeep(600);
              onToggleMute();
            }}
            className="p-1.5 rounded-md bg-black/40 border border-gray-700 text-gray-400 hover:text-cyan-300 hover:border-cyan-500/50 transition"
            title={isMuted ? 'Unmute SFX & Speech' : 'Mute SFX & Speech'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* APK / PWA Install Button */}
          <button
            onClick={() => {
              soundEffects.playJarvisChime();
              onOpenAPKModal();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs tracking-wider shadow-[0_0_12px_rgba(0,229,255,0.4)] transition active:scale-95 border border-cyan-300/40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'এপিকে ইনস্টল' : 'INSTALL APK'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
