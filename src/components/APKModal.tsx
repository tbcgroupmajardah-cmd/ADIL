import React, { useState } from 'react';
import { 
  Download, 
  Smartphone, 
  CheckCircle2, 
  Share2, 
  ShieldCheck, 
  QrCode, 
  Copy, 
  ExternalLink, 
  X,
  FileCode
} from 'lucide-react';
import { soundEffects } from '../utils/audioEffects';

interface APKModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'bn';
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  onInstall: () => Promise<boolean>;
}

export const APKModal: React.FC<APKModalProps> = ({
  isOpen,
  onClose,
  language,
  isInstallable,
  isInstalled,
  isIOS,
  onInstall,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(currentUrl)}&color=00e5ff&bgcolor=040911`;

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      soundEffects.playBeep(900);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadManifest = () => {
    soundEffects.playBeep(800);
    const manifestData = {
      name: "Adil J.A.R.V.I.S. Iron Man OS",
      short_name: "Sahal JARVIS",
      start_url: "/",
      display: "standalone",
      background_color: "#040911",
      theme_color: "#040911",
      orientation: "portrait",
      icons: [
        { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
        { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" }
      ]
    };
    const blob = new Blob([JSON.stringify(manifestData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jarvis-manifest.webmanifest';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="w-full max-w-lg bg-[#040e1b] border-2 border-cyan-400 rounded-xl p-5 shadow-[0_0_40px_rgba(0,229,255,0.4)] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30 mb-4">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-cyan-400" />
            <h3 className="font-orbitron font-bold text-white text-base">
              {language === 'bn' ? 'অ্যান্ড্রয়েড এপিকে ইনস্টলার' : 'ANDROID APK & PWA INSTALLER'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* APK / WebAPK Status Banner */}
        <div className="bg-gradient-to-r from-cyan-950/80 to-blue-950/80 border border-cyan-500/40 rounded-lg p-3.5 mb-4 flex items-center justify-between">
          <div>
            <span className="font-orbitron font-bold text-white text-xs block">
              ADIL • J.A.R.V.I.S. MARK LXXXV
            </span>
            <span className="text-[11px] font-mono-tech text-cyan-300">
              {language === 'bn'
                ? 'অফলাইন অ্যান্ড্রয়েড অ্যাপ্লিকেশন প্যাকেজ (WebAPK)'
                : 'Offline Android Standalone Application Package'}
            </span>
          </div>
          <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 rounded text-[10px] font-mono-tech font-bold">
            100% OFFLINE READY
          </span>
        </div>

        {/* Direct Install Button (If supported/installable) */}
        {isInstalled ? (
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/50 rounded-lg text-center font-mono-tech text-xs text-emerald-300 mb-4 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>
              {language === 'bn'
                ? 'আপনার ডিভাইসে সফলভাবে ইনস্টল করা আছে!'
                : 'Already installed and running in standalone mode!'}
            </span>
          </div>
        ) : isInstallable ? (
          <button
            onClick={async () => {
              const res = await onInstall();
              if (res) onClose();
            }}
            className="w-full mb-4 py-3 rounded-lg bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 hover:from-cyan-500 hover:to-blue-500 text-white font-orbitron font-bold text-xs tracking-wider shadow-[0_0_20px_rgba(0,229,255,0.5)] transition active:scale-95 flex items-center justify-center gap-2 border border-cyan-300/50"
          >
            <Download className="w-4 h-4" />
            <span>
              {language === 'bn' ? 'ফোনে এপিকে ইনস্টল করুন (১-ক্লিক)' : 'INSTALL APK ON PHONE (1-CLICK)'}
            </span>
          </button>
        ) : null}

        {/* How to Install on Android Phone & QR Code */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-xs font-mono-tech">
          {/* Scan with Android Camera */}
          <div className="bg-black/50 border border-cyan-500/30 rounded-lg p-3 flex flex-col items-center text-center justify-between">
            <span className="text-cyan-300 font-bold mb-2 flex items-center gap-1">
              <QrCode className="w-4 h-4" />
              {language === 'bn' ? 'ফোনে স্ক্যান করুন' : 'Scan on Android'}
            </span>
            <div className="p-2 bg-white rounded-lg shadow-md mb-2">
              <img
                src={qrCodeUrl}
                alt="JARVIS QR Code"
                className="w-32 h-32 object-contain"
              />
            </div>
            <span className="text-[10px] text-gray-400">
              {language === 'bn'
                ? 'ফোনের ক্যামেরা দিয়ে স্ক্যান করলেই সরাসরি খুলবে।'
                : 'Point your Android camera to launch instantly.'}
            </span>
          </div>

          {/* Android Chrome WebAPK Steps */}
          <div className="bg-black/50 border border-cyan-500/30 rounded-lg p-3 flex flex-col justify-between">
            <div>
              <span className="text-cyan-300 font-bold mb-2 block flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                {language === 'bn' ? 'অ্যান্ড্রয়েড ইনস্টল নির্দেশিকা' : 'Android Install Guide'}
              </span>
              <ol className="space-y-1.5 text-gray-300 text-[11px] pl-3 list-decimal">
                <li>
                  {language === 'bn'
                    ? 'অ্যান্ড্রয়েডে Chrome বা Edge ব্রাউজারে লিংকটি খুলুন।'
                    : 'Open link in Android Chrome or Edge.'}
                </li>
                <li>
                  {language === 'bn'
                    ? 'ব্রাউজারের ৩ ডট মেনু (⋮) তে চাপ দিন।'
                    : 'Tap the 3-dots menu (⋮) in Chrome.'}
                </li>
                <li>
                  {language === 'bn'
                    ? '<strong>"Install app"</strong> বা <strong>"Add to Home screen"</strong> এ চাপ দিন।'
                    : 'Tap <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong>.'}
                </li>
                <li>
                  {language === 'bn'
                    ? 'গুগল প্লে স্বয়ংক্রিয়ভাবে আসল নেটিভ APK প্যাকেজ তৈরি করে হোমস্ক্রিনে যুক্ত করবে।'
                    : 'Google WebAPK will automatically compile a signed native Android APK!'}
                </li>
              </ol>
            </div>

            {/* Copy Link Button */}
            <button
              onClick={handleCopyLink}
              className="mt-3 w-full py-1.5 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-bold flex items-center justify-center gap-1 text-[11px] transition"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>
                {copied
                  ? (language === 'bn' ? 'লিংক কপি করা হয়েছে!' : 'Link Copied!')
                  : (language === 'bn' ? 'অ্যাপ লিংক কপি করুন' : 'Copy App Link')}
              </span>
            </button>
          </div>
        </div>

        {/* Offline Features Highlight */}
        <div className="bg-black/40 border border-cyan-500/20 rounded-lg p-3 text-xs font-mono-tech mb-4">
          <span className="text-cyan-300 font-bold mb-1.5 block">
            {language === 'bn' ? '✓ ১০০% অফলাইন সুবিধা:' : '✓ 100% Offline Capability:'}
          </span>
          <ul className="grid grid-cols-2 gap-1 text-[11px] text-gray-300">
            <li>• ইন্টারনেট ছাড়া ভয়েস কমান্ড</li>
            <li>• অফলাইন আর্ক রিঅ্যাক্টর</li>
            <li>• অফলাইন মোবাইল কন্ট্রোল</li>
            <li>• কোনো ডাটা কানেকশন লাগে না</li>
          </ul>
        </div>

        {/* Download WebManifest action */}
        <div className="flex items-center justify-between pt-2 border-t border-cyan-500/20 text-xs font-mono-tech">
          <button
            onClick={handleDownloadManifest}
            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-200 text-[11px]"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'ম্যানিফেস্ট ফাইল ডাউনলোড' : 'Download .webmanifest'}</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-gray-800 text-gray-300 hover:bg-gray-700 font-bold text-xs"
          >
            {language === 'bn' ? 'বন্ধ করুন' : 'CLOSE'}
          </button>
        </div>
      </div>
    </div>
  );
};
