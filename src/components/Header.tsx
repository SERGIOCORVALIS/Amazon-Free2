import React, { useState } from 'react';
import { 
  Radio, 
  Tv, 
  ShieldCheck, 
  Watch, 
  CloudLightning, 
  FileText, 
  Volume2, 
  VolumeX, 
  RotateCcw,
  Sparkles,
  Server,
  HelpCircle
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'omniroom' | 'alexa' | 'ring' | 'firetv' | 'bee' | 'bedrock' | 'mcp' | 'submission';
  setActiveTab: (tab: 'omniroom' | 'alexa' | 'ring' | 'firetv' | 'bee' | 'bedrock' | 'mcp' | 'submission') => void;
  audioEnabled: boolean;
  setAudioEnabled: (enabled: boolean) => void;
  onResetDevices: () => void;
  mcpConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  audioEnabled,
  setAudioEnabled,
  onResetDevices,
  mcpConnected,
}) => {
  const [showShortcuts, setShowShortcuts] = useState(false);
  return (
    <header className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-5 h-5 text-white" />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent">
                  NovaHub
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                  Alexa+ MCP
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Amazon Developer Tools Ambient Platform
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('omniroom')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'omniroom'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow ring-2 ring-cyan-500/30'
                  : 'text-cyan-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              OmniRoom 3D
            </button>

            <button
              onClick={() => setActiveTab('alexa')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'alexa'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              Alexa+ Agent
            </button>

            <button
              onClick={() => setActiveTab('ring')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'ring'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Ring Security
            </button>

            <button
              onClick={() => setActiveTab('firetv')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'firetv'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              Fire TV (10-ft)
            </button>

            <button
              onClick={() => setActiveTab('bee')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'bee'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Watch className="w-3.5 h-3.5" />
              Bee Wearable
            </button>

            <button
              onClick={() => setActiveTab('bedrock')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'bedrock'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <CloudLightning className="w-3.5 h-3.5" />
              AWS Bedrock
            </button>

            <button
              onClick={() => setActiveTab('mcp')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'mcp'
                  ? 'bg-gradient-to-r from-cyan-600 to-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              MCP Server
            </button>

            <button
              onClick={() => setActiveTab('submission')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'submission'
                  ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow ring-2 ring-pink-500/30'
                  : 'text-amber-300 hover:text-white hover:bg-amber-950/40 border border-amber-500/30'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Devpost Hub (10% Bonus)
            </button>
          </nav>

          {/* Status & Actions */}
          <div className="flex items-center gap-2">
            {/* MCP SSE Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <span className={`w-2 h-2 rounded-full ${mcpConnected ? 'bg-emerald-400 shadow-emerald-400/50 shadow-sm animate-pulse' : 'bg-amber-400'}`} />
              <span className="font-mono text-[11px] text-slate-400">MCP 2025-11-25</span>
            </div>

            {/* Keyboard Shortcuts Help Button */}
            <button
              onClick={() => setShowShortcuts(!showShortcuts)}
              title="Keyboard Shortcuts Cheatsheet"
              aria-label="Keyboard Shortcuts"
              className={`p-2 rounded-lg border transition-colors ${
                showShortcuts
                  ? 'bg-amber-950/70 border-amber-700 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Audio Speech toggle */}
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              title={audioEnabled ? 'Alexa Voice Speech Enabled' : 'Alexa Voice Speech Muted'}
              aria-label={audioEnabled ? 'Mute Alexa Voice' : 'Unmute Alexa Voice'}
              className={`p-2 rounded-lg border transition-colors ${
                audioEnabled
                  ? 'bg-cyan-950/70 border-cyan-800 text-cyan-300'
                  : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
            >
              {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Reset Devices Button */}
            <button
              onClick={onResetDevices}
              title="Reset Simulated Ecosystem State"
              aria-label="Reset Simulated Ecosystem State"
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Keyboard Shortcuts Dialog Modal */}
        {showShortcuts && (
          <div className="absolute top-16 right-4 sm:right-8 w-80 bg-slate-950/95 border-2 border-slate-800 rounded-2xl p-4 shadow-2xl z-50 text-xs backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
              <span className="font-bold text-slate-100 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                Live Demo Keyboard Shortcuts
              </span>
              <button 
                onClick={() => setShowShortcuts(false)}
                className="text-slate-500 hover:text-slate-300"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 text-slate-300">
              <div className="flex justify-between items-center py-1 border-b border-slate-900">
                <span className="text-slate-400">TV Remote D-Pad</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-mono text-[10px]">↑ ↓ ← →</kbd>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-900">
                <span className="text-slate-400">TV Select / Confirm</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-mono text-[10px]">Enter</kbd>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-900">
                <span className="text-slate-400">TV Play / Pause</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-mono text-[10px]">Space</kbd>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-900">
                <span className="text-slate-400">Toggle X-Ray Vision</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-300 font-mono text-[10px]">X</kbd>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Auto-Pilot Demo</span>
                <span className="text-[10px] text-rose-400 font-semibold">Floating Red Pill</span>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Sub-Navigation */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1 scrollbar-none border-t border-slate-800/60">
          {[
            { id: 'omniroom', label: 'OmniRoom 3D', icon: Sparkles },
            { id: 'alexa', label: 'Alexa+', icon: Radio },
            { id: 'ring', label: 'Ring', icon: ShieldCheck },
            { id: 'firetv', label: 'Fire TV', icon: Tv },
            { id: 'bee', label: 'Bee AI', icon: Watch },
            { id: 'bedrock', label: 'AWS Bedrock', icon: CloudLightning },
            { id: 'mcp', label: 'MCP', icon: Server },
            { id: 'submission', label: 'Devpost Hub', icon: FileText }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1 px-3 py-1 text-xs whitespace-nowrap rounded-md font-medium ${
                  activeTab === tab.id
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-400 bg-slate-900/60 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3 h-3" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
