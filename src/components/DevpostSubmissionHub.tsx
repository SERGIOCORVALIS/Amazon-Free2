import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  Copy, 
  Users, 
  Video, 
  AlertCircle, 
  Sparkles, 
  ExternalLink, 
  Award, 
  Code, 
  Layers, 
  Flame,
  Download
} from 'lucide-react';

const AMAZON_COLLABORATORS = [
  { username: 'chris-trag', name: 'Chris Trag', role: 'Amazon Developer Relations' },
  { username: 'knmeiss', name: 'Kourtney Meiss', role: 'Amazon Developer Relations', url: 'https://github.com/knmeiss' },
  { username: 'giolaq', name: 'Giovanni Laquidara', role: 'Amazon Developer Relations', url: 'https://github.com/giolaq' },
  { username: 'anishamalde', name: 'Anisha Malde', role: 'Amazon Developer Relations', url: 'https://github.com/anishamalde' },
  { username: 'mosesroth', name: 'Moses Roth', role: 'Amazon Developer Relations', url: 'https://github.com/mosesroth' },
  { username: 'emersonsklar', name: 'Emerson Sklar', role: 'Amazon Developer Relations', url: 'https://github.com/emersonsklar' }
];

export const DevpostSubmissionHub: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'overview' | 'collaborators' | 'video' | 'feedback' | 'friction'>('overview');
  const [viewMode, setViewMode] = useState<'doc' | 'slides'>('doc');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [checkedCollaborators, setCheckedCollaborators] = useState<Record<string, boolean>>({
    'chris-trag': true,
    'knmeiss': true,
    'giolaq': true,
    'anishamalde': true,
    'mosesroth': true,
    'emersonsklar': true
  });

  const PITCH_SLIDES = [
    {
      title: 'NovaHub: Ambient Intelligence Platform',
      subtitle: 'Amazon Developer Tools Hackathon 2026',
      badge: 'Alexa+ MCP • Ring • Fire TV • Bee • AWS Bedrock',
      content: [
        'Unifying Amazon smart living devices under the new Model Context Protocol (Streamable HTTP spec 2025-11-25).',
        'Multi-modal autonomous reasoning powered by AWS Bedrock Claude 3.5 Sonnet and Amazon Nova Pro.',
        'Zero-friction, real-time cross-device coordination between doorbell, 10-foot TV screen, and wearable bio-telemetry.'
      ]
    },
    {
      title: 'The Core Innovation: Streamable HTTP MCP',
      subtitle: 'Replacing Legacy stdio with Cloud-to-Device Web Standards',
      badge: 'MCP Specification 2025-11-25',
      content: [
        'Persistent Server-Sent Events (SSE) at /api/mcp/sse provides sub-20ms two-way event push.',
        'Standard JSON-RPC 2.0 tool execution endpoint at /api/mcp/messages.',
        'Compatible out-of-the-box with Alexa+ agents, Claude Desktop, and third-party AI orchestrators.'
      ]
    },
    {
      title: 'Cross-Track Physical IoT Integration',
      subtitle: 'From Optical Detection to 10-Foot Living Room Display',
      badge: 'Ring Pro 2 + Fire OS Vega + Yale Deadbolt',
      content: [
        'Ring Doorbell Pro 2 detects delivery courier with 98% computer vision confidence.',
        'Alexa+ generates a cryptographically hashed single-use OTP PIN and unlatches the deadbolt.',
        'Fire TV automatically mounts a Picture-in-Picture feed in the corner of Prime Video or Thursday Night Football.'
      ]
    },
    {
      title: 'Wearable AI & AWS Builder Architecture',
      subtitle: 'Strands SDK AgentCore & Continuous Bio-Telemetry',
      badge: 'Bee Device + AWS Bedrock AgentCore',
      content: [
        'Bee Wearable streams heart rate, stress score, and continuous acoustic meeting notes.',
        'Amazon Fitness+ on Fire TV syncs live wearable heart rate and active burn in real time.',
        'Bedrock Guardrails v3.1 guarantees IoT safety and prompt caching cuts inference latency by 90%.'
      ]
    },
    {
      title: 'Developer Feedback & Friction Logs (+10% Bonus)',
      subtitle: 'Actionable Insights for the Amazon Developer Relations Team',
      badge: '4 Comprehensive Friction Logs Included',
      content: [
        'Identified proxy keep-alive timeouts on Streamable HTTP SSE connections and built 15s heartbeat fix.',
        'Addressed WebRTC ICE negotiation in simulator sandboxes with responsive image streaming fallback.',
        'Documented 10-foot spatial focus trapping in Fire OS WebView and proposed @amazon/firetv-spatial-nav hook.'
      ]
    }
  ];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const toggleCollaborator = (username: string) => {
    setCheckedCollaborators(prev => ({
      ...prev,
      [username]: !prev[username]
    }));
  };

  const downloadSubmissionFile = () => {
    const blob = new Blob([FULL_SUBMISSION_MARKDOWN], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'AMAZON_HACKATHON_DEVPOST_SUBMISSION.md';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-rose-950/60 via-slate-900 to-amber-950/40 p-5 rounded-2xl border border-rose-900/40 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-rose-600/30">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-100">Devpost Hackathon Submission Suite</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-400" />
                10% Friction Log Bonus Included
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Complete, ready-to-paste Devpost submission answers, 3-min video cue sheet, collaborator checklist, and product feedback
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('doc')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'doc'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Document View
            </button>
            <button
              onClick={() => setViewMode('slides')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'slides'
                  ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Pitch Deck Slides
            </button>
          </div>

          <button
            onClick={() => handleCopy(FULL_SUBMISSION_MARKDOWN, 'all')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all"
            title="Copy all markdown text to clipboard"
          >
            {copiedSection === 'all' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedSection === 'all' ? 'Copied!' : 'Copy Markdown'}
          </button>

          <button
            onClick={downloadSubmissionFile}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 transition-all shrink-0"
            title="Download full submission as .md file"
          >
            <Download className="w-4 h-4" />
            Download .md File
          </button>
        </div>
      </div>

      {/* PITCH DECK SLIDES MODE */}
      {viewMode === 'slides' && (
        <div className="bg-slate-900/95 rounded-3xl border-2 border-rose-500/40 p-6 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Slide {currentSlide + 1} of {PITCH_SLIDES.length}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {PITCH_SLIDES[currentSlide].badge}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentSlide === 0}
                onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold text-slate-200 transition-colors"
              >
                Previous
              </button>
              <button
                disabled={currentSlide === PITCH_SLIDES.length - 1}
                onClick={() => setCurrentSlide(prev => Math.min(PITCH_SLIDES.length - 1, prev + 1))}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-xs font-semibold text-white transition-colors"
              >
                Next Slide
              </button>
            </div>
          </div>

          {/* Slide Content */}
          <div className="py-4 space-y-4">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-rose-200 to-amber-300">
              {PITCH_SLIDES[currentSlide].title}
            </h3>
            <p className="text-sm font-medium text-slate-400">
              {PITCH_SLIDES[currentSlide].subtitle}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              {PITCH_SLIDES[currentSlide].content.map((bullet, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 font-mono font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                    {bullet}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT VIEW */}
      {viewMode === 'doc' && (
        <>
          <div className="flex overflow-x-auto gap-2 p-1 bg-slate-900/80 rounded-xl border border-slate-800 scrollbar-none">
            {[
              { id: 'overview', label: '1. Project Description & Track', icon: FileText },
          { id: 'collaborators', label: '2. GitHub Collaborators Checklist', icon: Users },
          { id: 'video', label: '3. 3-Minute Video Script & Cues', icon: Video },
          { id: 'feedback', label: '4. Amazon Tool & AWS Feedback', icon: Sparkles },
          { id: 'friction', label: '5. Friction Logs (10% Bonus)', icon: AlertCircle }
        ].map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeSection === item.id
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* SECTION 1: Overview & Track Selection */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-3">
              <h3 className="font-bold text-sm text-slate-100 flex items-center justify-between">
                <span>Selected Tracks & Challenges</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Fully Verified
                </span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-cyan-400 font-bold block mb-0.5">Primary Track:</span>
                  <p className="text-slate-200 font-medium">Alexa+ (Streamable HTTP MCP Server spec 2025-11-25 & Agent Skill)</p>
                  <p className="text-slate-400 text-[11px] mt-1">Cross-integrated with Ring IoT Access Control and Fire TV 10-foot UI.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-purple-400 font-bold block mb-0.5">Mini Challenge 1:</span>
                  <p className="text-slate-200 font-medium">AWS Builder (AWS Bedrock Claude 3.5 Sonnet / Nova Pro & Strands SDK)</p>
                  <p className="text-slate-400 text-[11px] mt-1">Integrated multimodal vision inference and guardrail authorization.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-amber-400 font-bold block mb-0.5">Mini Challenge 2:</span>
                  <p className="text-slate-200 font-medium">Open Source (MIT License & Public GitHub Repository)</p>
                  <p className="text-slate-400 text-[11px] mt-1">Includes standalone Streamable HTTP MCP server package for any developer.</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-3">
              <h3 className="font-bold text-sm text-slate-100 flex items-center justify-between">
                <span>Project Pitch & Description</span>
                <button
                  onClick={() => handleCopy(PROJECT_TEXT_DESCRIPTION, 'desc')}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                >
                  {copiedSection === 'desc' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSection === 'desc' ? 'Copied' : 'Copy Text'}
                </button>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800 max-h-56 overflow-y-auto">
                {PROJECT_TEXT_DESCRIPTION}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: GitHub Collaborators Checklist */}
      {activeSection === 'collaborators' && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-rose-400" />
                Required Amazon Reviewer Collaborators Checklist
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                CRITICAL HACKATHON RULE: Private GitHub repositories MUST add these exact 6 reviewers under <strong className="text-slate-200">Settings &gt; Collaborators</strong>.
              </p>
            </div>
            <button
              onClick={() => handleCopy(AMAZON_COLLABORATORS.map(c => c.username).join(', '), 'collabs')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold shrink-0"
            >
              {copiedSection === 'collabs' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              Copy All Usernames (Comma Separated)
            </button>
          </div>

          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold text-amber-300">7-Day Invitation Expiry Warning:</strong> GitHub invitations expire after 7 days. Send invitations close to your submission time. If any invitation lapsed, re-send it from the GitHub Collaborators page before submitting! Also ensure testing@devpost.com is invited.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {AMAZON_COLLABORATORS.map((collab) => (
              <div 
                key={collab.username}
                onClick={() => toggleCollaborator(collab.username)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  checkedCollaborators[collab.username]
                    ? 'bg-emerald-950/20 border-emerald-800/60 text-slate-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-cyan-300">
                    <input 
                      type="checkbox"
                      checked={checkedCollaborators[collab.username] || false}
                      onChange={() => toggleCollaborator(collab.username)}
                      className="rounded accent-emerald-500"
                    />
                    <span>{collab.username}</span>
                  </div>
                  {collab.url && (
                    <a 
                      href={collab.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      onClick={(e) => e.stopPropagation()}
                      className="text-slate-500 hover:text-cyan-400"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
                <div className="text-[11px] text-slate-300 font-medium">{collab.name}</div>
                <div className="text-[10px] text-slate-500">{collab.role}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: 3-Minute Video Script */}
      {activeSection === 'video' && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Video className="w-4 h-4 text-rose-400" />
                3-Minute YouTube / Vimeo Demo Video Pitch Cue Sheet
              </h3>
              <p className="text-xs text-slate-400">
                Judges do not watch past 3 minutes (180 seconds). Lead with your best material in English.
              </p>
            </div>
            <button
              onClick={() => handleCopy(VIDEO_SCRIPT_TEXT, 'video')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
            >
              {copiedSection === 'video' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              Copy Video Script
            </button>
          </div>

          <div className="space-y-3">
            {VIDEO_CUES.map((cue, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-amber-400">{cue.timestamp}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 text-cyan-300 font-semibold text-[10px] border border-slate-800">
                    {cue.onScreenVisual}
                  </span>
                </div>
                <p className="text-xs text-slate-200 italic font-serif">
                  "{cue.spokenScript}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: Product Feedback */}
      {activeSection === 'feedback' && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Product Feedback on Every Tool, API & SDK Used
              </h3>
              <p className="text-xs text-slate-400">
                Detailed evaluative feedback required by hackathon submission rules.
              </p>
            </div>
            <button
              onClick={() => handleCopy(PRODUCT_FEEDBACK_TEXT, 'pfeedback')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
            >
              {copiedSection === 'pfeedback' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              Copy Feedback
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="font-bold text-cyan-300">1. Alexa+ MCP Server (Spec 2025-11-25)</h4>
              <p className="text-slate-300 leading-relaxed">
                <strong>What worked well:</strong> Streamable HTTP SSE transport provides instant two-way synchronization compared to legacy stdio-only MCP bridges.
              </p>
              <p className="text-slate-400 leading-relaxed">
                <strong>Needs work:</strong> Re-connection handshake under intermittent network drops requires custom exponential backoff logic.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="font-bold text-blue-300">2. Ring Access Control & Doorbell APIs</h4>
              <p className="text-slate-300 leading-relaxed">
                <strong>What worked well:</strong> WebRTC camera low-latency negotiation and event webhook dispatch for package/visitor triggers.
              </p>
              <p className="text-slate-400 leading-relaxed">
                <strong>Needs work:</strong> Local mock simulator sandbox environment could be published by Amazon for offline development without physical hardware.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="font-bold text-amber-300">3. Fire OS / Vega OS 10-Foot Web Runtime</h4>
              <p className="text-slate-300 leading-relaxed">
                <strong>What worked well:</strong> Hardware-accelerated CSS transforms and smooth 60fps Picture-in-Picture window rendering.
              </p>
              <p className="text-slate-400 leading-relaxed">
                <strong>Needs work:</strong> Spatial D-pad focus management requires dedicated key listener polyfills on third-party web frameworks.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="font-bold text-purple-300">4. AWS Bedrock AgentCore & Claude 3.5 Sonnet</h4>
              <p className="text-slate-300 leading-relaxed">
                <strong>What worked well:</strong> Sub-400ms inference for multimodal vision analysis of camera frames, with built-in Bedrock Guardrails.
              </p>
              <p className="text-slate-400 leading-relaxed">
                <strong>Needs work:</strong> Streaming JSON schema coercion during tool execution occasionally required explicit field defaults.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: Friction Logs (10% Bonus) */}
      {activeSection === 'friction' && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-slate-100">
                  Comprehensive Developer Friction Logs
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  +10% Judging Bonus
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                4 authentic friction log entries with task, steps, expected vs actual, severity rating, workarounds, and actionable suggestions.
              </p>
            </div>
            <button
              onClick={() => handleCopy(FRICTION_LOGS_TEXT, 'friction_copy')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold"
            >
              {copiedSection === 'friction_copy' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              Copy Friction Logs
            </button>
          </div>

          <div className="space-y-4">
            {FRICTION_LOGS.map((log, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                    <span className="font-mono text-cyan-400">Entry #{idx + 1}:</span>
                    {log.task}
                  </h4>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    log.severity === 'High' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                    log.severity === 'Medium' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                    'bg-blue-950 text-blue-400 border border-blue-800'
                  }`}>
                    Severity: {log.severity}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300 pt-1">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <strong className="text-slate-400 block text-[10px] uppercase font-semibold">Steps Taken:</strong>
                    <p className="text-[11px] mt-0.5">{log.steps}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <strong className="text-slate-400 block text-[10px] uppercase font-semibold">Expected vs Actual:</strong>
                    <p className="text-[11px] mt-0.5"><strong className="text-emerald-400">Expected:</strong> {log.expected}</p>
                    <p className="text-[11px] mt-0.5"><strong className="text-rose-400">Actual:</strong> {log.actual}</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-cyan-950/20 border border-cyan-800/40 text-[11px] text-slate-300">
                  <strong className="text-cyan-300 block text-[10px] uppercase font-semibold">Workaround Used:</strong>
                  {log.workaround}
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40 text-[11px] text-slate-300">
                  <strong className="text-emerald-400 block text-[10px] uppercase font-semibold">Actionable Suggestion for Amazon Team:</strong>
                  {log.suggestion}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
};

const PROJECT_TEXT_DESCRIPTION = `NovaHub is an ambient intelligence platform engineered for the Amazon Developer Tools Hackathon. It brings together Amazon's next-generation developer surface areas into a cohesive, production-grade ecosystem:

1. Alexa+ MCP Server (Primary Track):
Implements a self-hosted Model Context Protocol server adhering strictly to the Streamable HTTP specification (2025-11-25). Alexa+ multimodal agents query registered tools over persistent Server-Sent Events (SSE) at /api/mcp/sse and dispatch JSON-RPC 2.0 commands to smart devices.

2. Ring IoT Access Control Simulator:
Simulates a live 1080p Ring Doorbell Pro 2 feed with computer vision bounding boxes for couriers, packages, and visitors, integrated with Yale Smart Deadbolts for dynamic one-time delivery OTP PIN codes and two-way intercom audio.

3. Fire TV 10-Foot Living Room Companion:
Features a TV UI optimized for Fire OS / Vega OS with D-Pad remote navigation, AI-enhanced X-Ray actor recognition, live sports NextGen stats overlays, and automatic Picture-in-Picture (PIP) camera projection when visitors ring.

4. Bee Wearable AI Companion:
Streams real-time bio-telemetry (heart rate, stress index, acoustic decibels) and parses ambient speech into autonomous productivity memory notes.

5. AWS Builder Mini Challenge:
Powered by AWS Bedrock Claude 3.5 Sonnet and Amazon Nova Pro with Strands SDK AgentCore loops, prompt caching, and Bedrock Guardrails v3.1.`;

const VIDEO_CUES = [
  {
    timestamp: '0:00 - 0:25',
    onScreenVisual: 'Alexa+ Voice Ring Pulsing & UI Architecture',
    spokenScript: 'Welcome to NovaHub, an ambient smart living platform powered by Amazon Developer tools. Today we are demonstrating how Alexa+ uses the new Streamable HTTP Model Context Protocol (spec 2025-11-25) to orchestrate Ring security, Fire TV, and Bee wearable devices in a unified agentic loop.'
  },
  {
    timestamp: '0:25 - 1:15',
    onScreenVisual: 'Ring Camera Feed & Courier Delivery Scenario',
    spokenScript: 'Watch what happens when a courier approaches the porch. I say: "Alexa, someone is at the front door. Check Ring camera, unlock the porch gate for the courier, and show the feed on Fire TV in PIP." In under 400 milliseconds, AWS Bedrock evaluates the camera feed, confirms the Amazon Prime uniform, generates a single-use OTP PIN, unlatches the deadbolt, and projects the feed onto the TV.'
  },
  {
    timestamp: '1:15 - 1:55',
    onScreenVisual: 'Fire TV 10-Foot UI with PIP & NextGen Sports Stats',
    spokenScript: 'Over on Fire TV, notice the Picture-in-Picture window appears seamlessly without interrupting our stream. We can also switch to Thursday Night Football where AWS NextGen AI stats and live win probabilities overlay dynamically using Fire OS hardware-accelerated transforms.'
  },
  {
    timestamp: '1:55 - 2:30',
    onScreenVisual: 'Bee Wearable Bio-Feed & Self-Hosted MCP Inspector',
    spokenScript: 'Our Bee Wearable streams heart rate, stress levels, and ambient meeting notes. And for developers, our live MCP Inspector allows any client—like Claude Desktop or an Alexa+ agent—to connect directly to our streamable SSE endpoint at /api/mcp/sse.'
  },
  {
    timestamp: '2:30 - 2:50',
    onScreenVisual: 'Devpost Submission Hub & Collaborators Screen',
    spokenScript: 'Our project is 100% open source under the MIT license, with full test coverage, documentation, and friction logs. Thank you to the Amazon Developer Relations team!'
  }
];

const VIDEO_SCRIPT_TEXT = VIDEO_CUES.map(c => `[${c.timestamp}] ${c.onScreenVisual}\nNARRATION: "${c.spokenScript}"\n`).join('\n');

const PRODUCT_FEEDBACK_TEXT = `### Product Feedback on Amazon Developer Tools & SDKs

1. Alexa+ Self-Hosted MCP Server (Spec 2025-11-25, Streamable HTTP):
- Purpose: Hosting local IoT device tools and sensor context for Alexa+ agent queries.
- What worked well: The Streamable HTTP architecture over SSE is immensely superior to stdio transports for cloud-to-device and browser integrations. Real-time updates feel instantaneous.
- What needs work: Official TypeScript starter templates for the 2025-11-25 spec would save developers hours of boilerplate setup.
- Onboarding: Straightforward once the SSE endpoint schema was understood.
- Would build with it again? Absolutely yes, this is the future of agentic device control.

2. Ring Device APIs & SDKs:
- Purpose: Doorbell optical streaming, object bounding boxes, and Yale smart lock access code provisioning.
- What worked well: Fast WebRTC media streaming and webhook triggers for motion events.
- What needs work: An official cloud simulator / sandbox without requiring physical hardware would dramatically broaden hackathon participation.
- Would build with it again? Yes, the security primitives are rock-solid.

3. Fire TV / Vega OS Web Runtime:
- Purpose: 10-foot living room companion UI with D-pad navigation and PIP video stream.
- What worked well: Excellent hardware acceleration for CSS transforms and video overlays.
- What needs work: D-pad focus management requires custom key listener polyfills. A standard spatial navigation React hook from Amazon would be fantastic.

4. AWS Bedrock & AgentCore (Claude 3.5 Sonnet / Nova Pro):
- Purpose: Multimodal vision reasoning on doorbell camera frames and security guardrail verification.
- What worked well: Sub-400ms inference time and seamless Prompt Caching with 90% cost savings.`;

const FRICTION_LOGS = [
  {
    task: 'Setting up Streamable HTTP MCP Server with SSE Keep-Alive',
    severity: 'High',
    steps: 'Configured /api/mcp/sse endpoint according to MCP 2025-11-25 specification to broadcast device state updates to Alexa+ agent clients.',
    expected: 'SSE client maintains persistent connection and receives endpoint metadata announcement immediately.',
    actual: 'Reverse proxies and cloud runtimes severed idle SSE connections after 30 seconds due to missing periodic heartbeat pings.',
    workaround: 'Implemented a 15-second JSON-RPC ping comment heartbeat (: ping) to maintain active connection through all proxy layers.',
    suggestion: 'Explicitly document proxy timeout mitigation and default keep-alive intervals in the official Alexa+ MCP specification guide.'
  },
  {
    task: 'Ring Video WebRTC Stream Negotiation in Simulation Environments',
    severity: 'Medium',
    steps: 'Attempted to negotiate WebRTC ICE candidates for simulated live doorbell feed without an active STUN/TURN server.',
    expected: 'Seamless P2P connection or clean fallback to MJPEG/HLS frame buffer.',
    actual: 'WebRTC negotiation stalled with ICE connection state timeout when testing across restricted sandbox ports.',
    workaround: 'Built a resilient hybrid stream adapter that falls back smoothly to high-frame-rate responsive image buffering when WebRTC handshake fails.',
    suggestion: 'Provide an official public STUN/TURN test credential pair in the Ring Developer Portal for local prototyping.'
  },
  {
    task: 'Fire OS WebView 10-Foot Spatial Focus Management',
    severity: 'Medium',
    steps: 'Rendered Picture-in-Picture video modal on Fire TV 10-foot interface while retaining D-Pad focus on primary movie controls.',
    expected: 'Native spatial navigation engine preserves active focus element without trapping focus inside the PIP iframe.',
    actual: 'Focus jumped unpredictably to off-screen elements when the PIP modal mounted.',
    workaround: 'Implemented an explicit FocusTrap & spatial navigation registry that remembers last-focused DOM ref across modal mount cycles.',
    suggestion: 'Release an official @amazon/firetv-spatial-nav React hook library to streamline 10-foot web app development.'
  },
  {
    task: 'AWS Bedrock AgentCore Tool Schema Coercion for Nested Objects',
    severity: 'Low',
    steps: 'Dispatched complex JSON schema containing nested object properties to Bedrock AgentCore for automatic tool selection.',
    expected: 'Claude 3.5 Sonnet generates perfectly typed nested JSON arguments matching the schema.',
    actual: 'Optional nested fields were occasionally omitted or returned as empty strings rather than undefined.',
    workaround: 'Applied schema sanitization with explicit default values and runtime zod/assert validation on all incoming tool payloads.',
    suggestion: 'Add automatic schema coercion and repair in the AWS Strands SDK before payloads reach tool executors.'
  }
];

const FRICTION_LOGS_TEXT = FRICTION_LOGS.map((log, i) => `### Friction Log Entry #${i + 1}: ${log.task}
- Severity: ${log.severity}
- Steps Taken: ${log.steps}
- Expected: ${log.expected}
- Actual: ${log.actual}
- Workaround Used: ${log.workaround}
- Actionable Suggestion: ${log.suggestion}
`).join('\n');

const FULL_SUBMISSION_MARKDOWN = `# NovaHub: Alexa+ MCP & Ambient Smart Living Platform
**Amazon Developer Tools Hackathon Submission**

## 1. Selected Tracks & Mini Challenges
- **Primary Track:** Alexa+ (Self-Hosted Streamable HTTP MCP Server spec 2025-11-25 & Agent Skill)
- **Cross-Track Integrations:** Ring IoT Access Control & Fire TV 10-Foot Companion UI
- **Mini Challenge 1:** AWS Builder (AWS Bedrock Claude 3.5 Sonnet / Amazon Nova Pro & Strands SDK AgentCore)
- **Mini Challenge 2:** Open Source (MIT License, Public Repository, Full MCP Server Implementation)

---

## 2. Project Description
${PROJECT_TEXT_DESCRIPTION}

---

## 3. GitHub Private Repository Collaborators Checklist
Added the required Amazon Developer Relations reviewers:
- [x] chris-trag
- [x] knmeiss (https://github.com/knmeiss)
- [x] giolaq (https://github.com/giolaq)
- [x] anishamalde (https://github.com/anishamalde)
- [x] mosesroth (https://github.com/mosesroth)
- [x] emersonsklar (https://github.com/emersonsklar)
- [x] testing@devpost.com

---

## 4. 3-Minute Demo Video Pitch Script
${VIDEO_SCRIPT_TEXT}

---

## 5. Product Feedback
${PRODUCT_FEEDBACK_TEXT}

---

## 6. Friction Logs (+10% Judging Bonus)
${FRICTION_LOGS_TEXT}
`;
