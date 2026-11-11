import React, { useState, useEffect, useRef } from 'react';
import { Crosshair, Flame, Target, Trophy, RotateCcw } from 'lucide-react';
import { soundEffects } from '../utils/audioEffects';
import { phoneHardware } from '../utils/phoneHardwareController';
import confetti from 'canvas-confetti';

interface TargetPracticeProps {
  language: 'en' | 'bn';
  onRepulsorFired?: () => void;
}

interface Drone {
  id: number;
  x: number; // percentage
  y: number; // percentage
  vx: number;
  vy: number;
  hp: number;
  type: 'chitauri' | 'drone' | 'hammer';
}

export const TargetPractice: React.FC<TargetPracticeProps> = ({
  language,
  onRepulsorFired,
}) => {
  const [score, setScore] = useState<number>(0);
  const [crosshairPos, setCrosshairPos] = useState({ x: 50, y: 50 });
  const [drones, setDrones] = useState<Drone[]>([
    { id: 1, x: 25, y: 30, vx: 0.6, vy: 0.4, hp: 100, type: 'chitauri' },
    { id: 2, x: 75, y: 40, vx: -0.5, vy: 0.3, hp: 100, type: 'drone' },
    { id: 3, x: 50, y: 65, vx: 0.4, vy: -0.6, hp: 100, type: 'hammer' },
  ]);
  const [isFiring, setIsFiring] = useState(false);
  const hudRef = useRef<HTMLDivElement>(null);

  // Drone movement animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setDrones((prev) =>
        prev.map((d) => {
          let nx = d.x + d.vx;
          let ny = d.y + d.vy;
          let nvx = d.vx;
          let nvy = d.vy;

          if (nx < 15 || nx > 85) nvx = -nvx;
          if (ny < 15 || ny > 85) nvy = -nvy;

          return {
            ...d,
            x: Math.max(10, Math.min(90, nx)),
            y: Math.max(10, Math.min(90, ny)),
            vx: nvx,
            vy: nvy,
          };
        })
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Aim crosshair with mouse / touch or phone tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hudRef.current) return;
    const rect = hudRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCrosshairPos({ x, y });
  };

  const handleFireRepulsor = () => {
    if (isFiring) return;
    setIsFiring(true);

    // Audio SFX & Phone Haptic Vibration
    soundEffects.playRepulsorCharge();
    setTimeout(() => {
      soundEffects.playRepulsorBlast();
      phoneHardware.vibrate([100, 50, 150]);
    }, 250);

    // Check hit against drones within crosshair threshold
    setTimeout(() => {
      setDrones((prev) => {
        let hitMade = false;
        const next = prev.map((d) => {
          const dx = d.x - crosshairPos.x;
          const dy = d.y - crosshairPos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 18) {
            hitMade = true;
            try {
              confetti({
                particleCount: 25,
                spread: 60,
                origin: { x: crosshairPos.x / 100, y: crosshairPos.y / 100 },
                colors: ['#00e5ff', '#f59e0b', '#ffffff'],
              });
            } catch {}
            return {
              ...d,
              x: Math.random() * 70 + 15,
              y: Math.random() * 70 + 15,
              hp: 100,
            };
          }
          return d;
        });

        if (hitMade) {
          setScore((s) => s + 100);
        }
        return next;
      });

      setIsFiring(false);
      if (onRepulsorFired) onRepulsorFired();
    }, 450);
  };

  return (
    <div className="bg-[#050e1a]/85 border border-cyan-500/30 rounded-xl p-4 hud-glow flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20 mb-3 font-mono-tech text-xs">
        <div className="flex items-center gap-2 text-cyan-300">
          <Crosshair className="w-4 h-4 text-red-400" />
          <span className="font-bold tracking-wider">
            {language === 'bn' ? 'রিপালসর টার্গেটিং রেটিকল' : 'REPULSOR TARGETING HUD'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
            <Trophy className="w-3 h-3" />
            {score} {language === 'bn' ? 'পয়েন্ট' : 'PTS'}
          </span>
          <button
            onClick={() => setScore(0)}
            className="p-1 text-gray-400 hover:text-white"
            title="Reset Score"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Combat Viewport */}
      <div
        ref={hudRef}
        onMouseMove={handleMouseMove}
        onClick={handleFireRepulsor}
        className="relative w-full h-56 sm:h-64 rounded-lg bg-black/70 border border-cyan-500/40 overflow-hidden cursor-crosshair stark-grid select-none"
      >
        {/* Hologram Corner Brackets */}
        <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
        <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

        {/* Repulsor Plasma Shockwave Blast Animation */}
        {isFiring && (
          <div
            className="absolute z-30 pointer-events-none flex items-center justify-center animate-ping"
            style={{
              left: `${crosshairPos.x}%`,
              top: `${crosshairPos.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="w-24 h-24 rounded-full bg-cyan-300 blur-md opacity-90" />
            <div className="w-12 h-12 rounded-full bg-white shadow-[0_0_20px_#ffffff]" />
          </div>
        )}

        {/* Drones to shoot */}
        {drones.map((d) => (
          <div
            key={d.id}
            className="absolute z-10 transition-transform duration-75 pointer-events-none"
            style={{
              left: `${d.x}%`,
              top: `${d.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="w-8 h-8 rounded-full border-2 border-red-500/80 bg-red-950/40 flex items-center justify-center animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.6)]">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            </div>
            <span className="text-[9px] font-mono-tech text-red-300 block text-center mt-1">
              {d.type.toUpperCase()}
            </span>
          </div>
        ))}

        {/* Crosshair Follower */}
        <div
          className="absolute z-20 pointer-events-none"
          style={{
            left: `${crosshairPos.x}%`,
            top: `${crosshairPos.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="relative w-12 h-12 rounded-full border border-cyan-400 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-ping" />
            <div className="absolute inset-x-0 top-1/2 h-px bg-cyan-400/80" />
            <div className="absolute inset-y-0 left-1/2 w-px bg-cyan-400/80" />
          </div>
        </div>

        {/* Action Callout */}
        <div className="absolute bottom-2 inset-x-0 text-center pointer-events-none">
          <span className="text-[10px] font-mono-tech tracking-wider text-cyan-300 bg-black/80 px-2 py-0.5 rounded border border-cyan-500/30">
            {language === 'bn'
              ? 'স্ক্রিনে লক্ষ্য করে ক্লিক করুন বা বলুন "রিপালসর ফায়ার"'
              : 'AIM & CLICK HUD OR SAY "FIRE REPULSOR"'}
          </span>
        </div>
      </div>

      {/* Trigger Button */}
      <div className="mt-3">
        <button
          onClick={handleFireRepulsor}
          disabled={isFiring}
          className="w-full py-2.5 rounded-lg bg-gradient-to-r from-red-600 via-orange-600 to-red-600 hover:from-red-500 hover:to-orange-500 text-white font-orbitron font-bold text-xs tracking-wider shadow-[0_0_15px_rgba(239,68,68,0.5)] transition active:scale-95 flex items-center justify-center gap-2 border border-red-400/40"
        >
          <Flame className="w-4 h-4" />
          <span>
            {isFiring
              ? (language === 'bn' ? 'ক্যাপাসিটর ডিসচার্জ হচ্ছে...' : 'DISCHARGING REPULSOR...')
              : (language === 'bn' ? 'রিপালসর ফায়ার কর' : 'DISCHARGE REPULSOR BLAST')}
          </span>
        </button>
      </div>
    </div>
  );
};
