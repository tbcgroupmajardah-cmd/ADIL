import React, { useState } from 'react';
import { 
  Smartphone, 
  Flashlight, 
  Battery, 
  BatteryCharging, 
  Eye, 
  EyeOff, 
  PhoneCall, 
  Vibrate, 
  Camera, 
  Radio, 
  CheckCircle2,
  X
} from 'lucide-react';
import { soundEffects } from '../utils/audioEffects';
import { phoneHardware } from '../utils/phoneHardwareController';

interface PhoneHardwareDeckProps {
  language: 'en' | 'bn';
  torchActive: boolean;
  onToggleTorch: () => void;
  batteryLevel: number | null;
  isCharging: boolean;
  wakeLockActive: boolean;
  onToggleWakeLock: () => void;
}

export const PhoneHardwareDeck: React.FC<PhoneHardwareDeckProps> = ({
  language,
  torchActive,
  onToggleTorch,
  batteryLevel,
  isCharging,
  wakeLockActive,
  onToggleWakeLock,
}) => {
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const handleTestVibrate = () => {
    soundEffects.playBeep(300);
    phoneHardware.vibrate([120, 60, 180]);
  };

  const handleOpenDialer = () => {
    soundEffects.playJarvisChime();
    phoneHardware.openDialer('911');
  };

  const handleToggleCamera = async () => {
    if (showCameraScanner) {
      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop());
        setCameraStream(null);
      }
      setShowCameraScanner(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        setCameraStream(stream);
        setShowCameraScanner(true);
        soundEffects.playTargetLock();
      } catch (err) {
        alert(language === 'bn' ? 'ক্যামেরা অনুমতি প্রয়োজন।' : 'Camera permission required for HUD optical scan.');
      }
    }
  };

  return (
    <div className="bg-[#050e1a]/85 border border-cyan-500/30 rounded-xl p-4 hud-glow relative overflow-hidden">
      {/* Deck Header */}
      <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20 mb-3 font-mono-tech text-xs">
        <div className="flex items-center gap-2 text-cyan-300">
          <Smartphone className="w-4 h-4 text-cyan-400" />
          <span className="font-bold tracking-wider">
            {language === 'bn' ? 'মোবাইল হার্ডওয়্যার কন্ট্রোল' : 'PHONE HARDWARE DECK'}
          </span>
        </div>
        <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
          {language === 'bn' ? 'হ্যান্ডস-ফ্রি নিয়ন্ত্রণ' : 'HANDS-FREE SYNCED'}
        </span>
      </div>

      {/* Control Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono-tech">
        {/* 1. Flashlight / Torch */}
        <button
          onClick={onToggleTorch}
          className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all ${
            torchActive
              ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
              : 'bg-black/40 border-cyan-500/20 text-gray-300 hover:border-cyan-500/50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Flashlight className={`w-5 h-5 ${torchActive ? 'text-amber-400 animate-pulse' : 'text-gray-400'}`} />
            <span className="text-[10px] font-bold">
              {torchActive ? (language === 'bn' ? 'চালু' : 'ON') : (language === 'bn' ? 'বন্ধ' : 'OFF')}
            </span>
          </div>
          <span className="font-bold text-white text-xs">
            {language === 'bn' ? 'টর্চ / ফ্ল্যাশলাইট' : 'Flashlight / Torch'}
          </span>
          <span className="text-[9px] text-gray-400 mt-1">
            {language === 'bn' ? '"টর্চ জ্বালাও"' : '"Turn on torch"'}
          </span>
        </button>

        {/* 2. Battery Telemetry */}
        <div className="p-3 rounded-lg border border-cyan-500/20 bg-black/40 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            {isCharging ? (
              <BatteryCharging className="w-5 h-5 text-emerald-400 animate-pulse" />
            ) : (
              <Battery className="w-5 h-5 text-cyan-400" />
            )}
            <span className="text-[11px] font-bold text-cyan-300">
              {batteryLevel !== null ? `${batteryLevel}%` : 'N/A'}
            </span>
          </div>
          <span className="font-bold text-white text-xs">
            {language === 'bn' ? 'ব্যাটারি পাওয়ার' : 'Battery Status'}
          </span>
          <span className="text-[9px] text-emerald-400/80 mt-1">
            {isCharging
              ? (language === 'bn' ? 'চার্জ হচ্ছে ⚡' : 'Charging ⚡')
              : (language === 'bn' ? 'অপ্টিমাইজড' : 'Optimal')}
          </span>
        </div>

        {/* 3. Screen Wake Lock (Hands-Free) */}
        <button
          onClick={onToggleWakeLock}
          className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all ${
            wakeLockActive
              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(0,229,255,0.4)]'
              : 'bg-black/40 border-cyan-500/20 text-gray-300 hover:border-cyan-500/50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            {wakeLockActive ? <Eye className="w-5 h-5 text-cyan-300" /> : <EyeOff className="w-5 h-5 text-gray-500" />}
            <span className="text-[10px] font-bold">
              {wakeLockActive ? (language === 'bn' ? 'সক্রিয়' : 'ACTIVE') : (language === 'bn' ? 'বন্ধ' : 'OFF')}
            </span>
          </div>
          <span className="font-bold text-white text-xs">
            {language === 'bn' ? 'স্ক্রিন ওয়েক-লক' : 'Screen Wake-Lock'}
          </span>
          <span className="text-[9px] text-gray-400 mt-1">
            {language === 'bn' ? '"স্ক্রিন অন রাখো"' : '"Keep screen on"'}
          </span>
        </button>

        {/* 4. Haptic Vibration Test */}
        <button
          onClick={handleTestVibrate}
          className="p-3 rounded-lg border border-cyan-500/20 bg-black/40 hover:bg-cyan-950/40 hover:border-cyan-500/50 text-left flex flex-col justify-between transition"
        >
          <div className="flex items-center justify-between mb-2">
            <Vibrate className="w-5 h-5 text-cyan-400" />
            <span className="text-[9px] text-cyan-300 bg-cyan-950 px-1 rounded">PULSE</span>
          </div>
          <span className="font-bold text-white text-xs">
            {language === 'bn' ? 'হ্যাপটিক কম্পন' : 'Haptic Vibration'}
          </span>
          <span className="text-[9px] text-gray-400 mt-1">
            {language === 'bn' ? '"ভাইব্রেট কর"' : '"Vibrate phone"'}
          </span>
        </button>

        {/* 5. Camera Optical HUD Scanner */}
        <button
          onClick={handleToggleCamera}
          className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all ${
            showCameraScanner
              ? 'bg-red-500/20 border-red-400 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
              : 'bg-black/40 border-cyan-500/20 text-gray-300 hover:border-cyan-500/50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Camera className={`w-5 h-5 ${showCameraScanner ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`} />
            <span className="text-[10px] font-bold">
              {showCameraScanner ? (language === 'bn' ? 'লাইভ' : 'LIVE') : (language === 'bn' ? 'স্ক্যান' : 'SCAN')}
            </span>
          </div>
          <span className="font-bold text-white text-xs">
            {language === 'bn' ? 'ক্যামেরা স্ক্যানার' : 'Camera HUD Scan'}
          </span>
          <span className="text-[9px] text-gray-400 mt-1">
            {language === 'bn' ? '"ক্যামেরা খোলো"' : '"Open camera"'}
          </span>
        </button>

        {/* 6. Phone Dialer */}
        <button
          onClick={handleOpenDialer}
          className="p-3 rounded-lg border border-cyan-500/20 bg-black/40 hover:bg-cyan-950/40 hover:border-cyan-500/50 text-left flex flex-col justify-between transition"
        >
          <div className="flex items-center justify-between mb-2">
            <PhoneCall className="w-5 h-5 text-emerald-400" />
            <span className="text-[9px] text-emerald-300 bg-emerald-950 px-1 rounded">COMMS</span>
          </div>
          <span className="font-bold text-white text-xs">
            {language === 'bn' ? 'ডায়ালার কল' : 'Emergency Dialer'}
          </span>
          <span className="text-[9px] text-gray-400 mt-1">
            {language === 'bn' ? '"কল কর"' : '"Make a call"'}
          </span>
        </button>
      </div>

      {/* Live Camera Scanner Viewport Modal */}
      {showCameraScanner && (
        <div className="mt-4 relative rounded-xl overflow-hidden border-2 border-cyan-400 shadow-[0_0_25px_rgba(0,229,255,0.4)] bg-black h-56 sm:h-72">
          {cameraStream && (
            <video
              autoPlay
              playsInline
              muted
              ref={(video) => {
                if (video && cameraStream) video.srcObject = cameraStream;
              }}
              className="w-full h-full object-cover"
            />
          )}

          {/* Hologram Reticle Overlay */}
          <div className="absolute inset-0 pointer-events-none stark-grid">
            {/* Corner brackets */}
            <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-cyan-400" />
            <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-cyan-400" />
            <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-cyan-400" />
            <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-cyan-400" />

            {/* Target Crosshairs */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border border-cyan-400/80 animate-ping" />
              <div className="absolute w-16 h-16 rounded-full border-2 border-cyan-300 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              </div>
            </div>

            {/* Tactical Feed Banner */}
            <div className="absolute top-3 inset-x-0 flex justify-center">
              <span className="bg-black/75 px-3 py-1 rounded text-[11px] font-mono-tech text-cyan-300 border border-cyan-500/40">
                {language === 'bn' ? 'অপটিক্যাল রিকনেসেন্স • লাইভ টার্গেটিং' : 'OPTICAL RECONNAISSANCE • LIVE TARGETING'}
              </span>
            </div>
          </div>

          {/* Close Scanner Button */}
          <button
            onClick={handleToggleCamera}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/80 text-white hover:text-red-400 border border-gray-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
