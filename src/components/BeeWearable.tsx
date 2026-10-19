import React, { useState } from 'react';
import { 
  Watch, 
  Heart, 
  Activity, 
  Mic, 
  Brain, 
  BatteryCharging, 
  Zap, 
  Plus, 
  Terminal, 
  CheckCircle2, 
  Volume2,
  FileText,
  Sparkles
} from 'lucide-react';
import { soundEffects } from '../lib/soundEffects.ts';
import type { BeeWearableState } from '../types/index.ts';

interface BeeWearableProps {
  beeState: BeeWearableState;
  onUpdateBeeState: (updater: (prev: BeeWearableState) => BeeWearableState) => void;
  onDispatchTool: (toolName: string, args: Record<string, any>) => Promise<any>;
}

export const BeeWearable: React.FC<BeeWearableProps> = ({
  beeState,
  onUpdateBeeState,
  onDispatchTool
}) => {
  const [newNoteInput, setNewNoteInput] = useState('');
  const [hapticTriggered, setHapticTriggered] = useState(false);
  const [isRecordingMemo, setIsRecordingMemo] = useState(false);

  const handleTriggerHaptic = async () => {
    soundEffects.playHeartbeatSound();
    setHapticTriggered(true);
    await onDispatchTool('bee_wearable_vitals_telemetry', { metric: 'trigger_haptic' });
    setTimeout(() => setHapticTriggered(false), 1200);
  };

  const handleRecordVoiceMemo = () => {
    soundEffects.playRemoteClick();
    setIsRecordingMemo(true);

    setTimeout(() => {
      soundEffects.playHeartbeatSound();
      setIsRecordingMemo(false);

      const capturedNotes = [
        "Architecture checkpoint: Alexa+ Streamable HTTP MCP (spec 2025-11-25) unified with Ring and Fire TV 10-ft experience.",
        "Amazon Bedrock Guardrails v3.1 successfully verified biometric thresholds; model latency 42ms.",
        "Devpost submission package verified: 4 friction logs ready for 10% judging bonus review."
      ];
      const randomNote = capturedNotes[Math.floor(Math.random() * capturedNotes.length)];

      const newMemo = {
        id: `note-voice-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        note: `🎙️ [Bee Ambient Voice Memo]: ${randomNote}`,
        tags: ['ambient_speech', 'bedrock_summary', 'bee_cli']
      };

      onUpdateBeeState(prev => ({
        ...prev,
        recentNotes: [newMemo, ...prev.recentNotes],
        liveTranscription: randomNote
      }));
    }, 2200);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteInput.trim()) return;

    const newNote = {
      id: `note-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      note: newNoteInput,
      tags: ['manual', 'productivity']
    };

    onUpdateBeeState(prev => ({
      ...prev,
      recentNotes: [newNote, ...prev.recentNotes]
    }));
    setNewNoteInput('');
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Watch className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100">Bee Wearable AI & Apple Watch Companion</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                Bee Wearable Track
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live Bio-Telemetry • Ambient Speech-to-Productivity Engine • Bee CLI & Agent Skill Pipeline
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleTriggerHaptic}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              hapticTriggered
                ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-md'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            {hapticTriggered ? 'Haptic Vibrating!' : 'Trigger Haptic Buzz'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Device Bio-Telemetry Dashboard (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Hardware Status Tile */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-bold text-slate-200 text-sm">Bee Node connected via BLE 5.3 & MCP Stream</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <BatteryCharging className="w-4 h-4 text-emerald-400" />
                <span>{beeState.battery}%</span>
              </div>
            </div>

            {/* Vitals Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Heart Rate */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between text-rose-400 mb-1">
                  <span className="text-[10px] font-semibold uppercase text-slate-400">Heart Rate</span>
                  <Heart className="w-4 h-4 animate-pulse" />
                </div>
                <div className="text-xl font-mono font-bold text-slate-100">
                  {beeState.heartRate} <span className="text-xs text-slate-400 font-normal">BPM</span>
                </div>
                <span className="text-[10px] text-emerald-400">Normal Sinus</span>
              </div>

              {/* Stress Index */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between text-amber-400 mb-1">
                  <span className="text-[10px] font-semibold uppercase text-slate-400">Stress Score</span>
                  <Activity className="w-4 h-4" />
                </div>
                <div className="text-xl font-mono font-bold text-slate-100">
                  {beeState.stressScore} <span className="text-xs text-slate-400 font-normal">/ 100</span>
                </div>
                <span className={`text-[10px] font-semibold ${beeState.stressScore > 70 ? 'text-rose-400' : beeState.stressScore > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {beeState.stressScore > 70 ? 'High Stress' : beeState.stressScore > 40 ? 'Normal Load' : 'Relaxed Focus'}
                </span>
              </div>

              {/* Activity State */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between text-blue-400 mb-1">
                  <span className="text-[10px] font-semibold uppercase text-slate-400">Context</span>
                  <Brain className="w-4 h-4" />
                </div>
                <div className="text-base font-bold text-slate-100 capitalize">
                  {beeState.activityState.replace('_', ' ')}
                </div>
                <span className="text-[10px] text-slate-400">Autonomous</span>
              </div>

              {/* Ambient Noise */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between text-purple-400 mb-1">
                  <span className="text-[10px] font-semibold uppercase text-slate-400">Acoustic dB</span>
                  <Volume2 className="w-4 h-4" />
                </div>
                <div className="text-xl font-mono font-bold text-slate-100">
                  {beeState.ambientNoiseDb} <span className="text-xs text-slate-400 font-normal">dB</span>
                </div>
                <span className="text-[10px] text-emerald-400">Quiet Studio</span>
              </div>
            </div>

            {/* Real-time Electrocardiogram (ECG) Waveform Display */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-rose-400 flex items-center gap-1.5 font-mono">
                  <Activity className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                  Real-time Cardiac Rhythm (Lead I ECG Waveform)
                </span>
                <span className="text-[10px] font-mono text-emerald-400">P-Q-R-S-T Synced • 72 BPM</span>
              </div>

              {/* SVG Animated ECG Trace */}
              <div className="h-16 w-full rounded-lg bg-black/60 border border-slate-900 overflow-hidden relative flex items-center">
                <svg className="w-full h-full text-rose-500" preserveAspectRatio="none" viewBox="0 0 500 80">
                  <path
                    d="M 0 40 L 40 40 L 50 35 L 60 45 L 70 40 L 90 40 L 95 10 L 105 75 L 115 30 L 125 45 L 135 40 L 170 40 L 180 32 L 195 40 L 250 40 L 290 40 L 300 35 L 310 45 L 320 40 L 340 40 L 345 10 L 355 75 L 365 30 L 375 45 L 385 40 L 420 40 L 430 32 L 445 40 L 500 40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="opacity-90"
                  />
                </svg>
                {/* Sweeping scan bar overlay */}
                <div className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent to-rose-400/20 animate-pulse" style={{ left: '60%' }} />
              </div>

              {/* Interactive Stress Level Simulation Controls */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-400 font-semibold">Simulate Biometric Load:</span>
                <div className="flex gap-1.5">
                  {[
                    { label: 'Relaxed (24)', stress: 24, hr: 68 },
                    { label: 'Active Work (48)', stress: 48, hr: 82 },
                    { label: 'High Stress (85)', stress: 85, hr: 112 }
                  ].map((preset) => (
                    <button
                      key={preset.stress}
                      onClick={() => {
                        onUpdateBeeState(prev => ({
                          ...prev,
                          stressScore: preset.stress,
                          heartRate: preset.hr
                        }));
                        if (preset.stress > 70) {
                          onDispatchTool('ambient_scene_controller', {
                            scene: 'relax_and_calm',
                            brightnessPercent: 30
                          });
                        }
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                        beeState.stressScore === preset.stress
                          ? 'bg-rose-600 text-white shadow'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Audio Transcription Feed */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                  Live Ambient Transcription (Continuous Bee Audio Stream)
                </span>
                <button
                  onClick={handleRecordVoiceMemo}
                  disabled={isRecordingMemo}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    isRecordingMemo
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  {isRecordingMemo ? 'Recording & Bedrock Parsing...' : 'Capture Ambient Voice Memo'}
                </button>
              </div>

              {isRecordingMemo && (
                <div className="flex items-center justify-center gap-1 py-2 bg-rose-950/40 rounded-lg border border-rose-800/60">
                  <div className="w-1 h-4 bg-rose-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1 h-6 bg-rose-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1 h-8 bg-rose-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <div className="w-1 h-5 bg-rose-400 animate-bounce" style={{ animationDelay: '450ms' }} />
                  <div className="w-1 h-3 bg-rose-400 animate-bounce" style={{ animationDelay: '600ms' }} />
                  <span className="ml-2 text-xs font-mono text-rose-300">Listening to ambient speech...</span>
                </div>
              )}

              <p className="text-xs text-slate-200 italic font-mono bg-slate-900/80 p-3 rounded-lg border border-slate-800/80">
                "{beeState.liveTranscription}"
              </p>
            </div>
          </div>

          {/* Bee CLI & MCP Integration Terminal View */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 font-mono text-xs shadow-xl space-y-2">
            <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                <Terminal className="w-3.5 h-3.5" />
                Bee CLI / MCP Server Telemetry Endpoint
              </span>
              <span className="text-[10px] text-emerald-400">LIVE SYNCED</span>
            </div>
            <pre className="text-[11px] text-slate-300 overflow-x-auto space-y-1">
              <div><span className="text-emerald-400">$</span> bee device status --stream</div>
              <div className="text-slate-500">Device ID: bee-hw-04x81 • Firmware: 2.14.0-amazon-preview</div>
              <div><span className="text-emerald-400">$</span> bee mcp export --endpoint http://localhost:3000/api/mcp/messages</div>
              <div className="text-cyan-300">[MCP-2025-11-25] Registered tool: bee_wearable_vitals_telemetry (OK)</div>
            </pre>
          </div>
        </div>

        {/* Right Column: Personal Productivity & Captured Memories (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-400" />
                Autonomous Memory Notes
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">
                {beeState.recentNotes.length} Items
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Useful context extracted autonomously from ambient speech and wearable triggers to keep your workflow synchronized.
            </p>

            {/* Note Creation Form */}
            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                value={newNoteInput}
                onChange={(e) => setNewNoteInput(e.target.value)}
                placeholder="Add contextual memory note..."
                className="flex-1 bg-slate-950 border border-slate-800 text-xs text-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Log
              </button>
            </form>

            {/* Note Cards List */}
            <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-thin">
              {beeState.recentNotes.map((item) => (
                <div 
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between text-slate-500 text-[10px]">
                    <span className="font-mono">{item.timestamp}</span>
                    <div className="flex gap-1">
                      {item.tags.map((t, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-800">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-200 text-xs leading-relaxed">
                    {item.note}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
