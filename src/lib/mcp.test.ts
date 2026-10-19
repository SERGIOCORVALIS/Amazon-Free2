/**
 * Unit tests for MCP protocol logic and device coordination
 * Tested using Node 22 native test runner (node:test & node:assert/strict)
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MCP_SERVER_INFO,
  REGISTERED_TOOLS,
  INITIAL_RING_STATE,
  INITIAL_FIRETV_STATE,
  INITIAL_BEE_STATE,
  executeMcpToolCall
} from './mcp.ts';

test('MCP Server Info complies with 2025-11-25 spec', () => {
  assert.equal(MCP_SERVER_INFO.protocolVersion, '2025-11-25');
  assert.equal(typeof MCP_SERVER_INFO.capabilities.tools, 'object');
  assert.equal(REGISTERED_TOOLS.length >= 6, true);
});

test('ring_stream_doorbell_vision returns detected objects and feed info', () => {
  const req = {
    jsonrpc: '2.0' as const,
    id: 'test-1',
    method: 'tools/call' as const,
    params: {
      name: 'ring_stream_doorbell_vision',
      arguments: {
        cameraLocation: 'front_door',
        enableNightVision: true
      }
    }
  };

  const { response, updatedStates } = executeMcpToolCall(req, {
    ring: INITIAL_RING_STATE,
    fireTv: INITIAL_FIRETV_STATE,
    bee: INITIAL_BEE_STATE
  });

  assert.equal(response.id, 'test-1');
  assert.equal(response.result?.content[0].type, 'text');
  assert.match(response.result?.content[0].text || '', /Ring Doorbell Pro 2/);
  assert.equal(updatedStates.ring.nightVision, true);
});

test('ring_dispatch_access_code generates 6-digit OTP and logs event', () => {
  const req = {
    jsonrpc: '2.0' as const,
    id: 'test-2',
    method: 'tools/call' as const,
    params: {
      name: 'ring_dispatch_access_code',
      arguments: {
        recipientName: 'UPS Driver',
        durationMinutes: 10,
        autoUnlockGate: true
      }
    }
  };

  const { response, updatedStates } = executeMcpToolCall(req, {
    ring: INITIAL_RING_STATE,
    fireTv: INITIAL_FIRETV_STATE,
    bee: INITIAL_BEE_STATE
  });

  assert.equal(response.id, 'test-2');
  assert.equal(typeof updatedStates.ring.activeAccessCode, 'string');
  assert.equal(updatedStates.ring.activeAccessCode?.length, 6);
  assert.equal(updatedStates.ring.smartLockLocked, false);
  assert.equal(updatedStates.ring.recentEvents[0].type, 'code_issued');
});

test('firetv_sync_playback_context toggles PIP mode on 10-foot screen', () => {
  const req = {
    jsonrpc: '2.0' as const,
    id: 'test-3',
    method: 'tools/call' as const,
    params: {
      name: 'firetv_sync_playback_context',
      arguments: {
        command: 'show_doorbell_pip'
      }
    }
  };

  const { response, updatedStates } = executeMcpToolCall(req, {
    ring: INITIAL_RING_STATE,
    fireTv: INITIAL_FIRETV_STATE,
    bee: INITIAL_BEE_STATE
  });

  assert.equal(updatedStates.fireTv.pipMode, true);
  assert.equal(updatedStates.fireTv.pipSource, 'ring_doorbell');
  assert.match(response.result?.content[0].text || '', /Fire TV action/);
});

test('ambient_scene_controller sets lighting and soundscape', () => {
  const req = {
    jsonrpc: '2.0' as const,
    id: 'test-ambient',
    method: 'tools/call' as const,
    params: {
      name: 'ambient_scene_controller',
      arguments: {
        scene: 'relax_and_calm',
        brightnessPercent: 35
      }
    }
  };

  const { response } = executeMcpToolCall(req, {
    ring: INITIAL_RING_STATE,
    fireTv: INITIAL_FIRETV_STATE,
    bee: INITIAL_BEE_STATE
  });

  assert.equal(response.id, 'test-ambient');
  assert.match(response.result?.content[0].text || '', /Ambient Scene "relax_and_calm"/);
  assert.equal(response.result?.metadata?.brightness, 35);
});

test('unknown tool returns JSON-RPC -32601 error', () => {
  const req = {
    jsonrpc: '2.0' as const,
    id: 'test-4',
    method: 'tools/call' as const,
    params: {
      name: 'non_existent_tool',
      arguments: {}
    }
  };

  const { response } = executeMcpToolCall(req, {
    ring: INITIAL_RING_STATE,
    fireTv: INITIAL_FIRETV_STATE,
    bee: INITIAL_BEE_STATE
  });

  assert.equal(response.error?.code, -32601);
});
