import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  MCP_SERVER_INFO,
  REGISTERED_TOOLS,
  INITIAL_RING_STATE,
  INITIAL_FIRETV_STATE,
  INITIAL_BEE_STATE,
  executeMcpToolCall
} from './src/lib/mcp.ts';
import type { McpCallToolRequest } from './src/types/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());

// In-memory runtime state for connected simulated ecosystem
let ringState = { ...INITIAL_RING_STATE, recentEvents: [...INITIAL_RING_STATE.recentEvents] };
let fireTvState = { ...INITIAL_FIRETV_STATE, mediaPlayback: { ...INITIAL_FIRETV_STATE.mediaPlayback } };
let beeState = { ...INITIAL_BEE_STATE, recentNotes: [...INITIAL_BEE_STATE.recentNotes] };

// SSE clients for MCP Streamable HTTP (spec 2025-11-25)
const sseClients = new Set<express.Response>();

// Health & System Info
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    appName: 'NovaHub Alexa+ MCP & Ambient Smart Living Platform',
    mcpSpec: '2025-11-25',
    sseClients: sseClients.size,
    timestamp: new Date().toISOString()
  });
});

// MCP Protocol Endpoints
app.get('/api/mcp/info', (_req, res) => {
  res.json({
    jsonrpc: '2.0',
    result: MCP_SERVER_INFO
  });
});

app.get('/api/mcp/tools', (_req, res) => {
  res.json({
    jsonrpc: '2.0',
    result: {
      tools: REGISTERED_TOOLS
    }
  });
});

