import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Sparkles, 
  Bot, 
  User, 
  Settings2, 
  Radio, 
  Crosshair, 
  ShieldAlert, 
  Cpu, 
  Zap, 
  Smartphone,
  ChevronDown
} from 'lucide-react';
import { HUDHeader } from './components/HUDHeader';
import { ArcReactor } from './components/ArcReactor';
import { TacticalRadar } from './components/TacticalRadar';
import { SuitDiagnostics } from './components/SuitDiagnostics';
import { ProtocolPanel } from './components/ProtocolPanel';
import { TargetPractice } from './components/TargetPractice';
import { PhoneHardwareDeck } from './components/PhoneHardwareDeck';
import { VoiceCommandOverlay } from './components/VoiceCommandOverlay';
import { APKModal } from './components/APKModal';
import { AssistantNameModal } from './components/AssistantNameModal';
import { AgentPlanDisplay } from './components/AgentPlanDisplay';
import { BiometricScannerModal } from './components/BiometricScannerModal';

import { soundEffects } from './utils/audioEffects';
import { jarvisVoice } from './utils/speechVoice';
import { voiceRecognition } from './utils/voiceRecognition';
import { phoneHardware } from './utils/phoneHardwareController';
import { processOfflineJarvisQuery } from './utils/offlineJarvisAI';
import { phoneAgent, AgentPlan } from './utils/aiAgentEngine';
import { loadAssistantSettings, saveAssistantSettings, AssistantSettings } from './utils/assistantConfig';
import { usePWAInstall } from './hooks/usePWAInstall';

