import React, { useState } from 'react';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  Volume2, 
  HelpCircle, 
  Check, 
  Send, 
  Flame, 
  ShieldAlert, 
  Radio, 
  X,
  Smartphone
} from 'lucide-react';
import { soundEffects } from '../utils/audioEffects';

interface VoiceCommandOverlayProps {
  language: 'en' | 'bn';
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  jarvisResponse: string;
  onExecuteCommand: (commandText: string) => void;
  onToggleListening: () => void;
  isHandsFree: boolean;
  onToggleHandsFree: () => void;
}

export const VoiceCommandOverlay: React.FC<VoiceCommandOverlayProps> = ({
  language,
  isListening,
  isSpeaking,
  transcript,
  jarvisResponse,
  onExecuteCommand,
  onToggleListening,
  isHandsFree,
  onToggleHandsFree,
}) => {
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [textInput, setTextInput] = useState('');

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    onExecuteCommand(textInput);
    setTextInput('');
  };

  // Quick Chips in English and Bangla
  const quickCommands = language === 'bn'
    ? [
        { label: 'বায়োমেট্রিক স্ক্যান', text: 'বায়োমেট্রিক স্ক্যান কর' },
        { label: 'রিপালসর ফায়ার', text: 'রিপালসর ফায়ার কর' },
        { label: 'টর্চ অন কর', text: 'টর্চ অন কর' },
        { label: 'ব্যাটারি কত?', text: 'ব্যাটারি কত শতাংশ?' },
        { label: 'হাউস পার্টি প্রোটোকল', text: 'হাউস পার্টি প্রোটোকল চালু কর' },
        { label: 'ভেরোনিকা পাঠাও', text: 'ভেরোনিকা পাঠাও' },
        { label: 'স্টিলথ মোড', text: 'স্টিলথ মোড সক্রিয় কর' },
        { label: 'কেমন আছো?', text: 'কেমন আছো' },
        { label: 'এপিকে ডাউনলোড', text: 'এপিকে ডাউনলোড কর' },
      ]
    : [
        { label: 'Biometric Scan', text: 'Biometric scan' },
        { label: 'Fire Repulsor', text: 'Fire repulsor' },
        { label: 'Flashlight On', text: 'Turn on flashlight' },
        { label: 'Check Battery', text: 'Check battery status' },
        { label: 'House Party', text: 'Activate House Party Protocol' },
        { label: 'Deploy Veronica', text: 'Deploy Veronica satellite' },
        { label: 'Stealth Mode', text: 'Engage stealth mode' },
        { label: 'Full Diagnostics', text: 'Full status report' },
        { label: 'Install APK', text: 'Install APK' },
      ];

  return (
    <div className="w-full bg-[#050e1a]/95 border-t border-cyan-500/40 backdrop-blur-lg p-3 sm:p-4 sticky bottom-0 z-40 shadow-[0_-10px_25px_rgba(4,9,17,0.9)]">
      <div className="max-w-4xl mx-auto space-y-2.5">
        {/* Top Bar: Status & Waveform */}
        <div className="flex items-center justify-between gap-2 text-xs font-mono-tech">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isListening
                  ? 'bg-red-500 animate-ping'
                  : isHandsFree
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-cyan-500'
              }`}
            />
            <span className="text-cyan-300 font-bold uppercase tracking-wider text-[11px] sm:text-xs">
              {isListening
                ? (language === 'bn' ? 'শুনছি... (বলুন)' : 'LISTENING... (SPEAK NOW)')
                : isHandsFree
                ? (language === 'bn' ? 'হ্যান্ডস-ফ্রি স্ট্যান্ডবাই ("জারভিস" বলুন)' : 'HANDS-FREE ACTIVE (SAY "JARVIS")')
                : (language === 'bn' ? 'ভয়েস স্ট্যান্ডবাই' : 'VOICE STANDBY')}
            </span>
          </div>

          {/* Audio Visualizer Waveform Animation */}
          <div className="flex items-center gap-1 h-5 px-2 bg-black/50 rounded border border-cyan-500/20">
            {[40, 75, 100, 60, 90, 50, 85, 30, 95, 70].map((h, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isSpeaking
                    ? 'bg-cyan-400'
                    : isListening
                    ? 'bg-red-400'
                    : 'bg-cyan-900'
                }`}
                style={{
                  height: isSpeaking || isListening ? `${Math.max(4, Math.round(h * Math.random()))}px` : '4px',
                }}
              />
            ))}
          </div>

          {/* Voice Cheat Sheet Button */}
          <button
            onClick={() => {
              soundEffects.playBeep(900);
              setShowCheatSheet(true);
            }}
            className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-200 transition bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {language === 'bn' ? 'কমান্ডের তালিকা' : 'Commands List'}
            </span>
          </button>
        </div>

        {/* Live Subtitle Transcript Banner */}
        {(transcript || jarvisResponse) && (
          <div className="bg-black/70 border border-cyan-500/30 rounded-lg p-2.5 font-mono-tech text-xs sm:text-sm space-y-1 shadow-inner">
            {transcript && (
              <div className="flex items-start gap-2 text-cyan-200">
                <span className="text-cyan-400 font-bold text-[10px] sm:text-xs uppercase bg-cyan-950 px-1 rounded">
                  {language === 'bn' ? 'আপনি' : 'ADIL'}:
                </span>
                <span className="italic">"{transcript}"</span>
              </div>
            )}
            {jarvisResponse && (
              <div className="flex items-start gap-2 text-emerald-300">
                <span className="text-emerald-400 font-bold text-[10px] sm:text-xs uppercase bg-emerald-950 px-1 rounded">
                  JARVIS:
                </span>
                <span>{jarvisResponse}</span>
              </div>
            )}
          </div>
        )}

        {/* Input Bar & Controls */}
        <div className="flex items-center gap-2">
          {/* Main Mic Button */}
          <button
            onClick={() => {
              soundEffects.playBeep(isListening ? 400 : 880);
              onToggleListening();
            }}
            className={`p-3 rounded-full border transition-all shadow-lg active:scale-90 flex items-center justify-center ${
              isListening
                ? 'bg-red-600 border-red-400 text-white shadow-[0_0_20px_rgba(239,68,68,0.7)] animate-pulse'
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-400 text-white shadow-[0_0_15px_rgba(0,229,255,0.4)] hover:brightness-110'
            }`}
            title={language === 'bn' ? 'কথা বলতে চাপুন' : 'Click to speak voice command'}
          >
            {isListening ? <Mic className="w-5 h-5 animate-spin" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Command Input */}
          <form onSubmit={handleSendText} className="flex-1 flex items-center gap-1.5">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={
                language === 'bn'
                  ? 'কথা বলুন অথবা কমান্ড লিখুন (যেমন: "রিপালসর ফায়ার", "টর্চ অন")...'
                  : 'Speak or type command (e.g. "Fire repulsor", "Turn on flashlight")...'
              }
              className="flex-1 bg-black/60 border border-cyan-500/40 rounded-lg px-3 py-2 text-xs sm:text-sm text-cyan-200 placeholder-cyan-700/70 focus:outline-none focus:border-cyan-300 font-mono-tech"
            />
            <button
              type="submit"
              disabled={!textInput.trim()}
              className="px-3 py-2 rounded-lg bg-cyan-600/30 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-600/50 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Quick Voice Command Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-mono-tech no-scrollbar">
          <span className="text-gray-400 text-[10px] shrink-0 uppercase tracking-wider">
            {language === 'bn' ? 'কুইক কমান্ড:' : 'QUICK:'}
          </span>
          {quickCommands.map((cmd, idx) => (
            <button
              key={idx}
              onClick={() => {
                soundEffects.playBeep(750);
                onExecuteCommand(cmd.text);
              }}
              className="shrink-0 px-2.5 py-1 rounded bg-[#091b2e] hover:bg-cyan-900/60 text-cyan-300 hover:text-white border border-cyan-500/30 transition shadow-sm active:scale-95"
            >
              {cmd.label}
            </button>
          ))}
        </div>
      </div>

      {/* Voice Commands Cheat Sheet Modal */}
      {showCheatSheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg bg-[#040d1a] border-2 border-cyan-400 rounded-xl p-5 shadow-[0_0_35px_rgba(0,229,255,0.4)] max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="font-orbitron font-bold text-white text-base">
                  {language === 'bn' ? 'ভয়েস কমান্ড গাইড' : 'J.A.R.V.I.S. VOICE COMMANDS'}
                </h3>
              </div>
              <button
                onClick={() => setShowCheatSheet(false)}
                className="p-1 rounded text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs font-mono-tech text-gray-300 mb-4">
              {language === 'bn'
                ? 'আপনি সরাসরি বাংলায় বা ইংরেজিতে মুখে বলতে পারেন। ইন্টারনেট সংযোগ না থাকলেও অফলাইনে কাজ করবে।'
                : 'Speak hands-free or tap mic. All commands execute 100% offline with zero internet.'}
            </p>

            <div className="space-y-4 text-xs font-mono-tech">
              {/* Phone Hardware */}
              <div className="bg-black/40 border border-cyan-500/20 rounded-lg p-3">
                <h4 className="text-cyan-300 font-bold mb-2 flex items-center gap-1.5 uppercase">
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  {language === 'bn' ? 'মোবাইল নিয়ন্ত্রণ কমান্ড' : 'Hands-Free Phone Controls'}
                </h4>
                <ul className="space-y-1.5 text-gray-300">
                  <li>• <strong className="text-white">"টর্চ জ্বালাও"</strong> / "Turn on flashlight"</li>
                  <li>• <strong className="text-white">"টর্চ বন্ধ কর"</strong> / "Turn off flashlight"</li>
                  <li>• <strong className="text-white">"ব্যাটারি কত শতাংশ?"</strong> / "Check battery status"</li>
                  <li>• <strong className="text-white">"স্ক্রিন অন রাখো"</strong> / "Keep screen awake"</li>
                  <li>• <strong className="text-white">"ফোন ভাইব্রেট কর"</strong> / "Vibrate phone"</li>
                  <li>• <strong className="text-white">"ক্যামেরা স্ক্যানার খোলো"</strong> / "Open camera"</li>
                </ul>
              </div>

              {/* Combat & Weapons */}
              <div className="bg-black/40 border border-cyan-500/20 rounded-lg p-3">
                <h4 className="text-red-300 font-bold mb-2 flex items-center gap-1.5 uppercase">
                  <Flame className="w-4 h-4 text-red-400" />
                  {language === 'bn' ? 'অস্ত্র ও কমব্যাট' : 'Weapons & Combat'}
                </h4>
                <ul className="space-y-1.5 text-gray-300">
                  <li>• <strong className="text-white">"রিপালসর ফায়ার কর"</strong> / "Fire repulsors"</li>
                  <li>• <strong className="text-white">"ইউনিবিম চার্জ কর"</strong> / "Charge unibeam"</li>
                  <li>• <strong className="text-white">"কমব্যাট ওভারড্রাইভ মোড"</strong> / "Engage overdrive"</li>
                </ul>
              </div>

              {/* Protocols */}
              <div className="bg-black/40 border border-cyan-500/20 rounded-lg p-3">
                <h4 className="text-amber-300 font-bold mb-2 flex items-center gap-1.5 uppercase">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  {language === 'bn' ? 'স্টার্ক প্রোটোকল' : 'Stark Protocols'}
                </h4>
                <ul className="space-y-1.5 text-gray-300">
                  <li>• <strong className="text-white">"হাউস পার্টি প্রোটোকল সক্রিয় কর"</strong> / "House Party Protocol"</li>
                  <li>• <strong className="text-white">"ভেরোনিকা স্যাটেলাইট পাঠাও"</strong> / "Deploy Veronica"</li>
                  <li>• <strong className="text-white">"স্টিলথ মোড চালু কর"</strong> / "Stealth mode"</li>
                  <li>• <strong className="text-white">"ক্লিন স্লেট প্রোটোকল"</strong> / "Clean Slate protocol"</li>
                </ul>
              </div>

              {/* J.A.R.V.I.S. Persona */}
              <div className="bg-black/40 border border-cyan-500/20 rounded-lg p-3">
                <h4 className="text-emerald-300 font-bold mb-2 flex items-center gap-1.5 uppercase">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  {language === 'bn' ? 'প্রশ্ন ও কথোপকথন' : 'AI Interaction'}
                </h4>
                <ul className="space-y-1.5 text-gray-300">
                  <li>• <strong className="text-white">"জারভিস অবস্থা কি?"</strong> / "Status report"</li>
                  <li>• <strong className="text-white">"তুমি কে?"</strong> / "Who are you?"</li>
                  <li>• <strong className="text-white">"কেমন আছো জারভিস?"</strong> / "How are you?"</li>
                  <li>• <strong className="text-white">"একটি কৌতুক বল"</strong> / "Tell me a joke"</li>
                  <li>• <strong className="text-white">"এপিকে ইনস্টল কর"</strong> / "Install APK"</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowCheatSheet(false)}
              className="mt-5 w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs tracking-wider transition"
            >
              {language === 'bn' ? 'ঠিক আছে (বুঝেছি)' : 'CLOSE GUIDE'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
