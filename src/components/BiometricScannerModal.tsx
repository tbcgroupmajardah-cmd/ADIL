import React, { useState, useEffect, useRef } from 'react';
import { 
  Fingerprint, 
  Eye, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  X, 
  RefreshCw, 
  Lock, 
  Unlock 
} from 'lucide-react';
import { soundEffects } from '../utils/audioEffects';
import { phoneHardware } from '../utils/phoneHardwareController';
import { jarvisVoice } from '../utils/speechVoice';
import confetti from 'canvas-confetti';

interface BiometricScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'bn';
  commanderName: string;
  assistantName: string;
  onAccessGranted?: () => void;
}

export const BiometricScannerModal: React.FC<BiometricScannerModalProps> = ({
  isOpen,
  onClose,
  language,
  commanderName,
  assistantName,
  onAccessGranted,
}) => {
  const [scanType, setScanType] = useState<'fingerprint' | 'retinal'>('fingerprint');
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'granted' | 'denied'>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [simulatedFailure, setSimulatedFailure] = useState(false);
  const scanTimerRef = useRef<any>(null);
  const audioIntervalRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      resetScan();
    }
  }, [isOpen]);

  const resetScan = () => {
    if (scanTimerRef.current) clearInterval(scanTimerRef.current);
    if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    setScanStatus('idle');
    setProgress(0);
    setSimulatedFailure(false);
  };

  const startScan = (forceDenied = false) => {
    resetScan();
    setScanStatus('scanning');
    setSimulatedFailure(forceDenied);

    soundEffects.playBiometricScan();
    phoneHardware.vibrate([50, 40, 70]);

    // Pulsing audio chirps during scanning
    audioIntervalRef.current = setInterval(() => {
      soundEffects.playBiometricScan();
      phoneHardware.vibrate(40);
    }, 280);

    let current = 0;
    scanTimerRef.current = setInterval(() => {
      current += 4;
      setProgress(Math.min(100, current));

      if (current >= 100) {
        clearInterval(scanTimerRef.current);
        clearInterval(audioIntervalRef.current);

        if (forceDenied) {
          // Access Denied
          setScanStatus('denied');
          soundEffects.playAccessDenied();
          phoneHardware.vibrate([150, 80, 200, 80, 300]);

          const msg = language === 'bn'
            ? `অ্যাক্সেস প্রত্যাখ্যান করা হয়েছে! অজ্ঞাত বায়োমেট্রিক সিগনেচার। নিরাপত্তা প্রোটোকল সক্রিয়।`
            : `Access denied. Unrecognized biometric signature. Security counter-measures armed.`;
          jarvisVoice.speak(msg, language);
        } else {
          // Access Granted
          setScanStatus('granted');
          soundEffects.playAccessGranted();
          phoneHardware.vibrate([100, 50, 150]);

          try {
            confetti({
              particleCount: 40,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#00e5ff', '#10b981', '#ffffff'],
            });
          } catch {}

          const msg = language === 'bn'
            ? `পরিচয় নিশ্চিত: কমান্ডার ${commanderName}। লেভেল ১০ নিরাপত্তা অনুমোদন প্রদান করা হলো।`
            : `Identity confirmed: Commander ${commanderName}. Level 10 security clearance granted.`;
          jarvisVoice.speak(msg, language);

          if (onAccessGranted) onAccessGranted();
        }
      }
    }, 60);
  };

  if (!isOpen) return null;

  const isScanning = scanStatus === 'scanning';
  const isGranted = scanStatus === 'granted';
  const isDenied = scanStatus === 'denied';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className={`w-full max-w-md bg-[#040e1b] border-2 rounded-2xl p-5 shadow-[0_0_45px_rgba(0,229,255,0.4)] transition-colors duration-500 ${
        isGranted
          ? 'border-emerald-400 shadow-[0_0_50px_rgba(16,185,129,0.5)]'
          : isDenied
          ? 'border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.6)]'
          : 'border-cyan-400'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30 mb-4">
          <div className="flex items-center gap-2">
            {isGranted ? (
              <Unlock className="w-5 h-5 text-emerald-400 animate-pulse" />
            ) : isDenied ? (
              <Lock className="w-5 h-5 text-red-500 animate-pulse" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            )}
            <h3 className="font-orbitron font-bold text-white text-sm sm:text-base tracking-wider">
              {language === 'bn' ? 'স্টার্ক বায়োমেট্রিক সিকিউরিটি স্ক্যানার' : 'STARK BIOMETRIC SECURITY SCANNER'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scan Type Selector (Fingerprint vs Retinal) */}
        <div className="grid grid-cols-2 gap-2 mb-4 font-mono-tech text-xs">
          <button
            onClick={() => {
              soundEffects.playBeep(750);
              setScanType('fingerprint');
              resetScan();
            }}
            disabled={isScanning}
            className={`py-2 px-3 rounded-lg border flex items-center justify-center gap-2 transition ${
              scanType === 'fingerprint'
                ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400 font-bold shadow-[0_0_10px_rgba(0,229,255,0.3)]'
                : 'bg-black/40 text-gray-400 border-gray-800 hover:border-gray-700'
            }`}
          >
            <Fingerprint className="w-4 h-4 text-cyan-400" />
            <span>{language === 'bn' ? 'ফিঙ্গারপ্রিন্ট স্ক্যান' : 'FINGERPRINT'}</span>
          </button>
          <button
            onClick={() => {
              soundEffects.playBeep(750);
              setScanType('retinal');
              resetScan();
            }}
            disabled={isScanning}
            className={`py-2 px-3 rounded-lg border flex items-center justify-center gap-2 transition ${
              scanType === 'retinal'
                ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400 font-bold shadow-[0_0_10px_rgba(0,229,255,0.3)]'
                : 'bg-black/40 text-gray-400 border-gray-800 hover:border-gray-700'
            }`}
          >
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>{language === 'bn' ? 'রেটিনা স্ক্যান' : 'RETINAL SCAN'}</span>
          </button>
        </div>

        {/* Interactive Hologram Scanning Viewport */}
        <div
          onClick={() => {
            if (scanStatus === 'idle') {
              startScan(false);
            }
          }}
          className={`relative w-full h-56 rounded-xl border flex flex-col items-center justify-center overflow-hidden cursor-pointer select-none transition-all stark-grid ${
            isGranted
              ? 'bg-emerald-950/20 border-emerald-400/80'
              : isDenied
              ? 'bg-red-950/20 border-red-500/80'
              : isScanning
              ? 'bg-cyan-950/30 border-cyan-300 shadow-inner'
              : 'bg-black/60 border-cyan-500/40 hover:border-cyan-300'
          }`}
          title={language === 'bn' ? 'স্ক্যান শুরু করতে চাপুন' : 'Click to scan biometrics'}
        >
          {/* Corner brackets */}
          <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-cyan-400" />
          <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-cyan-400" />
          <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-cyan-400" />
          <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-cyan-400" />

          {/* Laser Scanline Beam moving up/down */}
          {isScanning && (
            <div
              className="absolute inset-x-0 h-1 bg-cyan-300 shadow-[0_0_15px_#00e5ff] z-20 pointer-events-none transition-all"
              style={{
                top: `${(Math.sin((progress / 100) * Math.PI * 4) * 0.5 + 0.5) * 85 + 5}%`,
              }}
            />
          )}

          {/* Central Biometric Graphic: Fingerprint vs Retinal Eye */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            {scanType === 'fingerprint' ? (
              <div className="relative">
                {/* SVG Detailed Fingerprint Ridges */}
                <svg className="w-28 h-28" viewBox="0 0 100 100">
                  <g
                    fill="none"
                    stroke={isGranted ? '#34d399' : isDenied ? '#ef4444' : isScanning ? '#00e5ff' : '#38bdf8'}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="filter drop-shadow-[0_0_6px_currentColor]"
                  >
                    <path d="M50,15 A35,35 0 0,0 20,45" opacity="0.4" />
                    <path d="M50,15 A35,35 0 0,1 80,45" opacity="0.4" />
                    <path d="M50,22 A28,28 0 0,0 26,50" opacity="0.6" />
                    <path d="M50,22 A28,28 0 0,1 74,50" opacity="0.6" />
                    <path d="M50,29 A21,21 0 0,0 32,55 C32,65 40,75 50,75 C60,75 68,65 68,55" opacity="0.8" />
                    <path d="M50,36 A14,14 0 0,0 38,52 C38,62 44,68 50,68 C56,68 62,62 62,52" />
                    <path d="M50,43 A7,7 0 0,0 44,50 C44,58 47,61 50,61 C53,61 56,58 56,50" strokeWidth="3" />
                    <path d="M50,50 L50,55" strokeWidth="3.5" />
                    {/* Outer loops */}
                    <path d="M22,60 C25,72 35,84 50,84 C65,84 75,72 78,60" opacity="0.5" />
                    <path d="M28,68 C34,78 41,88 50,88 C59,88 66,78 72,68" opacity="0.3" />
                  </g>
                </svg>

                {/* Animated scan ripples */}
                {isScanning && (
                  <div className="absolute inset-0 rounded-full border border-cyan-400 animate-ping opacity-75" />
                )}
              </div>
            ) : (
              /* Retinal Scan Eye */
              <div className="relative">
                <svg className="w-28 h-28" viewBox="0 0 100 100">
                  <g
                    fill="none"
                    stroke={isGranted ? '#34d399' : isDenied ? '#ef4444' : isScanning ? '#00e5ff' : '#38bdf8'}
                    strokeWidth="2"
                    className="filter drop-shadow-[0_0_6px_currentColor]"
                  >
                    {/* Outer Ocular Contour */}
                    <path d="M10,50 C25,25 75,25 90,50 C75,75 25,75 10,50 Z" strokeWidth="2.5" />
                    {/* Iris circle */}
                    <circle cx="50" cy="50" r="22" strokeWidth="2" strokeDasharray="6 3" className="animate-spin-slow" />
                    <circle cx="50" cy="50" r="14" strokeWidth="1.5" strokeDasharray="3 3" className="animate-spin-reverse-slow" />
                    {/* Pupil */}
                    <circle cx="50" cy="50" r="7" fill={isGranted ? '#34d399' : isDenied ? '#ef4444' : '#00e5ff'} />
                    {/* Retinal capillary grid */}
                    <line x1="50" y1="36" x2="50" y2="28" />
                    <line x1="50" y1="64" x2="50" y2="72" />
                    <line x1="36" y1="50" x2="28" y2="50" />
                    <line x1="64" y1="50" x2="72" y2="50" />
                  </g>
                </svg>

                {isScanning && (
                  <div className="absolute inset-0 rounded-full border border-cyan-400 animate-ping opacity-75" />
                )}
              </div>
            )}

            {/* Instruction / Status Label */}
            <span className={`text-[11px] font-mono-tech mt-2 font-bold tracking-wider uppercase ${
              isGranted
                ? 'text-emerald-400'
                : isDenied
                ? 'text-red-400'
                : isScanning
                ? 'text-cyan-300 animate-pulse'
                : 'text-gray-400'
            }`}>
              {isScanning
                ? (language === 'bn' ? `স্ক্যানিং চলছে... ${progress}%` : `ANALYZING BIOMETRICS... ${progress}%`)
                : isGranted
                ? (language === 'bn' ? 'পরিচয় নিশ্চিত ✓' : 'IDENTITY CONFIRMED ✓')
                : isDenied
                ? (language === 'bn' ? 'অ্যাক্সেস প্রত্যাখ্যান ✕' : 'SECURITY REJECTED ✕')
                : (language === 'bn' ? 'স্পর্শ করে স্ক্যান শুরু করুন' : 'TAP TO BEGIN SCAN')}
            </span>
          </div>

          {/* Progress Bar along bottom of scanner */}
          {isScanning && (
            <div className="absolute bottom-0 inset-x-0 h-1.5 bg-black">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-75"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Security Result Banner */}
        <div className={`mt-3 p-3 rounded-lg border font-mono-tech text-xs transition-colors ${
          isGranted
            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
            : isDenied
            ? 'bg-red-950/40 border-red-500/50 text-red-200'
            : 'bg-black/50 border-cyan-500/20 text-gray-300'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 block uppercase">
              {language === 'bn' ? 'নিরাপত্তা স্থিতি' : 'SECURITY CLEARANCE PROTOCOL'}
            </span>
            <span className="text-[10px] font-bold">
              {isGranted ? 'LEVEL 10: ALPHA' : isDenied ? 'FLAGGED: THREAT' : 'RESTRICTED'}
            </span>
          </div>

          <div className="mt-1 font-bold flex items-center gap-1.5">
            {isGranted ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>
                  {language === 'bn'
                    ? `অ্যাক্সেস অনুমোদিত: কমান্ডার ${commanderName}`
                    : `ACCESS GRANTED: COMMANDER ${commanderName.toUpperCase()}`}
                </span>
              </>
            ) : isDenied ? (
              <>
                <XCircle className="w-4 h-4 text-red-400" />
                <span>
                  {language === 'bn'
                    ? 'অ্যাক্সেস নামঞ্জুর: অজ্ঞাত ব্যক্তি'
                    : 'ACCESS DENIED: UNRECOGNIZED SIGNATURE'}
                </span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-cyan-400" />
                <span>
                  {language === 'bn'
                    ? 'আর্ক রিঅ্যাক্টর সিকিউরিটি স্ট্যান্ডবাই'
                    : 'ARC REACTOR BIOMETRIC LOCK ARMED'}
                </span>
              </>
            )}
          </div>

          {/* Metadata telemetry */}
          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/10 text-[10px] text-gray-400">
            <div>
              <span>SUBJECT: </span>
              <strong className="text-white">{isGranted ? commanderName : 'UNKNOWN'}</strong>
            </div>
            <div>
              <span>STATUS: </span>
              <strong className={isGranted ? 'text-emerald-300' : isDenied ? 'text-red-400' : 'text-cyan-300'}>
                {isGranted ? 'AUTHENTICATED' : isDenied ? 'RESTRICTED' : 'AWAITING INPUT'}
              </strong>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-4 grid grid-cols-2 gap-2 font-mono-tech text-xs">
          {/* Scan as Commander Adil (Access Granted flow) */}
          <button
            onClick={() => startScan(false)}
            disabled={isScanning}
            className="py-2.5 px-3 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold tracking-wider transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5 border border-cyan-400/40 shadow-[0_0_12px_rgba(0,229,255,0.3)]"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{language === 'bn' ? 'স্ক্যান করুন (অনুমোদন)' : 'AUTHENTICATE'}</span>
          </button>

          {/* Test Access Denied flow */}
          <button
            onClick={() => startScan(true)}
            disabled={isScanning}
            className="py-2.5 px-3 rounded-lg bg-red-950/60 hover:bg-red-900/60 text-red-300 font-bold tracking-wider transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5 border border-red-500/40 hover:text-white"
            title="Simulate unauthorized intruder scan"
          >
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>{language === 'bn' ? 'পরীক্ষামূলক নামঞ্জুর' : 'TEST DENIED'}</span>
          </button>
        </div>

        {/* Bottom Close Button */}
        <div className="mt-3 text-center">
          <button
            onClick={onClose}
            className="text-[11px] font-mono-tech text-gray-400 hover:text-cyan-300 transition"
          >
            {language === 'bn' ? 'স্ক্যানার বন্ধ করুন' : 'CLOSE BIOMETRIC SCANNER'}
          </button>
        </div>
      </div>
    </div>
  );
};