export default function App() {
  // 1. Settings & Identity (Adil + Sahal)
  const [settings, setSettings] = useState<AssistantSettings>(() => loadAssistantSettings());
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [isAPKModalOpen, setIsAPKModalOpen] = useState(false);
  const [isBiometricModalOpen, setIsBiometricModalOpen] = useState(false);

  // 2. Suit State & Telemetry
  const [suitMode, setSuitMode] = useState<string>('standard');
  const [activeProtocol, setActiveProtocol] = useState<string | null>(null);
  const [powerDrawGJ, setPowerDrawGJ] = useState<number>(3.4);
  const [coreTempK, setCoreTempK] = useState<number>(412);

  // 3. Phone Hardware Real Telemetry
  const [torchActive, setTorchActive] = useState<boolean>(false);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const [wakeLockActive, setWakeLockActive] = useState<boolean>(false);

  // 4. Voice & Audio State
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isInstantTalk, setIsInstantTalk] = useState<boolean>(true);
  const [transcript, setTranscript] = useState<string>('');
  const [jarvisResponse, setJarvisResponse] = useState<string>('');

  // 5. Autonomous Agent Plan State
  const [activeAgentPlan, setActiveAgentPlan] = useState<AgentPlan | null>(null);

  // 6. Active Tab on Mobile (Radar, Diagnostics, Weapon, Phone Deck)
  const [mobileTab, setMobileTab] = useState<'core' | 'phone' | 'radar' | 'armor' | 'protocols' | 'weapons'>('core');

  // PWA Install Hook
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  // Save settings on update
  const updateSettings = (newSettings: Partial<AssistantSettings>) => {
    setSettings((prev) => {
      const merged = { ...prev, ...newSettings };
      saveAssistantSettings(merged);
      return merged;
    });
  };

  // Sync Voice Language
  useEffect(() => {
    jarvisVoice.setLanguage(settings.language);
    voiceRecognition.setLanguage(settings.language);
  }, [settings.language]);

  // Sync Instant Talk Mode
  useEffect(() => {
    voiceRecognition.setInstantMode(isInstantTalk);
  }, [isInstantTalk]);

  // Sync Voice Speaking state
  useEffect(() => {
    const unsub = jarvisVoice.subscribe((speaking) => {
      setIsSpeaking(speaking);
    });
    return () => {
      unsub();
    };
  }, []);

  // Fetch real phone battery
  useEffect(() => {
    phoneHardware.getBattery().then((batt) => {
      if (batt) {
        setBatteryLevel(batt.level);
        setIsCharging(batt.charging);
      }
    });
  }, []);

  // Ambient telemetry fluctuation loop
  useEffect(() => {
    const timer = setInterval(() => {
      setPowerDrawGJ((p) => +(3.2 + Math.sin(Date.now() / 4000) * 0.4).toFixed(2));
      setCoreTempK((t) => Math.floor(410 + Math.sin(Date.now() / 3000) * 8));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Execute Core Voice / Text Command
  const handleExecuteCommand = useCallback(
    async (commandText: string) => {
      setTranscript(commandText);
      soundEffects.playBeep(880);

      // Check if this matches a complex Autonomous Multi-Step Agent Plan
      const agentPlan = phoneAgent.planActionSequence(
        commandText,
        settings.assistantName,
        settings.commanderName,
        settings.language
      );

      if (agentPlan) {
        setActiveAgentPlan(agentPlan);
        setJarvisResponse(agentPlan.spokenSummary);
        jarvisVoice.speak(agentPlan.spokenSummary, settings.language);

        // Execute agent steps sequentially
        for (let i = 0; i < agentPlan.steps.length; i++) {
          const step = agentPlan.steps[i];
          step.status = 'running';
          setActiveAgentPlan({ ...agentPlan });

          await new Promise((r) => setTimeout(r, 600));

          // Real step action execution
          if (step.tool === 'FLASHLIGHT') {
            await phoneHardware.toggleTorch(true);
            setTorchActive(true);
          } else if (step.tool === 'TORCH_OFF') {
            await phoneHardware.toggleTorch(false);
            setTorchActive(false);
          } else if (step.tool === 'WAKE_LOCK') {
            await phoneHardware.enableWakeLock();
            setWakeLockActive(true);
          } else if (step.tool === 'HAPTIC_PULSE') {
            phoneHardware.vibrate([100, 50, 150]);
          } else if (step.tool === 'STEALTH_SUIT') {
            setSuitMode('stealth');
          } else if (step.tool === 'OVERDRIVE') {
            setSuitMode('overdrive');
          } else if (step.tool === 'STANDARD_SUIT') {
            setSuitMode('standard');
          }

          step.status = 'completed';
          setActiveAgentPlan({ ...agentPlan });
        }
        return;
      }

      // Standard single query processing via Offline Neural Brain
      const response = processOfflineJarvisQuery(commandText, settings.language, {
        batteryLevel: batteryLevel ?? 88,
        isCharging,
        torchOn: torchActive,
        assistantName: settings.assistantName,
        commanderName: settings.commanderName,
      });

      setJarvisResponse(response.reply);
      jarvisVoice.speak(response.reply, settings.language);

      // Handle actions returned by AI
      if (response.action) {
        switch (response.action) {
          case 'toggle_torch': {
            const nextState = response.actionParam !== undefined ? response.actionParam : !torchActive;
            await phoneHardware.toggleTorch(nextState);
            setTorchActive(nextState);
            break;
          }
          case 'vibrate_phone': {
            phoneHardware.vibrate([150, 80, 200]);
            break;
          }
          case 'keep_screen_on': {
            await phoneHardware.enableWakeLock();
            setWakeLockActive(true);
            break;
          }
          case 'open_dialer': {
            phoneHardware.openDialer('911');
            break;
          }
          case 'open_camera': {
            setMobileTab('phone');
            break;
          }
          case 'fire_repulsor': {
            soundEffects.playRepulsorCharge();
            setTimeout(() => {
              soundEffects.playRepulsorBlast();
              phoneHardware.vibrate([100, 50, 120]);
            }, 300);
            break;
          }
          case 'charge_unibeam': {
            soundEffects.playRepulsorCharge();
            setPowerDrawGJ(5.2);
            break;
          }
          case 'toggle_stealth': {
            setSuitMode((m) => (m === 'stealth' ? 'standard' : 'stealth'));
            soundEffects.playProtocolAlert();
            break;
          }
          case 'overdrive': {
            setSuitMode('overdrive');
            soundEffects.playProtocolAlert();
            break;
          }
          case 'standard_mode': {
            setSuitMode('standard');
            soundEffects.playBeep(600);
            break;
          }
          case 'house_party': {
            setActiveProtocol('house_party');
            soundEffects.playProtocolAlert();
            break;
          }
          case 'veronica': {
            setActiveProtocol('veronica');
            soundEffects.playProtocolAlert();
            break;
          }
          case 'clean_slate': {
            setActiveProtocol('clean_slate');
            soundEffects.playProtocolAlert();
            break;
          }
          case 'open_apk': {
            setIsAPKModalOpen(true);
            break;
          }
          case 'toggle_mute': {
            const muted = soundEffects.toggleMute();
            setIsMuted(muted);
            jarvisVoice.setMuted(muted);
            break;
          }
          case 'open_biometric_scanner': {
            setIsBiometricModalOpen(true);
            break;
          }
          case 'change_assistant_name': {
            if (response.actionParam) {
              updateSettings({ assistantName: response.actionParam });
            }
            break;
          }
        }
      }
    },
    [settings, batteryLevel, isCharging, torchActive]
  );

  // Setup Continuous & Wake-Word Speech Recognition
  useEffect(() => {
    const unsubTranscript = voiceRecognition.onTranscript((text, isFinal) => {
      setTranscript(text);

      if (isFinal) {
        const lower = text.toLowerCase().trim();
        const callNameLower = settings.assistantName.toLowerCase();

        // Check if wake word or direct command
        if (
          lower.includes(callNameLower) ||
          lower.includes('jarvis') ||
          lower.includes('sahal') ||
          lower.includes('সাহাল') ||
          lower.includes('জারভিস') ||
          !settings.isHandsFree // In push-to-talk, execute immediately
        ) {
          handleExecuteCommand(text);
        }
      }
    });

    const unsubStatus = voiceRecognition.onStatus((listening) => {
      setIsListening(listening);
    });

    // Start hands-free continuous listening if enabled
    if (settings.isHandsFree) {
      voiceRecognition.start(true);
    }

    return () => {
      unsubTranscript();
      unsubStatus();
      voiceRecognition.stop();
    };
  }, [settings.isHandsFree, settings.assistantName, handleExecuteCommand]);

  // Toggle Hands-Free Listening
  const handleToggleHandsFree = () => {
    const next = !settings.isHandsFree;
    updateSettings({ isHandsFree: next });
    if (next) {
      voiceRecognition.start(true);
      const greeting = settings.language === 'bn'
        ? `কমান্ডার ${settings.commanderName}, হ্যান্ডস-ফ্রি মোড চালু করা হয়েছে। আপনি "${settings.assistantName}" ডাকলেই আমি উত্তর দেব।`
        : `Hands-free mode active, Commander ${settings.commanderName}. Speak "${settings.assistantName}" anytime.`;
      jarvisVoice.speak(greeting, settings.language);
    } else {
      voiceRecognition.stop();
    }
  };

  // Toggle Language
  const handleToggleLanguage = () => {
    const next = settings.language === 'en' ? 'bn' : 'en';
    updateSettings({ language: next });
    const msg = next === 'bn'
      ? `কমান্ডার ${settings.commanderName}, ভাষা বাংলায় পরিবর্তিত হয়েছে।`
      : `Commander ${settings.commanderName}, language switched to English.`;
    jarvisVoice.speak(msg, next);
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEffects.setMuted(next);
    jarvisVoice.setMuted(next);
  };

  // Toggle Torch
  const handleToggleTorch = async () => {
    const res = await phoneHardware.toggleTorch();
    setTorchActive(phoneHardware.getTorchState());
    if (res.success) {
      soundEffects.playBeep(res.message.includes('activated') ? 880 : 440);
    }
  };

  // Toggle Wake Lock
  const handleToggleWakeLock = async () => {
    if (wakeLockActive) {
      await phoneHardware.disableWakeLock();
      setWakeLockActive(false);
    } else {
      const ok = await phoneHardware.enableWakeLock();
      setWakeLockActive(ok);
      if (ok) soundEffects.playBeep(920);
    }
  };

  return (
    <div className={`min-h-screen bg-[#040911] text-cyan-400 stark-grid flex flex-col justify-between selection:bg-cyan-500 selection:text-black ${
      suitMode === 'stealth' ? 'filter hue-rotate-180 brightness-90' : suitMode === 'overdrive' ? 'filter hue-rotate-310' : ''
    }`}>
      {/* Scanline CRT overlay */}
      <div className="fixed inset-0 scanlines pointer-events-none z-50 opacity-40" />

      {/* Top HUD Header */}
      <HUDHeader
        suitMode={suitMode}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        isHandsFree={settings.isHandsFree}
        onToggleHandsFree={handleToggleHandsFree}
        isInstantTalk={isInstantTalk}
        onToggleInstantTalk={() => setIsInstantTalk((prev) => !prev)}
        language={settings.language}
        onToggleLanguage={handleToggleLanguage}
        onOpenAPKModal={() => setIsAPKModalOpen(true)}
        torchActive={torchActive}
        onToggleTorch={handleToggleTorch}
        batteryLevel={batteryLevel}
        isCharging={isCharging}
      />

      {/* Sub-Header: Assistant & Commander Persona Pill */}
      <div className="bg-[#050e1a]/80 border-b border-cyan-500/20 px-4 py-2 z-20">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs font-mono-tech">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">
              {settings.language === 'bn' ? 'সহকারী নাম:' : 'ASSISTANT:'}
            </span>
            <button
              onClick={() => {
                soundEffects.playBeep(800);
                setIsNameModalOpen(true);
              }}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 font-bold border border-cyan-400/60 hover:bg-cyan-900 shadow-[0_0_8px_rgba(0,229,255,0.4)] transition"
              title="Click to change Assistant Call Name anytime"
            >
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              <span>{settings.assistantName}</span>
              <Settings2 className="w-3 h-3 text-cyan-400/70 ml-0.5" />
            </button>

            <span className="text-gray-500">•</span>

            <span className="text-gray-400">
              {settings.language === 'bn' ? 'কমান্ডার:' : 'COMMANDER:'}
            </span>
            <span className="text-white font-bold bg-black/60 px-2 py-0.5 rounded border border-gray-700">
              {settings.commanderName}
            </span>
          </div>

          {/* Quick Voice Prompt Reminder & Instant Indicator */}
          <div className="flex items-center gap-2">
            {isInstantTalk && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40 text-[10px] font-bold animate-pulse">
                <Zap className="w-3 h-3 text-amber-400" />
                {settings.language === 'bn' ? 'তাত্ক্ষণিক উত্তর সক্রিয় (<২০০ মিলি)' : 'INSTANT TALK (<200MS)'}
              </span>
            )}
            <div className="text-cyan-400/80 text-[11px] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span>
                {settings.language === 'bn'
                  ? `বলুন: "${settings.assistantName}, রিপালসর ফায়ার" অথবা "${settings.assistantName}, টর্চ জ্বালাও"`
                  : `Say: "${settings.assistantName}, fire repulsor" or "${settings.assistantName}, turn on torch"`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 space-y-4">
        {/* Autonomous Agent Execution Plan (When active) */}
        <AgentPlanDisplay
          plan={activeAgentPlan}
          onDismiss={() => setActiveAgentPlan(null)}
          language={settings.language}
          assistantName={settings.assistantName}
        />

        {/* Mobile Navigation Tabs (for phone screens) */}
        <div className="flex sm:hidden overflow-x-auto pb-1 gap-1 text-[11px] font-mono-tech border-b border-cyan-500/20 no-scrollbar">
          {[
            { id: 'core', label: 'REACTOR' },
            { id: 'phone', label: 'PHONE' },
            { id: 'radar', label: 'RADAR' },
            { id: 'armor', label: 'ARMOR' },
            { id: 'protocols', label: 'PROTOCOLS' },
            { id: 'weapons', label: 'WEAPONS' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                soundEffects.playBeep(700);
                setMobileTab(tab.id as any);
              }}
              className={`shrink-0 px-3 py-1.5 rounded-t-md font-bold border-b-2 transition ${
                mobileTab === tab.id
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-400'
                  : 'text-gray-400 border-transparent hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Desktop 3-Column Hologram Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left Column: Tactical Radar + Phone Hardware Deck */}
          <div className={`lg:col-span-4 space-y-4 ${mobileTab !== 'radar' && mobileTab !== 'phone' ? 'hidden sm:block' : ''}`}>
            {/* Phone Hardware Deck */}
            <div className={mobileTab === 'phone' ? 'block' : 'hidden sm:block'}>
              <PhoneHardwareDeck
                language={settings.language}
                torchActive={torchActive}
                onToggleTorch={handleToggleTorch}
                batteryLevel={batteryLevel}
                isCharging={isCharging}
                wakeLockActive={wakeLockActive}
                onToggleWakeLock={handleToggleWakeLock}
              />
            </div>

            {/* Tactical Radar */}
            <div className={mobileTab === 'radar' ? 'block' : 'hidden sm:block'}>
              <TacticalRadar
                language={settings.language}
                onTargetLocked={(target) => {
                  setTranscript(`Target acquired: ${target.label}`);
                }}
              />
            </div>
          </div>

          {/* Center Column: Core Arc Reactor + Live Telemetry */}
          <div className={`lg:col-span-4 flex flex-col items-center justify-center space-y-4 ${mobileTab !== 'core' ? 'hidden sm:flex' : ''}`}>
            <div className="w-full bg-[#050e1a]/85 border border-cyan-500/30 rounded-xl p-4 hud-glow flex flex-col items-center justify-center">
              <ArcReactor
                suitMode={suitMode}
                powerDrawGJ={powerDrawGJ}
                coreTempK={coreTempK}
                language={settings.language}
                onReactorPulse={() => {
                  setTranscript(settings.language === 'bn' ? 'আর্ক রিঅ্যাক্টর পালস নির্গমন' : 'Arc Reactor pulse emitted');
                }}
                onOpenBiometricScanner={() => {
                  setIsBiometricModalOpen(true);
                }}
              />

              {/* Mode Switcher Buttons */}
              <div className="grid grid-cols-4 gap-1.5 w-full max-w-xs mt-3 text-[10px] font-mono-tech">
                {[
                  { id: 'standard', label: 'STD', color: 'border-cyan-500/40' },
                  { id: 'overdrive', label: 'COMBAT', color: 'border-red-500/50' },
                  { id: 'stealth', label: 'STEALTH', color: 'border-sky-500/50' },
                  { id: 'sentry', label: 'SENTRY', color: 'border-amber-500/50' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      soundEffects.playBeep(850);
                      setSuitMode(m.id);
                    }}
                    className={`py-1 rounded border uppercase font-bold transition ${
                      suitMode === m.id
                        ? 'bg-cyan-500/30 text-white border-cyan-300 shadow-[0_0_8px_rgba(0,229,255,0.4)]'
                        : `bg-black/40 text-gray-400 ${m.color} hover:text-cyan-300`
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Hands-Free Agent Voice Commands Preview */}
            <div className="w-full bg-[#050e1a]/80 border border-cyan-500/20 rounded-xl p-3 font-mono-tech text-xs space-y-1.5">
              <div className="flex items-center justify-between text-cyan-300 font-bold text-[11px]">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  {settings.language === 'bn' ? 'এজেন্ট মাল্টি-স্টেপ কমান্ড:' : 'HANDS-FREE AGENT COMMANDS:'}
                </span>
                <span className="text-[10px] text-emerald-400">READY</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <button
                  onClick={() => handleExecuteCommand(settings.language === 'bn' ? 'নাইট পেট্রোল' : 'Night patrol mode')}
                  className="p-2 rounded bg-black/50 border border-cyan-500/20 text-left hover:border-cyan-500/50 text-cyan-200"
                >
                  <span className="font-bold text-white block">
                    {settings.language === 'bn' ? '• নাইট পেট্রোল' : '• Night Patrol'}
                  </span>
                  <span className="text-gray-400">Torch + Stealth + Radar</span>
                </button>
                <button
                  onClick={() => handleExecuteCommand(settings.language === 'bn' ? 'যুদ্ধের প্রস্তুতি' : 'Combat ready')}
                  className="p-2 rounded bg-black/50 border border-cyan-500/20 text-left hover:border-cyan-500/50 text-cyan-200"
                >
                  <span className="font-bold text-white block">
                    {settings.language === 'bn' ? '• যুদ্ধ প্রস্তুতি' : '• Combat Ready'}
                  </span>
                  <span className="text-gray-400">Overdrive + Repulsors</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Suit Diagnostics + Protocols + Weapons */}
          <div className={`lg:col-span-4 space-y-4 ${mobileTab !== 'armor' && mobileTab !== 'protocols' && mobileTab !== 'weapons' ? 'hidden sm:block' : ''}`}>
            {/* Suit Diagnostics */}
            <div className={mobileTab === 'armor' ? 'block' : 'hidden sm:block'}>
              <SuitDiagnostics
                language={settings.language}
                onReroutePower={(subId) => {
                  setTranscript(`Power shunted to ${subId}`);
                }}
              />
            </div>

            {/* Target Practice / Repulsor Shooting */}
            <div className={mobileTab === 'weapons' ? 'block' : 'hidden sm:block'}>
              <TargetPractice
                language={settings.language}
                onRepulsorFired={() => {
                  setTranscript(settings.language === 'bn' ? 'রিপালসর ফায়ার সম্পন্ন' : 'Repulsor blast fired');
                }}
              />
            </div>

            {/* Protocols Panel */}
            <div className={mobileTab === 'protocols' ? 'block' : 'hidden sm:block'}>
              <ProtocolPanel
                language={settings.language}
                activeProtocol={activeProtocol}
                onActivateProtocol={(protoId) => {
                  setActiveProtocol(protoId);
                  const msg = settings.language === 'bn'
                    ? `প্রোটোকল ${protoId} কার্যকর করা হয়েছে, কমান্ডার ${settings.commanderName}।`
                    : `Protocol ${protoId} engaged, Commander ${settings.commanderName}.`;
                  jarvisVoice.speak(msg, settings.language);
                }}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Voice Command Dock */}
      <VoiceCommandOverlay
        language={settings.language}
        isListening={isListening}
        isSpeaking={isSpeaking}
        transcript={transcript}
        jarvisResponse={jarvisResponse}
        onExecuteCommand={handleExecuteCommand}
        onToggleListening={() => {
          voiceRecognition.toggle();
        }}
        isHandsFree={settings.isHandsFree}
        onToggleHandsFree={handleToggleHandsFree}
      />

      {/* Modal 1: Android APK / WebAPK Installer Companion */}
      <APKModal
        isOpen={isAPKModalOpen}
        onClose={() => setIsAPKModalOpen(false)}
        language={settings.language}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        isIOS={isIOS}
        onInstall={install}
      />

      {/* Modal 2: Change Assistant Call Name (Sahal / Jarvis / Custom) Anytime */}
      <AssistantNameModal
        isOpen={isNameModalOpen}
        onClose={() => setIsNameModalOpen(false)}
        currentAssistantName={settings.assistantName}
        currentCommanderName={settings.commanderName}
        language={settings.language}
        onSave={(newAssistantName, newCommanderName) => {
          updateSettings({
            assistantName: newAssistantName,
            commanderName: newCommanderName,
          });
          const confirmMsg = settings.language === 'bn'
            ? `আমার নাম পরিবর্তন করে "${newAssistantName}" রাখা হয়েছে, কমান্ডার ${newCommanderName}।`
            : `Assistant call name updated to "${newAssistantName}", Commander ${newCommanderName}.`;
          jarvisVoice.speak(confirmMsg, settings.language);
        }}
      />

      {/* Modal 3: Biometric Fingerprint & Retinal Scanner */}
      <BiometricScannerModal
        isOpen={isBiometricModalOpen}
        onClose={() => setIsBiometricModalOpen(false)}
        language={settings.language}
        commanderName={settings.commanderName}
        assistantName={settings.assistantName}
        onAccessGranted={() => {
          setPowerDrawGJ(4.5);
          soundEffects.playAccessGranted();
          setTranscript(settings.language === 'bn' ? 'বায়োমেট্রিক নিশ্চিত: লেভেল ১০ অ্যাক্সেস' : 'Biometric confirmed: Level 10 Clearance Granted');
        }}
      />
    </div>
  );
}
