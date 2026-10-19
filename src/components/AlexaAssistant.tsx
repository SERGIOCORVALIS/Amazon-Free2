import React, { useState } from 'react';
import { 
  Mic, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Cpu, 
  Radio, 
  ShieldAlert, 
  Tv, 
  Watch,
  Volume2,
  Code
} from 'lucide-react';
import type { AlexaMessage, RingDeviceState, FireTvState, BeeWearableState } from '../types/index.ts';

interface AlexaAssistantProps {
  messages: AlexaMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  ringState: RingDeviceState;
  fireTvState: FireTvState;
  beeState: BeeWearableState;
  audioEnabled: boolean;
  setActiveTab: (tab: any) => void;
}

const PRESET_PROMPTS = [
  {
    title: '🚚 Courier Arrival & Cross-Device Flow',
    prompt: 'Alexa, someone is at the front door. Check the Ring camera, generate an access code to unlock the porch gate for the courier, and show the feed on Fire TV in PIP.',
    tag: 'Ring + Fire TV + MCP'
  },
  {
    title: '🏈 Fire TV Sports & AI NextGen Stats',
    prompt: 'Alexa, switch Fire TV to sports mode with real-time stats overlay and win probability.',
    tag: 'Fire TV 10-ft UX'
  },
  {
    title: '🔐 Ring Perimeter Lockdown',
    prompt: 'Alexa, lock the front door deadbolt and verify all perimeter sensors.',
    tag: 'Ring Access Control'
  },
  {
    title: '⌚ Bee Wearable Bio-Signals & Transcription',
    prompt: 'Alexa, what does my Bee Wearable report about my vitals, stress score, and recent meeting notes?',
    tag: 'Bee Wearable AI'
  }
];

