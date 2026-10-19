# NovaHub: Alexa+ MCP & Ambient Smart Living Simulator

> An Alexa+ style concierge demo that coordinates a simulated Ring doorbell and smart lock, a Fire TV, a Bee wearable and ambient scenes through a JSON-RPC 2.0 MCP-style tool server, with a React dashboard that visualizes every tool call.

Built for the Amazon Developer Hackathon (Alexa+ track).

## Features

- **7 MCP tools** (`tools/list`, `tools/call`, `ping`) served over HTTP JSON-RPC 2.0, with an SSE stream that broadcasts `notifications/resources/updated` after each tool call.
- **Simulated device ecosystem** held in server memory: Ring doorbell + lock, Fire TV playback, Bee wearable vitals.
- **Rule-based "Alexa+ reasoning" endpoint** (`POST /api/alexa/reason`) that maps an utterance (door/courier, sports, vitals, lock) to a chain of tool calls and returns a spoken reply plus an AWS-Bedrock-style execution trace.
- **React 19 + Vite + Tailwind UI**: Alexa assistant, Ring, Fire TV and Bee simulators, MCP inspector, Bedrock trace visualizer, auto demo director.

## Architecture

```
Browser (React UI, src/)
   -> Express server (server.ts, port 3000)
        /api/alexa/reason      keyword router -> executeMcpToolCall()
        /api/mcp/messages      JSON-RPC 2.0: tools/list, tools/call, ping
        /api/mcp/sse           SSE notifications
        /api/devices/state     in-memory device state
   -> src/lib/mcp.ts           tool definitions + simulated execution
```

In development, Vite runs as Express middleware; in production (`NODE_ENV=production`) Express serves `dist/`.

## Quick start

Prerequisites: Node.js 22+ and npm.

```bash
git clone https://github.com/SERGIOCORVALIS/Amazon-Free2.git
cd Amazon-Free2
npm install --legacy-peer-deps   # plain `npm install` currently fails with an ERESOLVE peer conflict (vite 8 / esbuild)
npm run dev                      # tsx server.ts -> http://localhost:3000
```

Production build:

```bash
npm run build                    # vite build -> dist/
NODE_ENV=production npm start    # tsx server.ts serving dist/
```

Type check: `npm run lint` (runs `tsc --noEmit`).

Unit tests use the Node built-in test runner:

```bash
node --test src/lib/mcp.test.ts src/lib/soundEffects.test.ts   # requires a Node version with TypeScript type stripping (22.6+ with --experimental-strip-types, or 23.6+)
```

### Try it

```bash
curl -s localhost:3000/api/mcp/messages -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

curl -s localhost:3000/api/alexa/reason -H 'content-type: application/json' \
  -d '{"prompt":"Who is at the door? Unlock the porch and show it on the TV"}'
```

## MCP tools

| Tool | What it does (simulated) |
| --- | --- |
| `ring_stream_doorbell_vision` | Inspects the Ring doorbell feed: person/package detection and camera metadata (`cameraLocation`, `nightVision`, `requireObjectDetection`). |
| `ring_dispatch_access_code` | Generates a temporary 6-digit access code for a courier or guest, optionally auto-unlocking the deadbolt. |
| `ring_control_smart_lock` | Locks or unlocks the entrance deadbolt. |
| `firetv_sync_playback_context` | Controls Fire TV playback or routes the doorbell feed / sports stats to the TV (picture-in-picture). |
| `bee_wearable_vitals_telemetry` | Returns simulated wearable signals: heart rate, stress, activity, notes. |
| `bedrock_analyze_multimodal_scene` | Returns a simulated Bedrock-style scene analysis of the camera feed (no AWS call is made). |
| `ambient_scene_controller` | Sets a lighting / soundscape scene preset and brightness. |

## HTTP endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Status and connected SSE client count |
| GET | `/api/mcp/info` | Server info and capabilities |
| GET | `/api/mcp/tools` | Tool list |
| GET | `/api/mcp/sse` | SSE stream (endpoint event + notifications) |
| POST | `/api/mcp/messages` | JSON-RPC 2.0 (`tools/list`, `tools/call`, `ping`) |
| GET | `/api/devices/state` | Current simulated device state |
| POST | `/api/devices/reset` | Reset device state |
| POST | `/api/alexa/reason` | Utterance -> tool chain -> spoken reply + trace |

## Environment variables

| Variable | Default | Notes |
| --- | --- | --- |
| `PORT` | `3000` | HTTP port |
| `NODE_ENV` | (unset) | `production` serves the built `dist/` |
| `DISABLE_HMR` | (unset) | `true` disables Vite HMR / file watching |
| `GEMINI_API_KEY`, `APP_URL` | placeholders in `.env.example` | Declared by the AI Studio template; not used by the current server code |

## Connecting to Alexa+ (notes and limitations)

Alexa+ add-ons talk to an MCP server over **Streamable HTTP** (spec 2025-11-25): a single endpoint handling `initialize`, `Mcp-Session-Id`, POST/GET. This project currently exposes a custom JSON-RPC endpoint plus a separate SSE channel (closer to the legacy HTTP+SSE pattern) and does **not** implement `initialize`. To connect a real Alexa+ add-on you would need to wrap `REGISTERED_TOOLS` / `executeMcpToolCall` with the official `@modelcontextprotocol/sdk` `StreamableHTTPServerTransport`, expose it over HTTPS (for example with a tunnel) and follow the Alexa+ MCP toolkit quickstart.

All device behaviour and the Bedrock analysis are simulated; no Amazon or AWS APIs are called.

## License

No license file is included yet. Add one (for example MIT) before publishing the repository as open source.
