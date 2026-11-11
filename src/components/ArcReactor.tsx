import React, { useState } from 'react';
import { soundEffects } from '../utils/audioEffects';

interface ArcReactorProps {
  suitMode: string;
  powerDrawGJ: number;
  coreTempK: number;
  onReactorPulse?: () => void;
  onOpenBiometricScanner?: () => void;
  language: 'en' | 'bn';
}

export const ArcReactor: React.FC<ArcReactorProps> = ({
  suitMode,
  powerDrawGJ,
  coreTempK,
  onReactorPulse,
  onOpenBiometricScanner,
  language,
}) => {
  const [isPulsing, setIsPulsing] = useState(false);

  const handleCoreClick = () => {
    setIsPulsing(true);
    soundEffects.playBiometricScan();
    if (onReactorPulse) onReactorPulse();
    if (onOpenBiometricScanner) {
      onOpenBiometricScanner();
    }
    setTimeout(() => setIsPulsing(false), 900);
  };

  const isOverdrive = suitMode === 'overdrive';
  const isStealth = suitMode === 'stealth';

  const glowColor = isOverdrive
    ? '#ef4444'
    : isStealth
    ? '#38bdf8'
    : '#00e5ff';

  const ringColorClass = isOverdrive
    ? 'stroke-red-500'
    : isStealth
    ? 'stroke-sky-400'
    : 'stroke-cyan-400';

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      {/* Reactor Header */}
      <div className="flex items-center justify-between w-full max-w-xs mb-2 text-xs font-mono-tech tracking-wider uppercase">
        <span className="flex items-center gap-1 text-cyan-300">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          {language === 'bn' ? 'আর্ক রিঅ্যাক্টর কোর' : 'ARC REACTOR CORE'}
        </span>
        <span className={isOverdrive ? 'text-red-400 font-bold' : 'text-cyan-400'}>
          {powerDrawGJ.toFixed(2)} {language === 'bn' ? 'গিগাওয়াট' : 'GJ/s'}
        </span>
      </div>

      {/* Interactive Reactor Visualizer */}
      <div
        onClick={handleCoreClick}
        className="relative w-56 h-56 sm:w-64 sm:h-64 cursor-pointer select-none group transition-transform duration-300 hover:scale-105 active:scale-95"
        title={language === 'bn' ? 'আর্ক রিঅ্যাক্টরে ক্লিক করে শক্তি নির্গমন করুন' : 'Click to pulse Arc Reactor power'}
      >
        {/* Pulsing shockwave ring on click */}
        {isPulsing && (
          <div
            className="absolute inset-0 rounded-full border-2 border-cyan-300 animate-ping pointer-events-none opacity-80"
            style={{ borderColor: glowColor }}
          />
        )}

        {/* Ambient Glow */}
        <div
          className="absolute inset-4 rounded-full blur-2xl opacity-40 transition-all duration-500"
          style={{ backgroundColor: glowColor }}
        />

        {/* Outer Rotating Segmented Ring */}
        <svg
          className="absolute inset-0 w-full h-full animate-spin-slow"
          viewBox="0 0 200 200"
        >
          <circle
            cx="100"
            cy="100"
            r="92"
            fill="none"
            className={ringColorClass}
            strokeWidth="1.5"
            strokeDasharray="6 4"
            opacity="0.6"
          />
          <circle
            cx="100"
            cy="100"
            r="84"
            fill="none"
            className={ringColorClass}
            strokeWidth="2"
            strokeDasharray="28 14"
            opacity="0.8"
          />
        </svg>

        {/* Counter Rotating Ring with Dial Notches */}
        <svg
          className="absolute inset-0 w-full h-full animate-spin-reverse-slow"
          viewBox="0 0 200 200"
        >
          <circle
            cx="100"
            cy="100"
            r="74"
            fill="none"
            stroke={glowColor}
            strokeWidth="3"
            strokeDasharray="16 10 4 10"
            opacity="0.7"
          />
          {/* Radial Tick Lines */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
            <line
              key={deg}
              x1="100"
              y1="32"
              x2="100"
              y2="40"
              transform={`rotate(${deg} 100 100)`}
              stroke={glowColor}
              strokeWidth="2"
              opacity="0.85"
            />
          ))}
        </svg>

        {/* Center Golden / Blue Coils Ring (Mark 85 synthesized element) */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r="54"
            fill="rgba(4, 9, 17, 0.85)"
            stroke={glowColor}
            strokeWidth="4"
            className="filter drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]"
          />
          {/* 10 Copper/Electromagnetic Coils */}
          {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((deg) => (
            <rect
              key={deg}
              x="96"
              y="44"
              width="8"
              height="16"
              rx="2"
              transform={`rotate(${deg} 100 100)`}
              fill={isOverdrive ? '#f87171' : '#f59e0b'}
              stroke="#040911"
              strokeWidth="1"
              className="opacity-90"
            />
          ))}
        </svg>

        {/* Inner Glowing Vibranium Triangular Prism / Core */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
              isPulsing ? 'scale-125' : 'animate-pulse-core'
            }`}
          >
            {/* Hydro Arc Water Droplet Core Emitter with AS Monogram */}
            <svg className="w-16 h-16" viewBox="0 0 100 100">
              <path
                d="M50,12 C50,12 80,48 80,68 C80,84 66,94 50,94 C34,94 20,84 20,68 C20,48 50,12 50,12 Z"
                fill="none"
                stroke="#ffffff"
                strokeWidth="3.5"
                className="filter drop-shadow-[0_0_12px_#38bdf8]"
              />
              <path
                d="M50,20 C50,20 74,52 74,67 C74,80 63,88 50,88 C37,88 26,80 26,67 C26,52 50,20 50,20 Z"
                fill={glowColor}
                opacity="0.6"
              />
              {/* AS Monogram in Core */}
              <text
                x="50"
                y="74"
                textAnchor="middle"
                fill="#ffffff"
                fontFamily="'Orbitron', monospace, sans-serif"
                fontWeight="900"
                fontSize="28"
                letterSpacing="-2"
                className="filter drop-shadow-[0_0_6px_#ffffff]"
              >
                AS
              </text>
            </svg>
          </div>
        </div>

        {/* Biometric Scan Touch Prompt Badge */}
        <div className="absolute bottom-1 inset-x-0 text-center">
          <span className="text-[10px] font-mono-tech tracking-widest text-cyan-300 bg-black/80 px-2.5 py-0.5 rounded border border-cyan-400/50 shadow-[0_0_8px_rgba(0,229,255,0.4)] animate-pulse">
            {language === 'bn' ? 'বায়োমেট্রিক স্ক্যান // ক্লিক করুন' : 'BIOMETRIC SCAN // CLICK CORE'}
          </span>
        </div>
      </div>

      {/* Reactor Live Telemetry Pill */}
      <div className="mt-3 grid grid-cols-2 gap-3 w-full max-w-xs font-mono-tech text-[11px]">
        <div className="bg-[#050e1a]/80 border border-cyan-500/30 rounded px-2.5 py-1.5 flex flex-col">
          <span className="text-gray-400 text-[10px]">
            {language === 'bn' ? 'কোর তাপমাত্রা' : 'CORE TEMP'}
          </span>
          <span className="text-cyan-300 font-bold">{coreTempK} K</span>
        </div>
        <div className="bg-[#050e1a]/80 border border-cyan-500/30 rounded px-2.5 py-1.5 flex flex-col">
          <span className="text-gray-400 text-[10px]">
            {language === 'bn' ? 'ফ্লাক্স হারমোনিক্স' : 'FLUX HARMONIC'}
          </span>
          <span className="text-emerald-400 font-bold">99.8% STABLE</span>
        </div>
      </div>
    </div>
  );
};
