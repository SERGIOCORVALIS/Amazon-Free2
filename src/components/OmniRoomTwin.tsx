import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Tv, 
  Watch, 
  Radio, 
  Sparkles, 
  Lock, 
  Unlock, 
  Eye, 
  Activity, 
  Sun, 
  Moon, 
  Layers, 
  Box, 
  User, 
  Maximize2 
} from 'lucide-react';
import type { RingDeviceState, FireTvState, BeeWearableState } from '../types/index.ts';
import { soundEffects } from '../lib/soundEffects.ts';

interface OmniRoomTwinProps {
  ringState: RingDeviceState;
  fireTvState: FireTvState;
  beeState: BeeWearableState;
  setActiveTab: (tab: any) => void;
  onDispatchTool: (toolName: string, args: Record<string, any>) => Promise<any>;
}

export const OmniRoomTwin: React.FC<OmniRoomTwinProps> = ({
  ringState,
  fireTvState,
  beeState,
  setActiveTab,
  onDispatchTool
}) => {
  const [isNightMode, setIsNightMode] = useState(true);
  const [selectedZone, setSelectedZone] = useState<'porch' | 'tv' | 'desk' | 'hub'>('porch');

  const handleToggleLock = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const isUnlocking = ringState.smartLockLocked;
    soundEffects.playSmartLockSound(isUnlocking);
    await onDispatchTool('ring_control_smart_lock', {
      action: isUnlocking ? 'unlock' : 'lock'
    });
  };

  const handleRingChime = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.playRingDoorbellChime();
  };

  return (
    <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-4 sm:p-6 shadow-2xl backdrop-blur-xl space-y-4">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-slate-100">
                OmniRoom 3D Spatial Digital Twin
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                Live IoT Telemetry Mesh
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive spatial twin visualizing Ring Porch, Fire TV Wall, Bee Wearable, and Alexa+ MCP Node
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Day / Night Room Lighting */}
          <button
            onClick={() => setIsNightMode(!isNightMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              isNightMode
                ? 'bg-indigo-950/70 border-indigo-800 text-indigo-300'
                : 'bg-amber-950/40 border-amber-800 text-amber-300'
            }`}
          >
            {isNightMode ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
            {isNightMode ? 'Night Ambient Lighting' : 'Day Sunlight Mode'}
          </button>
        </div>
      </div>

      {/* 3D Isometric Spatial Stage */}
      <div 
        className={`relative w-full h-[460px] rounded-2xl overflow-hidden border border-slate-800/80 transition-all duration-700 select-none ${
          isNightMode 
            ? 'bg-gradient-to-b from-slate-950 via-slate-900 to-[#070b14]' 
            : 'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900'
        }`}
      >
        {/* Isometric Grid Floor Overlay */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.25) 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Ambient Ambilight Glow behind TV Area */}
        <div 
          className="absolute top-12 left-1/4 w-96 h-48 rounded-full blur-3xl opacity-35 pointer-events-none transition-colors duration-500"
          style={{
            backgroundColor: fireTvState.pipMode ? '#06b6d4' : '#f59e0b'
          }}
        />

        {/* ============================================================== */}
        {/* ZONE 1: Front Porch & Ring Access Control (Left-Bottom Area) */}
        {/* ============================================================== */}
        <div 
          onClick={() => setSelectedZone('porch')}
          className={`absolute left-4 sm:left-8 bottom-6 w-72 sm:w-80 p-4 rounded-2xl border transition-all cursor-pointer backdrop-blur-md ${
            selectedZone === 'porch'
              ? 'bg-slate-950/90 border-blue-500 shadow-xl shadow-blue-500/10 ring-2 ring-blue-500/30'
              : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping" />
              <span className="font-bold text-xs text-blue-300 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Front Porch Zone
              </span>
            </div>
            <button
              onClick={handleRingChime}
              className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white transition-colors"
            >
              Test Chime
            </button>
          </div>

          {/* Mini Ring Cam Preview */}
          <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-black mb-3">
            <img
              src="https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80"
              alt="Porch Stream"
              className="w-full h-full object-cover"
            />
            {/* Courier & Box Pin Overlays */}
            <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/75 text-[9px] font-mono text-cyan-300">
              Ring Pro 2 • 1080p
            </div>
            <div className="absolute bottom-2 left-2 flex gap-1">
              {ringState.detectedObjects.map(o => (
                <span key={o.id} className="px-1.5 py-0.5 rounded bg-emerald-500/80 text-black font-bold text-[9px]">
                  {o.label}
                </span>
              ))}
            </div>
          </div>

          {/* Smart Lock Status & One-Touch Toggle */}
          <div className="flex items-center justify-between bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${ringState.smartLockLocked ? 'bg-rose-950 text-rose-400' : 'bg-emerald-950 text-emerald-400'}`}>
                {ringState.smartLockLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </div>
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block">Yale Deadbolt:</span>
                <span className={`text-xs font-bold ${ringState.smartLockLocked ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {ringState.smartLockLocked ? 'LOCKED' : 'UNLOCKED'}
                </span>
              </div>
            </div>

            <button
              onClick={handleToggleLock}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-md ${
                ringState.smartLockLocked
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-amber-600 hover:bg-amber-500 text-white'
              }`}
            >
              {ringState.smartLockLocked ? 'Unlock' : 'Lock'}
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* ZONE 2: Living Room Fire TV 10-Foot Wall (Center-Top Area) */}
        {/* ============================================================== */}
        <div 
          onClick={() => setSelectedZone('tv')}
          className={`absolute left-1/2 -translate-x-1/2 top-4 w-80 sm:w-96 p-4 rounded-2xl border transition-all cursor-pointer backdrop-blur-md ${
            selectedZone === 'tv'
              ? 'bg-slate-950/90 border-amber-500 shadow-xl shadow-amber-500/10 ring-2 ring-amber-500/30'
              : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-xs text-amber-300 uppercase tracking-wider flex items-center gap-1">
              <Tv className="w-3.5 h-3.5" />
              Living Room TV Wall (Fire OS / Vega)
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              fireTvState.pipMode ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-slate-800 text-slate-400'
            }`}>
              {fireTvState.pipMode ? 'PIP ACTIVE' : 'FULL SCREEN'}
            </span>
          </div>

          {/* TV Display Frame */}
          <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-slate-700 bg-black shadow-inner">
            <img
              src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80"
              alt="TV Display"
              className="w-full h-full object-cover"
            />
            {/* Ambient Ambilight Edge Overlay */}
            <div className="absolute inset-0 border-2 border-amber-400/30 pointer-events-none" />

            <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-semibold text-white">
              {fireTvState.currentApp}
            </div>

            {/* In-Screen PIP Window */}
            {fireTvState.pipMode && (
              <div className="absolute top-2 right-2 w-28 aspect-video rounded-lg overflow-hidden border-2 border-cyan-400 bg-black shadow-lg animate-in fade-in zoom-in-95">
                <img
                  src="https://images.unsplash.com/photo-1513694203232-719a280e022f?w=300&auto=format&fit=crop&q=80"
                  alt="PIP Porch"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0.5 left-0.5 text-[8px] bg-black/80 text-cyan-300 px-1 rounded">
                  Ring PIP
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* ZONE 3: Workspace & Bee Wearable Dock (Right-Bottom Area) */}
        {/* ============================================================== */}
        <div 
          onClick={() => setSelectedZone('desk')}
          className={`absolute right-4 sm:right-8 bottom-6 w-64 sm:w-72 p-4 rounded-2xl border transition-all cursor-pointer backdrop-blur-md ${
            selectedZone === 'desk'
              ? 'bg-slate-950/90 border-emerald-500 shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-500/30'
              : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-xs text-emerald-300 uppercase tracking-wider flex items-center gap-1">
              <Watch className="w-3.5 h-3.5" />
              Bee AI Dock
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Heart Rate:</span>
              <span className="font-bold font-mono text-rose-400">{beeState.heartRate} BPM</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400">Stress Index:</span>
              <span className="font-bold font-mono text-emerald-400">{beeState.stressScore} / 100</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-[10px] text-slate-300 italic truncate">
              "{beeState.liveTranscription.slice(0, 48)}..."
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* CENTRAL ALEXA+ MCP AMBIENT ORB (Center of the Room) */}
        {/* ============================================================== */}
        <div 
          onClick={() => setSelectedZone('hub')}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center cursor-pointer group"
        >
          <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-slate-950/90 border-2 border-cyan-400 shadow-2xl shadow-cyan-500/40">
            {/* Pulsing Acoustic Wave Ring */}
            <div className="absolute inset-0 rounded-full border-2 border-cyan-400/40 animate-ping" />
            <div className="absolute -inset-2 rounded-full border border-blue-500/30 animate-pulse" />
            <Sparkles className="w-8 h-8 text-cyan-300 group-hover:scale-110 transition-transform" />
          </div>
          <span className="mt-2 px-2.5 py-1 rounded-full bg-slate-950/90 text-cyan-300 font-mono text-[10px] border border-cyan-800/80 shadow-md">
            Alexa+ MCP Hub
          </span>
        </div>
      </div>
    </div>
  );
};
