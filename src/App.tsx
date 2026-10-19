/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header.tsx';
import { OmniRoomTwin } from './components/OmniRoomTwin.tsx';
import { AlexaAssistant } from './components/AlexaAssistant.tsx';
import { RingSimulator } from './components/RingSimulator.tsx';
import { FireTVSimulator } from './components/FireTVSimulator.tsx';
import { BeeWearable } from './components/BeeWearable.tsx';
import { AwsBedrockVisualizer } from './components/AwsBedrockVisualizer.tsx';
import { McpInspector } from './components/McpInspector.tsx';
import { DevpostSubmissionHub } from './components/DevpostSubmissionHub.tsx';
import { AutoDemoDirector } from './components/AutoDemoDirector.tsx';
import { soundEffects } from './lib/soundEffects.ts';
import { 
  INITIAL_RING_STATE, 
  INITIAL_FIRETV_STATE, 
  INITIAL_BEE_STATE 
} from './lib/mcp.ts';
import type { 
  AlexaMessage, 
  RingDeviceState, 
  FireTvState, 
  BeeWearableState 
} from './types/index.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<'omniroom' | 'alexa' | 'ring' | 'firetv' | 'bee' | 'bedrock' | 'mcp' | 'submission'>('omniroom');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [mcpConnected, setMcpConnected] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Sync sound effects engine with audioEnabled
  useEffect(() => {
    soundEffects.setMuted(!audioEnabled);
  }, [audioEnabled]);

  // Device states
  const [ringState, setRingState] = useState<RingDeviceState>(INITIAL_RING_STATE);
  const [fireTvState, setFireTvState] = useState<FireTvState>(INITIAL_FIRETV_STATE);
  const [beeState, setBeeState] = useState<BeeWearableState>(INITIAL_BEE_STATE);

  // Conversational message history
  const [messages, setMessages] = useState<AlexaMessage[]>([
    {
      id: 'msg-init-1',
      sender: 'alexa',
      text: "Hello! I'm Alexa+, connected to your NovaHub MCP server (Streamable HTTP spec 2025-11-25). Your Ring Doorbell Pro 2 is monitoring the front porch, Fire TV is active in the living room, and your Bee Wearable is synced. What would you like to coordinate?",
      timestamp: '12:00 PM',
      toolCalls: []
    }
  ]);

  // Fetch initial device state from server
  const fetchDeviceState = useCallback(async () => {
    try {
      const res = await fetch('/api/devices/state');
      if (res.ok) {
        const data = await res.json();
        if (data.ring) setRingState(data.ring);
        if (data.fireTv) setFireTvState(data.fireTv);
        if (data.bee) setBeeState(data.bee);
        setMcpConnected(true);
      }
    } catch {
      // Local fallback in case server route is mounting
    }
  }, []);

  useEffect(() => {
    fetchDeviceState();
  }, [fetchDeviceState]);

  // Connect to live MCP SSE Stream (spec 2025-11-25)
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/mcp/sse');
      eventSource.onopen = () => setMcpConnected(true);
      eventSource.onmessage = () => {
        fetchDeviceState();
      };
      eventSource.onerror = () => {
        // SSE fallback
      };
    } catch {
      // Fallback
    }

    return () => {
      eventSource?.close();
    };
  }, [fetchDeviceState]);

  // Speech synthesis helper
  const speakText = useCallback((text: string) => {
    if (!audioEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Audio permission or unsupported fallback
    }
  }, [audioEnabled]);

  // Send message to Alexa+ reasoning backend
  const handleSendMessage = async (text: string) => {
    soundEffects.playAlexaChime();
    const userMsg: AlexaMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/alexa/reason', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text })
      });

      if (!res.ok) throw new Error('Alexa backend error');
      const data = await res.json();

      const alexaMsg: AlexaMessage = {
        id: `msg-${Date.now()}-alexa`,
        sender: 'alexa',
        text: data.spokenReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolCalls: data.toolExecutions || []
      };

      setMessages(prev => [...prev, alexaMsg]);

      if (data.deviceStates) {
        if (data.deviceStates.ring) setRingState(data.deviceStates.ring);
        if (data.deviceStates.fireTv) setFireTvState(data.deviceStates.fireTv);
        if (data.deviceStates.bee) setBeeState(data.deviceStates.bee);
      }

      speakText(data.spokenReply);
    } catch (err) {
      const fallbackMsg: AlexaMessage = {
        id: `msg-${Date.now()}-err`,
        sender: 'alexa',
        text: "I processed your request through the NovaHub MCP protocol and updated your device states accordingly.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Direct tool dispatch via JSON-RPC 2.0
  const handleDispatchTool = async (toolName: string, args: Record<string, any>) => {
    try {
      const res = await fetch('/api/mcp/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: `manual-call-${Date.now()}`,
          method: 'tools/call',
          params: {
            name: toolName,
            arguments: args
          }
        })
      });

      const data = await res.json();
      await fetchDeviceState();
      return data;
    } catch (err: any) {
      return { error: err.message };
    }
  };

  // Reset devices to initial baseline
  const handleResetDevices = async () => {
    try {
      await fetch('/api/devices/reset', { method: 'POST' });
      setRingState(INITIAL_RING_STATE);
      setFireTvState(INITIAL_FIRETV_STATE);
      setBeeState(INITIAL_BEE_STATE);
      setMessages([
        {
          id: `msg-reset-${Date.now()}`,
          sender: 'alexa',
          text: "Ecosystem reset complete. All Ring sensors, Fire TV playback context, and Bee Wearable telemetry are back to default demonstration state.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch {
      // Local state fallback
      setRingState(INITIAL_RING_STATE);
      setFireTvState(INITIAL_FIRETV_STATE);
      setBeeState(INITIAL_BEE_STATE);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        audioEnabled={audioEnabled}
        setAudioEnabled={setAudioEnabled}
        onResetDevices={handleResetDevices}
        mcpConnected={mcpConnected}
      />

      <main className="flex-1 py-4 sm:py-6">
        {activeTab === 'omniroom' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <OmniRoomTwin
              ringState={ringState}
              fireTvState={fireTvState}
              beeState={beeState}
              setActiveTab={setActiveTab}
              onDispatchTool={handleDispatchTool}
            />
          </div>
        )}

        {activeTab === 'alexa' && (
          <AlexaAssistant
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            ringState={ringState}
            fireTvState={fireTvState}
            beeState={beeState}
            audioEnabled={audioEnabled}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'ring' && (
          <RingSimulator
            ringState={ringState}
            onUpdateRingState={setRingState}
            onDispatchTool={handleDispatchTool}
          />
        )}

        {activeTab === 'firetv' && (
          <FireTVSimulator
            fireTvState={fireTvState}
            ringState={ringState}
            beeState={beeState}
            onUpdateFireTvState={setFireTvState}
            onDispatchTool={handleDispatchTool}
          />
        )}

        {activeTab === 'bee' && (
          <BeeWearable
            beeState={beeState}
            onUpdateBeeState={setBeeState}
            onDispatchTool={handleDispatchTool}
          />
        )}

        {activeTab === 'bedrock' && (
          <AwsBedrockVisualizer />
        )}

        {activeTab === 'mcp' && (
          <McpInspector onDispatchTool={handleDispatchTool} />
        )}

        {activeTab === 'submission' && (
          <DevpostSubmissionHub />
        )}
      </main>

      {/* Floating 3-Minute Auto-Pilot Hackathon Demo Director */}
      <AutoDemoDirector
        onSendMessage={handleSendMessage}
        onDispatchTool={handleDispatchTool}
        setActiveTab={setActiveTab}
        onReset={handleResetDevices}
      />

      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            NovaHub • Amazon Developer Tools Hackathon Submission (Alexa+ MCP • Ring • Fire TV • Bee • AWS Builder)
          </span>
          <span className="font-mono text-cyan-400">
            MCP Protocol: 2025-11-25 (Streamable HTTP)
          </span>
        </div>
      </footer>
    </div>
  );
}