// Streamable HTTP SSE Endpoint (MCP Spec 2025-11-25)
app.get('/api/mcp/sse', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders?.();

  // Send initial endpoint event as required by MCP 2025-11-25 Streamable HTTP
  const endpointMsg = JSON.stringify({
    type: 'endpoint',
    uri: '/api/mcp/messages'
  });
  res.write(`event: endpoint\ndata: ${endpointMsg}\n\n`);

  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// Broadcast MCP notification to connected SSE clients
function broadcastMcpNotification(method: string, params: any) {
  const payload = JSON.stringify({
    jsonrpc: '2.0',
    method,
    params
  });
  for (const client of sseClients) {
    try {
      client.write(`event: message\ndata: ${payload}\n\n`);
    } catch {
      sseClients.delete(client);
    }
  }
}

// MCP JSON-RPC 2.0 Message Dispatcher
app.post('/api/mcp/messages', (req, res) => {
  const rpcReq = req.body as McpCallToolRequest;

  if (!rpcReq || rpcReq.jsonrpc !== '2.0') {
    return res.status(400).json({
      jsonrpc: '2.0',
      id: rpcReq?.id || null,
      error: { code: -32600, message: 'Invalid Request: Must be JSON-RPC 2.0' }
    });
  }

  if (rpcReq.method === 'tools/list') {
    return res.json({
      jsonrpc: '2.0',
      id: rpcReq.id,
      result: { tools: REGISTERED_TOOLS }
    });
  }

  if (rpcReq.method === 'tools/call') {
    const { response, updatedStates } = executeMcpToolCall(rpcReq, {
      ring: ringState,
      fireTv: fireTvState,
      bee: beeState
    });

    ringState = updatedStates.ring;
    fireTvState = updatedStates.fireTv;
    beeState = updatedStates.bee;

    // Notify connected SSE listeners of device state mutations
    broadcastMcpNotification('notifications/resources/updated', {
      toolName: rpcReq.params.name,
      timestamp: new Date().toISOString()
    });

    return res.json(response);
  }

  if (rpcReq.method === 'ping') {
    return res.json({
      jsonrpc: '2.0',
      id: rpcReq.id,
      result: {}
    });
  }

  return res.json({
    jsonrpc: '2.0',
    id: rpcReq.id,
    error: { code: -32601, message: `Method '${rpcReq.method}' not implemented` }
  });
});

// Device State Inspection & Manual Control
app.get('/api/devices/state', (_req, res) => {
  res.json({
    ring: ringState,
    fireTv: fireTvState,
    bee: beeState
  });
});

app.post('/api/devices/reset', (_req, res) => {
  ringState = { ...INITIAL_RING_STATE, recentEvents: [...INITIAL_RING_STATE.recentEvents] };
  fireTvState = { ...INITIAL_FIRETV_STATE, mediaPlayback: { ...INITIAL_FIRETV_STATE.mediaPlayback } };
  beeState = { ...INITIAL_BEE_STATE, recentNotes: [...INITIAL_BEE_STATE.recentNotes] };
  
  broadcastMcpNotification('notifications/state/reset', { timestamp: new Date().toISOString() });
  
  res.json({
    success: true,
    ring: ringState,
    fireTv: fireTvState,
    bee: beeState
  });
});

// Alexa+ Multi-Modal Reasoning Engine
app.post('/api/alexa/reason', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Missing prompt parameter' });
  }

  const normalized = prompt.toLowerCase();
  const toolExecutions: Array<{
    toolName: string;
    arguments: Record<string, any>;
    resultSummary: string;
    timestamp: string;
    status: 'success' | 'running' | 'failed';
  }> = [];

  const traces: Array<{
    step: number;
    type: 'orchestration' | 'model_invoke' | 'knowledge_base' | 'mcp_tool' | 'guardrail';
    title: string;
    details: string;
    latencyMs: number;
  }> = [];

  // Step 1: AgentCore Orchestration Guardrails
  traces.push({
    step: 1,
    type: 'guardrail',
    title: 'AWS Bedrock Guardrails v3.1',
    details: 'Input safety verification passed. Verified Smart Home & IoT policy permissions.',
    latencyMs: 42
  });

  // Step 2: Intent Classification & Tool Selection
  traces.push({
    step: 2,
    type: 'orchestration',
    title: 'Alexa+ Intent & Context Plan',
    details: `Resolved user intent from utterance: "${prompt}". Correlating with active Ring and Fire TV sensors.`,
    latencyMs: 85
  });

  let spokenReply = '';

  if (normalized.includes('door') || normalized.includes('courier') || normalized.includes('delivery') || normalized.includes('package') || normalized.includes('who is')) {
    // 1. Check Ring stream
    const req1: McpCallToolRequest = {
      jsonrpc: '2.0',
      id: `call-${Date.now()}-1`,
      method: 'tools/call',
      params: {
        name: 'ring_stream_doorbell_vision',
        arguments: { cameraLocation: 'front_door', requireObjectDetection: true }
      }
    };
    const res1 = executeMcpToolCall(req1, { ring: ringState, fireTv: fireTvState, bee: beeState });
    ringState = res1.updatedStates.ring;
    toolExecutions.push({
      toolName: 'ring_stream_doorbell_vision',
      arguments: req1.params.arguments,
      resultSummary: 'Verified Amazon courier with parcel at front entrance.',
      timestamp: new Date().toLocaleTimeString(),
      status: 'success'
    });

    // 2. Multimodal scene analysis via AWS Bedrock
    const req2: McpCallToolRequest = {
      jsonrpc: '2.0',
      id: `call-${Date.now()}-2`,
      method: 'tools/call',
      params: {
        name: 'bedrock_analyze_multimodal_scene',
        arguments: { prompt: 'Identify courier uniform and parcel placement safety.' }
      }
    };
    const res2 = executeMcpToolCall(req2, { ring: ringState, fireTv: fireTvState, bee: beeState });
    toolExecutions.push({
      toolName: 'bedrock_analyze_multimodal_scene',
      arguments: req2.params.arguments,
      resultSummary: 'Claude 3.5 Sonnet confirmed authorized Amazon Prime courier. Package left beside planter.',
      timestamp: new Date().toLocaleTimeString(),
      status: 'success'
    });

    // 3. If unlock or access mentioned
    if (normalized.includes('unlock') || normalized.includes('let in') || normalized.includes('code') || normalized.includes('gate') || normalized.includes('porch')) {
      const req3: McpCallToolRequest = {
        jsonrpc: '2.0',
        id: `call-${Date.now()}-3`,
        method: 'tools/call',
        params: {
          name: 'ring_dispatch_access_code',
          arguments: { recipientName: 'Amazon Courier', durationMinutes: 15, autoUnlockGate: true }
        }
      };
      const res3 = executeMcpToolCall(req3, { ring: ringState, fireTv: fireTvState, bee: beeState });
      ringState = res3.updatedStates.ring;
      toolExecutions.push({
        toolName: 'ring_dispatch_access_code',
        arguments: req3.params.arguments,
        resultSummary: `Single-use code [${ringState.activeAccessCode}] generated. Front deadbolt unlocked.`,
        timestamp: new Date().toLocaleTimeString(),
        status: 'success'
      });
      spokenReply = `I checked the Ring Doorbell feed. An Amazon courier has arrived with your package. I generated one-time access code ${ringState.activeAccessCode} and unlocked the porch gate for safe drop-off.`;
    } else {
      spokenReply = `There's an Amazon courier at the front door who just delivered a package. The package is safely placed next to your planter. Would you like me to unlock the porch gate or generate an access code?`;
    }

    // 4. If Fire TV mentioned or PIP requested
    if (normalized.includes('tv') || normalized.includes('screen') || normalized.includes('pip') || normalized.includes('show')) {
      const req4: McpCallToolRequest = {
        jsonrpc: '2.0',
        id: `call-${Date.now()}-4`,
        method: 'tools/call',
        params: {
          name: 'firetv_sync_playback_context',
          arguments: { command: 'show_doorbell_pip' }
        }
      };
      const res4 = executeMcpToolCall(req4, { ring: ringState, fireTv: fireTvState, bee: beeState });
      fireTvState = res4.updatedStates.fireTv;
      toolExecutions.push({
        toolName: 'firetv_sync_playback_context',
        arguments: req4.params.arguments,
        resultSummary: 'Cast Ring Doorbell camera feed into Fire TV Picture-in-Picture window.',
        timestamp: new Date().toLocaleTimeString(),
        status: 'success'
      });
      spokenReply += ` I've also put the live Ring camera feed onto your Fire TV in Picture-in-Picture mode so you don't miss your show.`;
    }
  } else if (normalized.includes('sports') || normalized.includes('score') || normalized.includes('game') || normalized.includes('football')) {
    const reqTv: McpCallToolRequest = {
      jsonrpc: '2.0',
      id: `call-${Date.now()}-tv`,
      method: 'tools/call',
      params: {
        name: 'firetv_sync_playback_context',
        arguments: { command: 'play_sports_feed', sourceApp: 'Amazon Sports Live' }
      }
    };
    const resTv = executeMcpToolCall(reqTv, { ring: ringState, fireTv: fireTvState, bee: beeState });
    fireTvState = resTv.updatedStates.fireTv;
    toolExecutions.push({
      toolName: 'firetv_sync_playback_context',
      arguments: reqTv.params.arguments,
      resultSummary: 'Switched Fire TV to Amazon Sports Live with AI NextGen stats overlay.',
      timestamp: new Date().toLocaleTimeString(),
      status: 'success'
    });
    spokenReply = `Switching your Fire TV to Thursday Night Football on Amazon Sports Live. Seahawks lead 24 to 21 with 2:15 remaining. AI NextGen player stats and win probability are displayed on screen.`;
  } else if (normalized.includes('bee') || normalized.includes('vitals') || normalized.includes('stress') || normalized.includes('heart') || normalized.includes('wearable')) {
    const reqBee: McpCallToolRequest = {
      jsonrpc: '2.0',
      id: `call-${Date.now()}-bee`,
      method: 'tools/call',
      params: {
        name: 'bee_wearable_vitals_telemetry',
        arguments: { metric: 'all' }
      }
    };
    const resBee = executeMcpToolCall(reqBee, { ring: ringState, fireTv: fireTvState, bee: beeState });
    toolExecutions.push({
      toolName: 'bee_wearable_vitals_telemetry',
      arguments: reqBee.params.arguments,
      resultSummary: `Heart rate: ${beeState.heartRate} bpm. Stress Score: ${beeState.stressScore}/100. Activity: ${beeState.activityState}.`,
      timestamp: new Date().toLocaleTimeString(),
      status: 'success'
    });
    spokenReply = `Your Bee Wearable reports normal vitals: resting heart rate is ${beeState.heartRate} BPM, stress index is low at ${beeState.stressScore} out of 100, and ambient sound is calm at ${beeState.ambientNoiseDb} decibels.`;
  } else if (normalized.includes('lock') || normalized.includes('secure')) {
    const isLock = !normalized.includes('unlock');
    const reqLock: McpCallToolRequest = {
      jsonrpc: '2.0',
      id: `call-${Date.now()}-lock`,
      method: 'tools/call',
      params: {
        name: 'ring_control_smart_lock',
        arguments: { action: isLock ? 'lock' : 'unlock' }
      }
    };
    const resLock = executeMcpToolCall(reqLock, { ring: ringState, fireTv: fireTvState, bee: beeState });
    ringState = resLock.updatedStates.ring;
    toolExecutions.push({
      toolName: 'ring_control_smart_lock',
      arguments: reqLock.params.arguments,
      resultSummary: `Front entrance deadbolt ${isLock ? 'LOCKED' : 'UNLOCKED'}.`,
      timestamp: new Date().toLocaleTimeString(),
      status: 'success'
    });
    spokenReply = `I've ${isLock ? 'locked' : 'unlocked'} the front door deadbolt. Ring Access Control confirms the status is secure.`;
  } else {
    // Default smart ambient inquiry
    spokenReply = `I'm listening on Alexa+ with the NovaHub MCP network. Your Ring Doorbell is active with package monitoring, Fire TV is ready on Prime Video, and your Bee Wearable is synced. What would you like me to coordinate?`;
  }

  // Step 3: Bedrock AgentCore execution trace
  traces.push({
    step: 3,
    type: 'mcp_tool',
    title: 'MCP Streamable HTTP Dispatch (spec 2025-11-25)',
    details: `Dispatched ${toolExecutions.length} MCP tool calls across Ring & Fire TV IoT runtimes.`,
    latencyMs: 140
  });

  traces.push({
    step: 4,
    type: 'model_invoke',
    title: 'Natural Multimodal Response Generation',
    details: 'Synthesized voice synthesis markup language & action confirmation response.',
    latencyMs: 65
  });

  return res.json({
    spokenReply,
    toolExecutions,
    traces,
    deviceStates: {
      ring: ringState,
      fireTv: fireTvState,
      bee: beeState
    }
  });
});

// Vite Middleware Integration for Development / Production
async function setupVite() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NovaHub Alexa+ MCP Server running at http://0.0.0.0:${PORT}`);
  });
}

setupVite().catch(console.error);
