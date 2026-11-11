import React, { useState } from 'react';
import { Shield, Cpu, Zap, Activity, CheckCircle, AlertTriangle } from 'lucide-react';
import { SubsystemStatus } from '../types/jarvis';
import { soundEffects } from '../utils/audioEffects';

interface SuitDiagnosticsProps {
  language: 'en' | 'bn';
  onReroutePower?: (subsystemId: string) => void;
}

export const SuitDiagnostics: React.FC<SuitDiagnosticsProps> = ({ language, onReroutePower }) => {
  const [subsystems, setSubsystems] = useState<SubsystemStatus[]>([
    { id: 'helmet', name: 'Nanotech Helmet & HUD', status: 'nominal', integrity: 99.8, powerAllocated: 15, description: 'Targeting optics, audio synthesizer, telepathic brainwave link' },
    { id: 'arc', name: 'Triangular Arc Reactor', status: 'nominal', integrity: 100, powerAllocated: 40, description: 'Palladium-free synthesized new element core generating 3.4 GW' },
    { id: 'repulsors', name: 'Dual Repulsor Gauntlets', status: 'nominal', integrity: 98.4, powerAllocated: 25, description: 'High-density plasma particle emitters with pulse beam amplifiers' },
    { id: 'thrusters', name: 'Flight Stabilizer Wings', status: 'nominal', integrity: 97.2, powerAllocated: 12, description: 'Back micro-thrusters delivering Mach 2.8 supersonic maneuverability' },
    { id: 'legs', name: 'Kinetic Shock Boots', status: 'nominal', integrity: 99.1, powerAllocated: 8, description: 'Impact dissipation and super-jump inertial dampening' },
  ]);

  const [selectedSubsystem, setSelectedSubsystem] = useState<SubsystemStatus>(subsystems[1]);

  const handleSelect = (sub: SubsystemStatus) => {
    soundEffects.playBeep(720);
    setSelectedSubsystem(sub);
  };

  const handleBoostPower = (subId: string) => {
    soundEffects.playRepulsorCharge();
    setSubsystems((prev) =>
      prev.map((s) => (s.id === subId ? { ...s, powerAllocated: Math.min(60, s.powerAllocated + 10) } : s))
    );
    if (onReroutePower) onReroutePower(subId);
  };

  return (
    <div className="bg-[#050e1a]/85 border border-cyan-500/30 rounded-xl p-4 hud-glow flex flex-col justify-between">
      {/* Diagnostics Header */}
      <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20 mb-3 font-mono-tech text-xs">
        <div className="flex items-center gap-2 text-cyan-300">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span className="font-bold tracking-wider">
            {language === 'bn' ? 'মার্ক ৮৫ আর্মার ডায়াগনস্টিক' : 'MARK LXXXV SCHEMATICS'}
          </span>
        </div>
        <span className="text-emerald-400 text-[10px] bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
          {language === 'bn' ? 'সিস্টেম অক্ষত ৯৯.৪%' : '99.4% INTEGRITY'}
        </span>
      </div>

      {/* Subsystem Hotspots List */}
      <div className="space-y-2 font-mono-tech text-xs">
        {subsystems.map((sub) => {
          const isSelected = selectedSubsystem.id === sub.id;
          return (
            <div
              key={sub.id}
              onClick={() => handleSelect(sub)}
              className={`p-2 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                isSelected
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(0,229,255,0.3)]'
                  : 'bg-black/40 border-cyan-500/20 text-gray-400 hover:text-cyan-300 hover:border-cyan-500/40'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-white text-[11px] sm:text-xs">{sub.name}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-cyan-400">{sub.integrity}%</span>
                <span className="text-amber-400 font-bold bg-amber-950/40 px-1 rounded">
                  {sub.powerAllocated}% PWR
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail & Reroute Power Card */}
      <div className="mt-3 bg-black/60 border border-cyan-500/30 rounded-lg p-3 font-mono-tech text-xs">
        <div className="flex items-center justify-between mb-1">
          <span className="text-cyan-300 font-bold text-xs">{selectedSubsystem.name}</span>
          <button
            onClick={() => handleBoostPower(selectedSubsystem.id)}
            className="px-2 py-1 rounded bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-[10px] font-bold tracking-wider shadow-sm transition active:scale-95"
          >
            {language === 'bn' ? '+১০% পাওয়ার দিন' : '+10% BOOST POWER'}
          </button>
        </div>
        <p className="text-[11px] text-gray-400 leading-relaxed mt-1">
          {selectedSubsystem.description}
        </p>
      </div>
    </div>
  );
};
