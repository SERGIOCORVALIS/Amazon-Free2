import React, { useState, useEffect } from 'react';
import { 
  Tv, 
  Play, 
  Pause, 
  Sparkles, 
  Layers, 
  Volume2, 
  Info, 
  Maximize, 
  Radio, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Mic, 
  Home, 
  ArrowLeft,
  Activity,
  ShieldCheck,
  X,
  Flame,
  Heart
} from 'lucide-react';
import type { FireTvState, RingDeviceState, BeeWearableState } from '../types/index.ts';
import { soundEffects } from '../lib/soundEffects.ts';

interface FireTVSimulatorProps {
  fireTvState: FireTvState;
  ringState: RingDeviceState;
  beeState: BeeWearableState;
  onUpdateFireTvState: (updater: (prev: FireTvState) => FireTvState) => void;
  onDispatchTool: (toolName: string, args: Record<string, any>) => Promise<any>;
}

export const FireTVSimulator: React.FC<FireTVSimulatorProps> = ({
  fireTvState,
  ringState,
  beeState,
  onUpdateFireTvState,
  onDispatchTool
}) => {
  const [activeTabSub, setActiveTabSub] = useState<'prime' | 'sports' | 'fitness'>('prime');
  const [remoteFeedback, setRemoteFeedback] = useState<string | null>(null);
  const [tvAlexaBarActive, setTvAlexaBarActive] = useState(false);
  const [tvAlexaText, setTvAlexaText] = useState('');

  const triggerRemoteKey = (keyName: string) => {
    soundEffects.playRemoteClick();
    setRemoteFeedback(keyName);
    setTimeout(() => setRemoteFeedback(null), 800);

    if (keyName === 'SELECT' || keyName === 'PLAY/PAUSE') {
      const nextPlay = fireTvState.mediaPlayback.playbackState === 'playing' ? 'paused' : 'playing';
      onUpdateFireTvState(prev => ({
        ...prev,
        mediaPlayback: { ...prev.mediaPlayback, playbackState: nextPlay }
      }));
    } else if (keyName === 'X-RAY') {
      onUpdateFireTvState(prev => ({
        ...prev,
        mediaPlayback: { ...prev.mediaPlayback, xRayActive: !prev.mediaPlayback.xRayActive }
      }));
    } else if (keyName === 'HOME') {
      handleSwitchToPrime();
    } else if (keyName === 'ALEXA_VOICE') {
      soundEffects.playAlexaChime();
      setTvAlexaBarActive(true);
      setTvAlexaText("Listening... 'Alexa, show front porch camera in Picture-in-Picture'");
      setTimeout(() => {
        setTvAlexaText("Streaming Ring Doorbell feed in Picture-in-Picture on Fire TV.");
        onDispatchTool('firetv_sync_playback_context', { command: 'show_doorbell_pip' });
      }, 1400);
      setTimeout(() => setTvAlexaBarActive(false), 4600);
    }
  };

  // Keyboard navigation support for authentic 10-foot UI experience
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', ' '].includes(e.key)) {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        e.preventDefault();
        if (e.key === 'ArrowUp') triggerRemoteKey('UP');
        else if (e.key === 'ArrowDown') triggerRemoteKey('DOWN');
        else if (e.key === 'ArrowLeft') triggerRemoteKey('LEFT');
        else if (e.key === 'ArrowRight') triggerRemoteKey('RIGHT');
        else if (e.key === 'Enter') triggerRemoteKey('SELECT');
        else if (e.key === ' ') triggerRemoteKey('PLAY/PAUSE');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fireTvState.mediaPlayback.playbackState]);

  const handleDismissPip = async () => {
    soundEffects.playRemoteClick();
    await onDispatchTool('firetv_sync_playback_context', { command: 'dismiss_pip' });
  };

  const handleTogglePip = async () => {
    soundEffects.playRemoteClick();
    const cmd = fireTvState.pipMode ? 'dismiss_pip' : 'show_doorbell_pip';
    await onDispatchTool('firetv_sync_playback_context', { command: cmd });
  };

  const handleSwitchToSports = async () => {
    soundEffects.playRemoteClick();
    setActiveTabSub('sports');
    await onDispatchTool('firetv_sync_playback_context', {
      command: 'play_sports_feed',
      sourceApp: 'Amazon Sports Live'
    });
  };

  const handleSwitchToFitness = () => {
    soundEffects.playRemoteClick();
    setActiveTabSub('fitness');
    onUpdateFireTvState(prev => ({
      ...prev,
      currentApp: 'Fitness+',
      sportsOverlayActive: false,
      mediaPlayback: {
        ...prev.mediaPlayback,
        title: 'Amazon Fitness+ HIIT Core with Bee Vitals Sync',
        subtitle: 'Live Telemetry via BLE 5.3'
      }
    }));
  };

  const handleSwitchToPrime = () => {
    soundEffects.playRemoteClick();
    setActiveTabSub('prime');
    onUpdateFireTvState(prev => ({
      ...prev,
      currentApp: 'Prime Video',
      sportsOverlayActive: false,
      mediaPlayback: {
        ...prev.mediaPlayback,
        title: 'The Lord of the Rings: The Rings of Power',
        subtitle: 'Prime Video • 4K UHD HDR • Dolby Atmos'
      }
    }));
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Tv className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100">Fire TV (Fire OS / Vega OS) 10-Foot Experience</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-950 text-amber-400 border border-amber-800">
                Fire TV Track
              </span>
            </div>
            <p className="text-xs text-slate-400">
              AI-Enhanced Viewing • X-Ray Actor Vision • Real-Time Sports NextGen Stats • Ring PIP Integration
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSwitchToPrime}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTabSub === 'prime'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Prime Video + X-Ray
          </button>
          <button
            onClick={handleSwitchToSports}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTabSub === 'sports'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Thursday Night Football
          </button>
          <button
            onClick={handleSwitchToFitness}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTabSub === 'fitness'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-300" />
            Fitness+ (Bee Sync)
          </button>
          <button
            onClick={handleTogglePip}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              fireTvState.pipMode
                ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            {fireTvState.pipMode ? 'Hide Ring PIP' : 'Show Ring PIP'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 10-foot Television Bezel (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative rounded-3xl p-3 bg-gradient-to-b from-slate-800 to-slate-950 border-4 border-slate-700 shadow-2xl">
            {/* Screen Bezel & Aspect Ratio */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-slate-900 shadow-inner">
              {/* Video Content Layer */}
              {activeTabSub === 'fitness' ? (
                /* Fitness+ Mode with Live Bee Vitals Sync */
                <div className="w-full h-full relative">
                  <img
                    src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&auto=format&fit=crop&q=80"
                    alt="Fitness Workout"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                  {/* Top Left Workout Title */}
                  <div className="absolute top-4 left-4 pointer-events-none">
                    <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-wider">
                      Amazon Fitness+
                    </span>
                    <h3 className="text-white font-bold text-lg drop-shadow-md mt-1">
                      HIIT Energy Blast • 30 Min
                    </h3>
                    <p className="text-emerald-300 text-xs drop-shadow flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Bee Wearable BLE 5.3 Live Sync
                    </p>
                  </div>

                  {/* Top Right Live Telemetry Ring (Heart Rate + Calories) */}
                  <div className="absolute top-4 right-4 bg-slate-950/85 backdrop-blur-md p-3 rounded-2xl border border-slate-800 text-xs space-y-2 shadow-2xl">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-rose-500 animate-pulse" />
                      <div>
                        <span className="text-[10px] text-slate-400 block">Live Heart Rate:</span>
                        <span className="font-mono font-bold text-sm text-rose-400">{beeState.heartRate} BPM</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                      <Flame className="w-4 h-4 text-amber-500" />
                      <div>
                        <span className="text-[10px] text-slate-400 block">Burned:</span>
                        <span className="font-mono font-bold text-sm text-amber-400">284 kcal</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeTabSub === 'prime' ? (
                <div className="w-full h-full relative">
                  <img
                    src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80"
                    alt="Rings of Power Scene"
                    className="w-full h-full object-cover"
                  />
                  {/* Cinematic gradient vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

                  {/* Title & Metadata Top Left */}
                  <div className="absolute top-4 left-4 pointer-events-none">
                    <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold text-[10px] uppercase tracking-wider">
                      Prime Video
                    </span>
                    <h3 className="text-white font-bold text-lg drop-shadow-md mt-1">
                      {fireTvState.mediaPlayback.title}
                    </h3>
                    <p className="text-slate-300 text-xs drop-shadow">
                      {fireTvState.mediaPlayback.subtitle}
                    </p>
                  </div>

                  {/* X-Ray AI Actor Vision Panel */}
                  {fireTvState.mediaPlayback.xRayActive && (
                    <div className="absolute left-4 bottom-16 w-80 bg-slate-950/90 backdrop-blur-md rounded-xl p-3 border border-slate-800 text-xs shadow-2xl animate-in fade-in slide-in-from-left duration-200">
                      <div className="flex items-center justify-between text-amber-400 font-bold mb-2 pb-1 border-b border-slate-800">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          Amazon X-Ray AI Vision
                        </span>
                        <span className="text-[10px] text-slate-400">Prime Video</span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <span className="text-slate-400 text-[10px] block">Actors in this scene:</span>
                          <p className="text-slate-200 font-medium">
                            {fireTvState.mediaPlayback.xRayInfo?.cast.join(', ')}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Scene Trivia:</span>
                          <p className="text-slate-300 text-[11px]">
                            {fireTvState.mediaPlayback.xRayInfo?.trivia}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Music Track Detected:</span>
                          <p className="text-cyan-300 font-mono text-[11px]">
                            {fireTvState.mediaPlayback.xRayInfo?.musicTrack}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Sports Mode */
                <div className="w-full h-full relative">
                  <img
                    src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&auto=format&fit=crop&q=80"
                    alt="Thursday Night Football"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                  {/* Sports Scoreboard Header */}
                  <div className="absolute top-4 left-4 flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider">
                      Live • TNF
                    </span>
                    <div className="bg-slate-950/90 backdrop-blur-md px-4 py-1.5 rounded-xl border border-slate-800 text-white font-mono text-sm flex items-center gap-3">
                      <span className="font-bold text-cyan-400">{fireTvState.sportsStats?.homeTeam}</span>
                      <span className="font-extrabold text-amber-400">{fireTvState.sportsStats?.score}</span>
                      <span className="font-bold text-rose-400">{fireTvState.sportsStats?.awayTeam}</span>
                    </div>
                  </div>

                  {/* AI NextGen Stats Tactical Overlay */}
                  <div className="absolute right-4 bottom-16 w-80 bg-slate-950/90 backdrop-blur-md rounded-xl p-3 border border-slate-800 text-xs shadow-2xl">
                    <div className="flex items-center justify-between text-cyan-400 font-bold mb-2 pb-1 border-b border-slate-800">
                      <span className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5" />
                        AWS NextGen AI Stats
                      </span>
                      <span className="text-[10px] text-slate-400">Live Telemetry</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Win Probability:</span>
                        <span className="font-bold text-emerald-400 font-mono">{fireTvState.sportsStats?.winProbability}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Possession:</span>
                        <span className="text-slate-200">{fireTvState.sportsStats?.possession}</span>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                        <span className="text-amber-400 font-semibold block">Key Player Impact:</span>
                        {fireTvState.sportsStats?.keyPlayer}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic Picture-in-Picture (PIP) Window: Ring Doorbell */}
              {fireTvState.pipMode && (
                <div className="absolute top-4 right-4 w-60 aspect-video rounded-xl overflow-hidden border-2 border-cyan-400 shadow-2xl bg-black animate-in fade-in zoom-in-95 duration-200">
                  <div className="relative w-full h-full">
                    <img
                      src="https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80"
                      alt="Ring PIP Feed"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1 left-1 flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-mono text-cyan-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                      Ring Porch PIP
                    </div>
                    <button
                      onClick={handleDismissPip}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/80 hover:bg-rose-600 text-white transition-colors"
                      title="Dismiss PIP"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-1 left-1 right-1 bg-black/75 px-1.5 py-0.5 rounded text-[8px] text-white truncate">
                      {ringState.detectedObjects.map(o => o.label).join(' • ')}
                    </div>
                  </div>
                </div>
              )}

              {/* Fire TV Alexa On-Screen Listening Bar */}
              {tvAlexaBarActive && (
                <div className="absolute bottom-12 left-4 right-4 z-40 bg-slate-950/95 border-2 border-cyan-400 rounded-2xl p-3 shadow-2xl backdrop-blur-xl flex items-center justify-between animate-in slide-in-from-bottom duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/50 animate-pulse">
                      <Mic className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                        Alexa on Fire TV
                      </div>
                      <div className="text-xs text-white font-medium">
                        {tvAlexaText}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span className="text-[10px] font-mono text-cyan-300">MCP Linked</span>
                  </div>
                </div>
              )}

              {/* Playback Progress Bar */}
              <div className="absolute bottom-3 left-4 right-4 flex items-center gap-3">
                <button
                  onClick={() => triggerRemoteKey('PLAY/PAUSE')}
                  className="p-1.5 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition-colors"
                >
                  {fireTvState.mediaPlayback.playbackState === 'playing' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <div className="flex-1 h-1.5 rounded-full bg-white/30 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full w-2/5" />
                </div>
                <span className="text-[10px] font-mono text-white/80">
                  23:40 / 58:12
                </span>
              </div>
            </div>

            {/* Fire TV Logo Embellishment */}
            <div className="text-center pt-2">
              <span className="text-[10px] tracking-widest font-bold text-slate-500 uppercase">
                Amazon Fire TV • Vega OS Edition
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Physical Remote Controller & TV Controls (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col items-center">
            <h3 className="font-bold text-sm text-slate-200 mb-3 flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-amber-400" />
              Fire TV Voice Remote
            </h3>

            {/* Remote Controller Hardware Body */}
            <div className="w-48 bg-slate-950 rounded-3xl p-4 border border-slate-800 shadow-2xl flex flex-col items-center space-y-4">
              {/* Alexa Voice Blue Button */}
              <button
                onClick={() => triggerRemoteKey('ALEXA_VOICE')}
                className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-transform"
                title="Hold to speak to Alexa on TV"
              >
                <Mic className="w-6 h-6" />
              </button>

              {/* D-Pad Navigation Wheel */}
              <div className="relative w-32 h-32 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                <button
                  onClick={() => triggerRemoteKey('UP')}
                  className="absolute top-1 p-2 text-slate-400 hover:text-white"
                  aria-label="D-Pad Up"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
                <button
                  onClick={() => triggerRemoteKey('DOWN')}
                  className="absolute bottom-1 p-2 text-slate-400 hover:text-white"
                  aria-label="D-Pad Down"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
                <button
                  onClick={() => triggerRemoteKey('LEFT')}
                  className="absolute left-1 p-2 text-slate-400 hover:text-white"
                  aria-label="D-Pad Left"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => triggerRemoteKey('RIGHT')}
                  className="absolute right-1 p-2 text-slate-400 hover:text-white"
                  aria-label="D-Pad Right"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Center Select Button */}
                <button
                  onClick={() => triggerRemoteKey('SELECT')}
                  className="w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center shadow-inner active:scale-95"
                >
                  OK
                </button>
              </div>

              {/* Function Buttons Row */}
              <div className="grid grid-cols-3 gap-2 w-full pt-1">
                <button
                  onClick={() => triggerRemoteKey('BACK')}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
                  aria-label="Back"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => triggerRemoteKey('HOME')}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
                  aria-label="Home"
                >
                  <Home className="w-4 h-4" />
                </button>
                <button
                  onClick={() => triggerRemoteKey('X-RAY')}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 hover:text-amber-300 flex items-center justify-center font-bold text-[10px]"
                  aria-label="Toggle X-Ray"
                >
                  X-Ray
                </button>
              </div>

              {/* Remote Feedback HUD */}
              {remoteFeedback && (
                <div className="px-3 py-1 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 text-[10px] font-mono animate-pulse">
                  Key: {remoteFeedback}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
