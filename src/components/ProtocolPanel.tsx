import React, { useState } from 'react';
import { ShieldAlert, Zap, Skull, Moon, Flame, CheckCircle2, AlertOctagon } from 'lucide-react';
import { Protocol } from '../types/jarvis';
import { soundEffects } from '../utils/audioEffects';

interface ProtocolPanelProps {
  language: 'en' | 'bn';
  onActivateProtocol: (protocolId: string) => void;
  activeProtocol: string | null;
}

export const ProtocolPanel: React.FC<ProtocolPanelProps> = ({
  language,
  onActivateProtocol,
  activeProtocol,
}) => {
  const [protocols] = useState<Protocol[]>([
    {
      id: 'house_party',
      name: 'House Party Protocol',
      code: 'STARK-SEC-PARTY-7',
      description: language === 'bn' ? 'সিলভার সেঞ্চুরিয়ন, হার্টব্রেকার এবং ইগর স্বয়ংক্রিয় আর্মার আহ্বান।' : 'Deploys autonomous Iron Legion: Silver Centurion, Heartbreaker, Igor, Bones.',
      status: 'standby',
      requiresConfirm: false,
    },
    {
      id: 'veronica',
      name: 'Veronica / Hulkbuster',
      code: 'ORBITAL-HULK-CAGE',
      description: language === 'bn' ? 'নিম্ন কক্ষপথের স্যাটেলাইট থেকে ভারী হাল্কবাস্টার আর্মার ড্রপ।' : 'Orbital weapons platform drops heavy kinetic dampener Hulkbuster armor.',
      status: 'standby',
      requiresConfirm: false,
    },
    {
      id: 'stealth_ops',
      name: 'Stealth Ops Mode',
      code: 'RADAR-ABSORB-REFRACT',
      description: language === 'bn' ? 'রাডার প্রতিরোধী ন্যানোটেক ম্যাট্রিক্স এবং নীরব থ্রাস্টার।' : 'Minimizes thermal & acoustic signature; radar absorbent carbon nanotech.',
      status: 'standby',
      requiresConfirm: false,
    },
    {
      id: 'combat_overdrive',
      name: 'Combat Overdrive',
      code: 'FLUX-MAX-OUTPUT',
      description: language === 'bn' ? 'রিঅ্যাক্টরের ৮৫% শক্তি অস্ত্র এবং গতিতে স্থানান্তর।' : 'Shunts 85% of core reserves into plasma repulsors and supersonic thrusters.',
      status: 'standby',
      requiresConfirm: false,
    },
    {
      id: 'clean_slate',
      name: 'Clean Slate Protocol',
      code: 'FAILSAFE-CHARGES-ARMED',
      description: language === 'bn' ? 'নিরাপত্তা মাইক্রো-বিস্ফোরণ দ্বারা সহায়ক আর্মার ধ্বংস।' : 'Security fail-safe detonation of auxiliary armor units. Permanent override.',
      status: 'standby',
      requiresConfirm: true,
    },
  ]);

  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const handleTrigger = (proto: Protocol) => {
    if (proto.requiresConfirm && confirmingId !== proto.id) {
      soundEffects.playProtocolAlert();
      setConfirmingId(proto.id);
      return;
    }

    soundEffects.playProtocolAlert();
    setConfirmingId(null);
    onActivateProtocol(proto.id);
  };

  return (
    <div className="bg-[#050e1a]/85 border border-cyan-500/30 rounded-xl p-4 hud-glow flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20 mb-3 font-mono-tech text-xs">
        <div className="flex items-center gap-2 text-cyan-300">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span className="font-bold tracking-wider">
            {language === 'bn' ? 'স্টার্ক ডিফেন্স প্রোটোকল' : 'STARK DEFENSE PROTOCOLS'}
          </span>
        </div>
        <span className="text-[10px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
          {language === 'bn' ? 'এনক্রিপ্টেড স্যাটেলাইট লিঙ্ক' : 'VERONICA SATELLITE LINK'}
        </span>
      </div>

      {/* Protocols Grid */}
      <div className="space-y-2.5 font-mono-tech text-xs">
        {protocols.map((proto) => {
          const isActive = activeProtocol === proto.id;
          const isConfirming = confirmingId === proto.id;

          let icon = <Zap className="w-4 h-4" />;
          if (proto.id === 'house_party') icon = <Flame className="w-4 h-4 text-orange-400" />;
          if (proto.id === 'veronica') icon = <ShieldAlert className="w-4 h-4 text-cyan-400" />;
          if (proto.id === 'stealth_ops') icon = <Moon className="w-4 h-4 text-sky-400" />;
          if (proto.id === 'combat_overdrive') icon = <Zap className="w-4 h-4 text-amber-400 animate-pulse" />;
          if (proto.id === 'clean_slate') icon = <Skull className="w-4 h-4 text-red-500" />;

          return (
            <div
              key={proto.id}
              className={`p-2.5 rounded-lg border transition-all ${
                isActive
                  ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                  : 'bg-black/40 border-cyan-500/20 text-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {icon}
                  <span className="font-bold text-white text-xs sm:text-sm">{proto.name}</span>
                </div>
                <button
                  onClick={() => handleTrigger(proto)}
                  className={`px-3 py-1 rounded text-[10px] font-bold tracking-wider uppercase transition shadow-sm active:scale-95 border ${
                    isConfirming
                      ? 'bg-red-600 text-white border-red-400 animate-pulse'
                      : isActive
                      ? 'bg-emerald-600 text-white border-emerald-400'
                      : 'bg-cyan-600/30 hover:bg-cyan-600 text-cyan-200 border-cyan-500/40 hover:text-white'
                  }`}
                >
                  {isConfirming
                    ? (language === 'bn' ? 'নিশ্চিত করুন?' : 'CONFIRM?')
                    : isActive
                    ? (language === 'bn' ? 'সক্রিয় ✓' : 'ACTIVE ✓')
                    : (language === 'bn' ? 'চালু করুন' : 'ENGAGE')}
                </button>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed pl-6">
                {proto.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
