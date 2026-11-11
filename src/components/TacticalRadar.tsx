import React, { useState, useEffect } from 'react';
import { Radio, Crosshair, Shield, AlertTriangle } from 'lucide-react';
import { ThreatTarget } from '../types/jarvis';
import { soundEffects } from '../utils/audioEffects';

interface TacticalRadarProps {
  language: 'en' | 'bn';
  onTargetLocked?: (target: ThreatTarget) => void;
}

export const TacticalRadar: React.FC<TacticalRadarProps> = ({ language, onTargetLocked }) => {
  const [rangeKm, setRangeKm] = useState<number>(50);
  const [targets, setTargets] = useState<ThreatTarget[]>([
    { id: '1', label: 'VERONICA-SAT', distanceKm: 42, bearingDeg: 45, altitudeM: 350000, threatLevel: 'friendly', locked: false },
    { id: '2', label: 'QUINJET-04', distanceKm: 18, bearingDeg: 135, altitudeM: 8200, threatLevel: 'friendly', locked: false },
    { id: '3', label: 'BOGEY-LEVIATHAN', distanceKm: 28, bearingDeg: 280, altitudeM: 3400, threatLevel: 'hostile', locked: false },
    { id: '4', label: 'DRONE-SWARM', distanceKm: 12, bearingDeg: 210, altitudeM: 1200, threatLevel: 'hostile', locked: false },
  ]);

  const [selectedTarget, setSelectedTarget] = useState<ThreatTarget | null>(null);

  // Subtle target movement simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setTargets((prev) =>
        prev.map((t) => ({
          ...t,
          bearingDeg: (t.bearingDeg + (t.threatLevel === 'hostile' ? 0.6 : 0.2)) % 360,
          distanceKm: Math.max(5, +(t.distanceKm + (Math.random() * 0.4 - 0.2)).toFixed(1)),
        }))
      );
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const handleLockTarget = (target: ThreatTarget) => {
    soundEffects.playTargetLock();
    const updated = { ...target, locked: !target.locked };
    setSelectedTarget(updated);
    setTargets((prev) => prev.map((t) => (t.id === target.id ? updated : t)));
    if (onTargetLocked) onTargetLocked(updated);
  };

  return (
    <div className="bg-[#050e1a]/85 border border-cyan-500/30 rounded-xl p-4 hud-glow relative flex flex-col justify-between">
      {/* Radar Header */}
      <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20 mb-3 font-mono-tech text-xs">
        <div className="flex items-center gap-2 text-cyan-300">
          <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="font-bold tracking-wider">
            {language === 'bn' ? 'ট্যাকটিকাল রাডার স্ক্যানার' : 'TACTICAL RADAR'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {[15, 50, 100].map((r) => (
            <button
              key={r}
              onClick={() => {
                soundEffects.playBeep(700);
                setRangeKm(r);
              }}
              className={`px-1.5 py-0.5 rounded text-[10px] border transition ${
                rangeKm === r
                  ? 'bg-cyan-500/30 text-cyan-300 border-cyan-400 font-bold'
                  : 'bg-black/40 text-gray-400 border-gray-700 hover:text-cyan-400'
              }`}
            >
              {r}KM
            </button>
          ))}
        </div>
      </div>

      {/* Radar Display Canvas / SVG */}
      <div className="relative w-full aspect-square max-w-[260px] mx-auto flex items-center justify-center">
        {/* Concentric distance rings */}
        <div className="absolute inset-0 rounded-full border border-cyan-500/20" />
        <div className="absolute inset-[18%] rounded-full border border-cyan-500/30" />
        <div className="absolute inset-[36%] rounded-full border border-cyan-500/40" />
        <div className="absolute inset-[54%] rounded-full border border-cyan-500/30" />

        {/* Crosshair axis lines */}
        <div className="absolute inset-x-0 top-1/2 h-px bg-cyan-500/30" />
        <div className="absolute inset-y-0 left-1/2 w-px bg-cyan-500/30" />

        {/* 360-Degree Rotating Beam */}
        <div className="absolute inset-0 rounded-full overflow-hidden animate-radar pointer-events-none">
          <div
            className="w-1/2 h-1/2 absolute top-0 right-0 origin-bottom-left"
            style={{
              background: 'conic-gradient(from 0deg, rgba(0, 229, 255, 0.45) 0deg, transparent 65deg)',
            }}
          />
        </div>

        {/* Center Point (Stark Mark 85 Position) */}
        <div className="w-4 h-4 rounded-full bg-cyan-400 border-2 border-white shadow-[0_0_10px_#00e5ff] z-10 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-[#040911]" />
        </div>

        {/* Target Blips */}
        {targets.map((target) => {
          // Calculate radar relative position
          const rad = (target.bearingDeg - 90) * (Math.PI / 180);
          const distNormalized = Math.min(1, target.distanceKm / rangeKm);
          const radiusPx = 110 * distNormalized;
          const x = radiusPx * Math.cos(rad);
          const y = radiusPx * Math.sin(rad);

          const isHostile = target.threatLevel === 'hostile';
          const isSelected = selectedTarget?.id === target.id;

          return (
            <div
              key={target.id}
              onClick={() => handleLockTarget(target)}
              className="absolute z-20 cursor-pointer group transition-transform hover:scale-125"
              style={{
                transform: `translate(${x}px, ${y}px)`,
              }}
              title={`${target.label} (${target.distanceKm}km)`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border transition-all ${
                  isHostile
                    ? 'bg-red-500/40 border-red-400 text-red-300 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse'
                    : 'bg-emerald-500/40 border-emerald-400 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                } ${isSelected ? 'ring-2 ring-white scale-125' : ''}`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    isHostile ? 'bg-red-300' : 'bg-emerald-300'
                  }`}
                />
              </div>

              {/* Tag tooltip label */}
              <div className="hidden group-hover:block absolute left-4 -top-2 whitespace-nowrap bg-black/90 px-1.5 py-0.5 rounded border border-cyan-500/40 text-[9px] font-mono-tech text-white pointer-events-none z-30">
                {target.label} • {target.distanceKm}km
              </div>
            </div>
          );
        })}
      </div>

      {/* Target Details Card */}
      <div className="mt-3 bg-black/50 border border-cyan-500/20 rounded-lg p-2 font-mono-tech text-[11px]">
        {selectedTarget ? (
          <div className="flex items-center justify-between">
            <div>
              <span className="text-gray-400 text-[10px] block">
                {language === 'bn' ? 'টার্গেট লক করা হয়েছে' : 'TARGET LOCKED'}
              </span>
              <span className={`font-bold ${selectedTarget.threatLevel === 'hostile' ? 'text-red-400' : 'text-emerald-400'}`}>
                {selectedTarget.label}
              </span>
              <span className="text-gray-400 text-[10px] ml-2">
                {selectedTarget.distanceKm}km / {selectedTarget.bearingDeg}°
              </span>
            </div>
            <button
              onClick={() => handleLockTarget(selectedTarget)}
              className="px-2 py-1 rounded bg-red-600/30 hover:bg-red-600/50 text-red-300 border border-red-500/40 text-[10px] font-bold"
            >
              {language === 'bn' ? 'লক মুক্ত' : 'UNLOCK'}
            </button>
          </div>
        ) : (
          <div className="text-center text-gray-500 text-[10px] py-1">
            {language === 'bn'
              ? 'রাডারে কোনো লক্ষ্যবস্তুতে চাপ দিয়ে লক করুন'
              : 'Tap any radar blip to acquire tactical lock'}
          </div>
        )}
      </div>
    </div>
  );
};
