import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  FastForward, 
  Volume2, 
  VolumeX,
  Award,
  Video,
  X
} from 'lucide-react';
import { soundEffects } from '../lib/soundEffects.ts';

interface AutoDemoDirectorProps {
  onSendMessage: (text: string) => Promise<void>;
  onDispatchTool: (toolName: string, args: Record<string, any>) => Promise<any>;
  setActiveTab: (tab: any) => void;
  onReset: () => Promise<void>;
}

export const AutoDemoDirector: React.FC<AutoDemoDirectorProps> = ({
  onSendMessage,
  onDispatchTool,
  setActiveTab,
  onReset
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const DEMO_STEPS = [
    {
      title: '1. Ecosystem Architecture & Alexa+ Intro',
      tab: 'alexa',
      timeStr: '0:00',
      description: 'Alexa+ initializes self-hosted Streamable HTTP MCP server (spec 2025-11-25) across Ring, Fire TV, and Bee devices.',
      action: async () => {
        soundEffects.playAlexaChime();
        setActiveTab('alexa');
      }
    },
    {
      title: '2. Courier Approaches & Ring Chimes',
      tab: 'ring',
      timeStr: '0:25',
      description: 'Amazon Prime courier arrives at porch. Ring Doorbell Pro 2 detects person + package and chimes throughout the home.',
      action: async () => {
        setActiveTab('ring');
        soundEffects.playRingDoorbellChime();
      }
    },
    {
      title: '3. Alexa+ Multimodal Cross-Device Command',
      tab: 'alexa',
      timeStr: '0:50',
      description: 'User commands Alexa+ to verify the visitor, issue a single-use delivery PIN, and project the camera feed onto Fire TV.',
      action: async () => {
        setActiveTab('alexa');
        await onSendMessage('Alexa, someone is at the front door. Check the Ring camera, generate an access code to unlock the porch gate for the courier, and show the feed on Fire TV in PIP.');
      }
    },
    {
      title: '4. Physical Deadbolt Unlocks via Ring Access Control',
      tab: 'ring',
      timeStr: '1:20',
      description: 'Yale Smart Deadbolt activates mechanical motor, unlatching the gate with verified 6-digit OTP code.',
      action: async () => {
        setActiveTab('ring');
        soundEffects.playSmartLockSound(true);
      }
    },
    {
      title: '5. Fire TV Picture-in-Picture (PIP) 10-Foot Experience',
      tab: 'firetv',
      timeStr: '1:45',
      description: 'Fire TV streams Ring Doorbell video in floating Picture-in-Picture over Prime Video without interrupting playback.',
      action: async () => {
        setActiveTab('firetv');
        soundEffects.playRemoteClick();
      }
    },
    {
      title: '6. Thursday Night Football & AI NextGen Stats',
      tab: 'firetv',
      timeStr: '2:10',
      description: 'Switching Fire TV to live sports with real-time AWS NextGen player stats and win probability overlays.',
      action: async () => {
        setActiveTab('firetv');
        await onDispatchTool('firetv_sync_playback_context', {
          command: 'play_sports_feed',
          sourceApp: 'Amazon Sports Live'
        });
        soundEffects.playRemoteClick();
      }
    },
    {
      title: '7. Bee Wearable AI & Devpost Submission Suite',
      tab: 'submission',
      timeStr: '2:35',
      description: 'Reviewing Bee Wearable telemetry and opening the Devpost Submission Hub with the Amazon reviewer collaborator checklist.',
      action: async () => {
        setActiveTab('submission');
        soundEffects.playHeartbeatSound();
      }
    }
  ];

  // Progression runner
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => {
          const next = prev + 1;
          // Step transition thresholds
          if (next === 25) executeStep(1);
          if (next === 50) executeStep(2);
          if (next === 80) executeStep(3);
          if (next === 105) executeStep(4);
          if (next === 130) executeStep(5);
          if (next === 155) executeStep(6);
          if (next >= 180) {
            setIsPlaying(false);
          }
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  const [voiceNarrationEnabled, setVoiceNarrationEnabled] = useState(true);

  const speakNarration = (text: string) => {
    if (!voiceNarrationEnabled || soundEffects.getMuted()) return;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch {
        // Fallback
      }
    }
  };

  const executeStep = async (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < DEMO_STEPS.length) {
      setCurrentStep(stepIndex);
      const step = DEMO_STEPS[stepIndex];
      speakNarration(step.description);
      await step.action();
    }
  };

  const handleStartDemo = async () => {
    setIsOpen(true);
    await onReset();
    setElapsedSeconds(0);
    setCurrentStep(0);
    setIsPlaying(true);
    await executeStep(0);
  };

  const handlePauseToggle = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStepJump = async (idx: number) => {
    const times = [0, 25, 50, 80, 105, 130, 155];
    setElapsedSeconds(times[idx] || 0);
    await executeStep(idx);
  };

  const handleResetDemo = async () => {
    setIsPlaying(false);
    setElapsedSeconds(0);
    setCurrentStep(0);
    await onReset();
    setActiveTab('alexa');
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <>
      {/* Floating Launch Pill when closed */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={handleStartDemo}
            className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 text-white font-bold text-xs shadow-2xl shadow-rose-600/30 hover:scale-105 active:scale-95 transition-all ring-2 ring-white/20 animate-pulse"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start 3-Minute Auto-Pilot Hackathon Demo</span>
          </button>
        </div>
      )}

      {/* Floating Auto-Pilot Director Bar when active */}
      {isOpen && (
        <div className="fixed bottom-4 left-4 right-4 max-w-4xl mx-auto z-50 bg-slate-950/95 backdrop-blur-xl border-2 border-rose-500/60 rounded-3xl p-4 shadow-2xl text-slate-100 animate-in slide-in-from-bottom duration-300">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-600 flex items-center justify-center text-white">
                <Video className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-white">
                    Auto-Pilot Hackathon Demo Director
                  </h4>
                  <span className="font-mono text-xs font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800">
                    {formatTime(elapsedSeconds)} / 3:00
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {DEMO_STEPS[currentStep].title}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setVoiceNarrationEnabled(!voiceNarrationEnabled)}
                className={`p-2 rounded-xl transition-colors ${
                  voiceNarrationEnabled
                    ? 'bg-cyan-950/80 border border-cyan-800 text-cyan-300'
                    : 'bg-slate-850 border border-slate-800 text-slate-500 hover:text-slate-300'
                }`}
                title={voiceNarrationEnabled ? "Narration Voice Active" : "Narration Voice Muted"}
                aria-label="Toggle Director Narration Voice"
              >
                {voiceNarrationEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={handlePauseToggle}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                {isPlaying ? 'Pause' : 'Resume'}
              </button>

              <button
                onClick={handleResetDemo}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                title="Restart Demo"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                title="Close Director Bar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Stepper Pills */}
          <div className="grid grid-cols-7 gap-1 mt-3">
            {DEMO_STEPS.map((step, idx) => (
              <button
                key={idx}
                onClick={() => handleStepJump(idx)}
                className={`py-1.5 px-1 rounded-lg text-center transition-all ${
                  currentStep === idx
                    ? 'bg-rose-600 text-white font-bold ring-1 ring-white/30'
                    : currentStep > idx
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                    : 'bg-slate-900 text-slate-500 hover:text-slate-300'
                }`}
              >
                <div className="text-[9px] font-mono">{step.timeStr}</div>
                <div className="text-[10px] truncate">Step {idx + 1}</div>
              </button>
            ))}
          </div>

          <p className="text-xs text-slate-300 mt-2 bg-slate-900/80 p-2 rounded-xl border border-slate-800/80 italic">
            "{DEMO_STEPS[currentStep].description}"
          </p>
        </div>
      )}
    </>
  );
};