export const AlexaAssistant: React.FC<AlexaAssistantProps> = ({
  messages,
  onSendMessage,
  isLoading,
  ringState,
  fireTvState,
  beeState,
  audioEnabled,
  setActiveTab
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [expandedTrace, setExpandedTrace] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const text = inputText;
    setInputText('');
    await onSendMessage(text);
  };

  const handleMicClick = () => {
    // If Web Speech Recognition is available, activate it; otherwise trigger preset simulation
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        onSendMessage(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } else {
      // Fallback: pick preset
      const sample = PRESET_PROMPTS[0].prompt;
      setInputText(sample);
      onSendMessage(sample);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Left Column: Alexa+ Agent Console */}
      <div className="lg:col-span-8 flex flex-col h-[750px] bg-slate-900/90 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-xl">
        {/* Top Agent Bar */}
        <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Glowing Alexa Ring Orb */}
            <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-slate-950 border border-cyan-500/50">
              <div 
                className={`absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 opacity-70 blur-xs ${
                  isLoading || isListening ? 'animate-spin' : 'animate-pulse'
                }`} 
              />
              <div className="relative w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-300" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-slate-100 text-sm tracking-wide">Alexa+ Agent Experience</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                  Agent Skill / MCP
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Self-Hosted Streamable HTTP MCP Server (Spec 2025-11-25) & Multi-Device Dispatch
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Audio Visualizer Wave */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-mono text-cyan-400 mr-1.5 flex items-center gap-1">
                <Volume2 className="w-3 h-3 text-cyan-400" />
                {isLoading ? 'Voice Thinking' : 'Audio Active'}
              </span>
              {[4, 12, 8, 16, 20, 14, 22, 10, 18, 12, 6, 14].map((h, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full bg-gradient-to-t from-cyan-500 to-indigo-400 transition-all ${
                    isLoading ? 'animate-bounce' : 'opacity-80'
                  }`}
                  style={{
                    height: `${isLoading ? (h * 1.2) : Math.max(4, h * 0.6)}px`,
                    animationDelay: `${i * 0.08}s`
                  }}
                />
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800/80 text-[11px] font-mono text-cyan-300 border border-slate-700">
                <Radio className="w-3 h-3 text-cyan-400" /> 3 Nodes Linked
              </span>
            </div>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {msg.sender === 'user' ? 'You' : 'Alexa+ Assistant'}
                </span>
                <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-4 shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-xs'
                    : 'bg-slate-950/80 text-slate-200 border border-slate-800 rounded-bl-xs'
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>

                {/* If Tool Calls were made by Alexa+ */}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400">
                      <span className="flex items-center gap-1 font-semibold">
                        <Cpu className="w-3.5 h-3.5" />
                        Executed MCP Tool Invocations ({msg.toolCalls.length})
                      </span>
                      <span className="text-slate-500 text-[10px]">JSON-RPC 2.0</span>
                    </div>

                    <div className="space-y-1.5">
                      {msg.toolCalls.map((tc, idx) => (
                        <div 
                          key={idx}
                          className="bg-slate-900 rounded-lg p-2.5 border border-slate-800/90 text-xs"
                        >
                          <div className="flex items-center justify-between font-mono text-[11px] text-slate-300">
                            <span className="text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              {tc.toolName}
                            </span>
                            <button
                              onClick={() => setExpandedTrace(expandedTrace === `${msg.id}-${idx}` ? null : `${msg.id}-${idx}`)}
                              className="text-cyan-400 hover:text-cyan-300 underline text-[10px] flex items-center gap-0.5"
                            >
                              <Code className="w-3 h-3" />
                              {expandedTrace === `${msg.id}-${idx}` ? 'Hide Schema' : 'Inspect Arguments'}
                            </button>
                          </div>
                          <p className="text-slate-300 text-[11px] mt-1 pl-4 border-l border-slate-700">
                            {tc.resultSummary}
                          </p>

                          {expandedTrace === `${msg.id}-${idx}` && (
                            <pre className="mt-2 p-2 rounded bg-slate-950 text-[10px] font-mono text-slate-400 overflow-x-auto border border-slate-800">
                              {JSON.stringify({
                                jsonrpc: '2.0',
                                method: 'tools/call',
                                params: {
                                  name: tc.toolName,
                                  arguments: tc.arguments
                                }
                              }, null, 2)}
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-950 border border-cyan-500/50 flex items-center justify-center animate-spin">
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-sm text-cyan-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                Alexa+ reasoning with AWS Bedrock AgentCore & invoking Streamable HTTP MCP tools...
              </div>
            </div>
          )}
        </div>

        {/* Suggested Quick Scenarios */}
        <div className="p-3 bg-slate-950/60 border-t border-slate-800/80">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Hackathon Demo Scenarios (One-Click Test)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PRESET_PROMPTS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputText(preset.prompt);
                  onSendMessage(preset.prompt);
                }}
                className="text-left p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800/80 hover:border-cyan-700/60 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
                    {preset.title}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 group-hover:bg-cyan-950 group-hover:text-cyan-400">
                    {preset.tag}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                  "{preset.prompt}"
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Prompt Input Form */}
        <form onSubmit={handleSubmit} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          <button
            type="button"
            onClick={handleMicClick}
            aria-label="Speech Input / Voice Query"
            className={`p-3 rounded-xl transition-all ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/30'
                : 'bg-slate-800 text-cyan-400 hover:bg-slate-700 hover:text-white'
            }`}
            title="Voice input (Speech recognition or demo audio)"
          >
            <Mic className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Talk to Alexa+ or type an ambient command..."
            className="flex-1 bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            aria-label="Send Utterance to Alexa+ Agent"
            className="p-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-cyan-600/20"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Right Column: Live Ecosystem Telemetry & Quick Device Switches */}
      <div className="lg:col-span-4 space-y-4">
        {/* Ring IoT Snapshot Card */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-blue-400" />
              <h3 className="font-bold text-sm text-slate-100">Ring Security Status</h3>
            </div>
            <button
              onClick={() => setActiveTab('ring')}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
            >
              Open Simulator <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Front Door Deadbolt:</span>
              <span className={`font-semibold px-2 py-0.5 rounded ${ringState.smartLockLocked ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'}`}>
                {ringState.smartLockLocked ? 'LOCKED' : 'UNLOCKED'}
              </span>
            </div>

            <div className="flex justify-between items-center p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Active Delivery PIN:</span>
              <span className="font-mono font-bold text-cyan-300">
                {ringState.activeAccessCode || 'None Active'}
              </span>
            </div>

            <div className="flex justify-between items-center p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Objects in Sight:</span>
              <span className="text-slate-200">
                {ringState.detectedObjects.map(o => o.label).join(', ')}
              </span>
            </div>
          </div>
        </div>

        {/* Fire TV Snapshot Card */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Tv className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm text-slate-100">Fire TV (10-ft Screen)</h3>
            </div>
            <button
              onClick={() => setActiveTab('firetv')}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
            >
              Open TV <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Active App / Channel:</span>
              <span className="font-semibold text-slate-200">{fireTvState.currentApp}</span>
            </div>

            <div className="flex justify-between items-center p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Picture-in-Picture (PIP):</span>
              <span className={`font-semibold px-2 py-0.5 rounded ${fireTvState.pipMode ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' : 'bg-slate-800 text-slate-400'}`}>
                {fireTvState.pipMode ? 'ACTIVE (Ring Doorbell)' : 'INACTIVE'}
              </span>
            </div>

            <div className="flex justify-between items-center p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400">Currently Streaming:</span>
              <span className="text-slate-300 truncate max-w-[150px]">{fireTvState.mediaPlayback.title}</span>
            </div>
          </div>
        </div>

        {/* Bee Wearable AI Card */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Watch className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm text-slate-100">Bee Wearable AI</h3>
            </div>
            <button
              onClick={() => setActiveTab('bee')}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
            >
              View Bio-Feed <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400 block text-[10px]">Heart Rate:</span>
              <span className="font-bold text-rose-400 text-sm">{beeState.heartRate} BPM</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400 block text-[10px]">Stress Index:</span>
              <span className="font-bold text-emerald-400 text-sm">{beeState.stressScore} / 100</span>
            </div>
          </div>
        </div>

        {/* Streamable HTTP MCP Spec Summary */}
        <div className="bg-gradient-to-br from-slate-900 to-cyan-950/40 rounded-2xl border border-cyan-900/40 p-4 text-xs">
          <div className="flex items-center gap-2 font-bold text-cyan-300 mb-1">
            <Cpu className="w-4 h-4" />
            Streamable HTTP MCP Architecture
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            NovaHub serves the official Model Context Protocol (spec 2025-11-25) over persistent SSE at <code className="text-cyan-300">/api/mcp/sse</code> and dispatches standard JSON-RPC 2.0 tool calls directly to connected Amazon smart devices.
          </p>
        </div>
      </div>
    </div>
  );
};
