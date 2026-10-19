/**
 * Core type definitions for NovaHub - Alexa+ MCP & Ambient Smart Living Platform
 */

export interface McpTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
      default?: any;
    }>;
    required?: string[];
  };
}

export interface McpCallToolRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: 'tools/call';
  params: {
    name: string;
    arguments: Record<string, any>;
  };
}

export interface McpCallToolResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: {
    content: Array<{
      type: 'text' | 'image' | 'resource';
      text?: string;
      data?: string;
      mimeType?: string;
    }>;
    isError?: boolean;
    metadata?: Record<string, any>;
  };
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export interface RingDeviceState {
  doorbellOnline: boolean;
  batteryLevel: number;
  motionDetected: boolean;
  lastMotionTimestamp: string;
  smartLockLocked: boolean;
  activeAccessCode: string | null;
  sirenActive: boolean;
  intercomActive: boolean;
  streamResolution: '1080p' | '720p' | '4K';
  nightVision: boolean;
  detectedObjects: Array<{
    id: string;
    label: 'Courier' | 'Package' | 'Visitor' | 'Vehicle' | 'Pet';
    confidence: number;
    bbox: [number, number, number, number]; // x, y, width, height %
  }>;
  recentEvents: Array<{
    id: string;
    time: string;
    type: 'motion' | 'ring' | 'unlock' | 'lock' | 'siren' | 'code_issued';
    summary: string;
    severity: 'info' | 'warning' | 'alert';
  }>;
}

export interface FireTvState {
  powerState: 'on' | 'standby';
  currentApp: 'Prime Video' | 'Amazon Sports Live' | 'Fitness+' | 'Ambient Art' | 'Settings';
  mediaPlayback: {
    title: string;
    subtitle: string;
    playbackState: 'playing' | 'paused' | 'buffering';
    currentTime: number; // seconds
    duration: number; // seconds
    posterUrl: string;
    xRayActive: boolean;
    xRayInfo?: {
      cast: string[];
      trivia: string;
      musicTrack: string;
    };
  };
  pipMode: boolean;
  pipSource: 'ring_doorbell' | 'baby_monitor' | 'bee_vitals' | null;
  volume: number;
  sportsOverlayActive: boolean;
  sportsStats?: {
    homeTeam: string;
    awayTeam: string;
    score: string;
    possession: string;
    winProbability: string;
    keyPlayer: string;
  };
}

export interface BeeWearableState {
  connected: boolean;
  battery: number;
  heartRate: number;
  stressScore: number; // 0 - 100
  activityState: 'sitting' | 'walking' | 'working' | 'in_meeting';
  ambientNoiseDb: number;
  liveTranscription: string;
  recentNotes: Array<{
    id: string;
    timestamp: string;
    note: string;
    tags: string[];
  }>;
}

export interface AlexaMessage {
  id: string;
  sender: 'user' | 'alexa' | 'system';
  text: string;
  timestamp: string;
  toolCalls?: Array<{
    toolName: string;
    arguments: Record<string, any>;
    resultSummary: string;
    timestamp: string;
    status: 'success' | 'running' | 'failed';
  }>;
  audioGenerated?: boolean;
}

export interface BedrockAgentTrace {
  step: number;
  type: 'orchestration' | 'model_invoke' | 'knowledge_base' | 'mcp_tool' | 'guardrail';
  title: string;
  details: string;
  latencyMs: number;
}
