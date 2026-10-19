import React, { useState } from 'react';
import { 
  Server, 
  Terminal, 
  Play, 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  Code, 
  RefreshCw, 
  Layers, 
  Cpu, 
  Radio 
} from 'lucide-react';
import { REGISTERED_TOOLS, MCP_SERVER_INFO } from '../lib/mcp.ts';
import type { McpTool } from '../types/index.ts';

interface McpInspectorProps {
  onDispatchTool: (toolName: string, args: Record<string, any>) => Promise<any>;
}

export const McpInspector: React.FC<McpInspectorProps> = ({ onDispatchTool }) => {
  const [selectedTool, setSelectedTool] = useState<McpTool>(REGISTERED_TOOLS[0]);
  const [customArgs, setCustomArgs] = useState<string>(
    JSON.stringify(
      { cameraLocation: 'front_door', enableNightVision: false, requireObjectDetection: true },
      null,
      2
    )
  );
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const handleToolSelect = (tool: McpTool) => {
    setSelectedTool(tool);
    // Build default arguments from schema
    const defaultArgs: Record<string, any> = {};
    if (tool.inputSchema.properties) {
      for (const [key, prop] of Object.entries(tool.inputSchema.properties)) {
        if (prop.default !== undefined) {
          defaultArgs[key] = prop.default;
        } else if (prop.type === 'string') {
          defaultArgs[key] = prop.enum ? prop.enum[0] : 'sample_value';
        } else if (prop.type === 'boolean') {
          defaultArgs[key] = true;
        } else if (prop.type === 'number') {
          defaultArgs[key] = 10;
        }
      }
    }
    setCustomArgs(JSON.stringify(defaultArgs, null, 2));
    setExecutionResult(null);
  };

  const handleExecute = async () => {
    try {
      setIsExecuting(true);
      const parsedArgs = JSON.parse(customArgs);
      const startTime = performance.now();
      const res = await onDispatchTool(selectedTool.name, parsedArgs);
      const endTime = performance.now();
      setExecutionResult({
        ...res,
        _clientLatencyMs: Math.round(endTime - startTime)
      });
    } catch (err: any) {
      setExecutionResult({
        error: err.message || 'JSON parse error in arguments'
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const curlCommand = `curl -X POST http://localhost:3000/api/mcp/messages \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc": "2.0",
    "id": "cli-test-1",
    "method": "tools/call",
    "params": {
      "name": "${selectedTool.name}",
      "arguments": ${customArgs.replace(/\n\s*/g, ' ')}
    }
  }'`;

  const claudeDesktopConfig = JSON.stringify({
    mcpServers: {
      novahub: {
        command: "npx",
        args: ["-y", "mcp-proxy", "http://localhost:3000/api/mcp/sse"]
      }
    }
  }, null, 2);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100">Self-Hosted MCP Server (Spec 2025-11-25)</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800">
                Streamable HTTP SSE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Open standard powering Alexa+ agent integrations, Ring IoT access, and Fire TV companion state
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            SSE: /api/mcp/sse
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
            RPC: /api/mcp/messages
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Registered Tools List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                Registered MCP Tools ({REGISTERED_TOOLS.length})
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">v{MCP_SERVER_INFO.protocolVersion}</span>
            </div>

            <div className="space-y-2">
              {REGISTERED_TOOLS.map((tool) => (
                <button
                  key={tool.name}
                  onClick={() => handleToolSelect(tool)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    selectedTool.name === tool.name
                      ? 'bg-cyan-950/80 border-cyan-700 text-white shadow-md'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="font-mono text-xs font-semibold text-cyan-300 flex items-center justify-between">
                    <span>{tool.name}</span>
                    {selectedTool.name === tool.name && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                    {tool.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Tool Tester & JSON-RPC Runner (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 font-mono">
                  tools/call • {selectedTool.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedTool.description}
                </p>
              </div>

              <button
                onClick={handleExecute}
                disabled={isExecuting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs shadow-md shadow-cyan-600/20 disabled:opacity-50 transition-all"
              >
                {isExecuting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Execute Tool Call
              </button>
            </div>

            {/* Arguments Editor */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Tool Arguments (JSON Payload):</span>
                <span className="text-[10px] text-slate-500 font-mono">schema: {selectedTool.inputSchema.type}</span>
              </label>
              <textarea
                rows={5}
                value={customArgs}
                onChange={(e) => setCustomArgs(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            {/* Execution Result Box */}
            {executionResult && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    MCP JSON-RPC 2.0 Response
                  </span>
                  {executionResult._clientLatencyMs && (
                    <span className="text-[11px] font-mono text-slate-400">
                      Response Time: {executionResult._clientLatencyMs} ms
                    </span>
                  )}
                </div>
                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto max-h-60 scrollbar-thin">
                  {JSON.stringify(executionResult, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Quick Integration Snippets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* cURL Snippet */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  Test via Terminal cURL
                </span>
                <button
                  onClick={() => copyToClipboard(curlCommand, 'curl')}
                  className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px]"
                >
                  {copiedSnippet === 'curl' ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedSnippet === 'curl' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="p-2.5 rounded-lg bg-slate-900 text-[10px] font-mono text-slate-300 overflow-x-auto">
                {curlCommand}
              </pre>
            </div>

            {/* Claude Desktop Config Snippet */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-purple-400" />
                  Claude Desktop MCP Config
                </span>
                <button
                  onClick={() => copyToClipboard(claudeDesktopConfig, 'claude')}
                  className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px]"
                >
                  {copiedSnippet === 'claude' ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedSnippet === 'claude' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="p-2.5 rounded-lg bg-slate-900 text-[10px] font-mono text-slate-300 overflow-x-auto">
                {claudeDesktopConfig}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
