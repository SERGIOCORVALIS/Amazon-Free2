import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Eye, 
  Mic, 
  MicOff, 
  Bell, 
  AlertTriangle, 
  RefreshCw, 
  Key, 
  CheckCircle2, 
  Maximize2,
  Box,
  User,
  Activity,
  Layers,
  Sparkles,
  Camera,
  Download
} from 'lucide-react';
import type { RingDeviceState } from '../types/index.ts';
import { soundEffects } from '../lib/soundEffects.ts';

interface RingSimulatorProps {
  ringState: RingDeviceState;
  onUpdateRingState: (updater: (prev: RingDeviceState) => RingDeviceState) => void;
  onDispatchTool: (toolName: string, args: Record<string, any>) => Promise<any>;
}

const PRESET_SCENARIOS = [
  {
    id: 'courier',
    label: 'Amazon Prime Courier Delivery',
    imgUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80',
    objects: [
      { id: 'obj-1', label: 'Courier' as const, confidence: 0.98, bbox: [32, 24, 24, 62] as [number, number, number, number] },
      { id: 'obj-2', label: 'Package' as const, confidence: 0.95, bbox: [48, 70, 18, 18] as [number, number, number, number] }
    ]
  },
  {
    id: 'night_motion',
    label: 'Night Perimeter Motion Alert',
    imgUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=1200&auto=format&fit=crop&q=80',
    objects: [
      { id: 'obj-3', label: 'Visitor' as const, confidence: 0.92, bbox: [40, 30, 20, 50] as [number, number, number, number] }
    ]
  },
  {
    id: 'dog_porch',
    label: 'Neighborhood Pet at Porch',
    imgUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=1200&auto=format&fit=crop&q=80',
    objects: [
      { id: 'obj-4', label: 'Pet' as const, confidence: 0.96, bbox: [38, 45, 26, 38] as [number, number, number, number] }
    ]
  }
];

export const RingSimulator: React.FC<RingSimulatorProps> = ({
  ringState,
  onUpdateRingState,
  onDispatchTool
}) => {
  const [activeScenario, setActiveScenario] = useState<string>('courier');
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [intercomActive, setIntercomActive] = useState(false);
  const [isSirenActive, setIsSirenActive] = useState(false);
  const [manualPinInput, setManualPinInput] = useState('');
  const [pinFeedback, setPinFeedback] = useState<string | null>(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [customImageUri, setCustomImageUri] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const startWebcam = async () => {
    try {
      if (isWebcamActive) {
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(t => t.stop());
          videoRef.current.srcObject = null;
        }
        setIsWebcamActive(false);
        showToast('Live webcam stopped.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsWebcamActive(true);
      setCustomImageUri(null);
      soundEffects.playRemoteClick();
      showToast('Live camera connected to Ring Doorbell stream.');
    } catch {
      showToast('Camera access was not granted or not available. Using high-resolution simulation presets.');
    }
  };

  const handleCaptureSnapshot = () => {
    soundEffects.playRemoteClick();
    const activeScen = PRESET_SCENARIOS.find(s => s.id === activeScenario);
    const downloadUri = customImageUri || activeScen?.imgUrl || PRESET_SCENARIOS[0].imgUrl;
    
    // Create an anchor and trigger download
    const a = document.createElement('a');
    a.href = downloadUri;
    a.download = `Ring_Security_Capture_${Date.now()}.jpg`;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    showToast('📸 Security snapshot captured and saved to downloads.');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomImageUri(event.target.result as string);
          setIsWebcamActive(false);
          soundEffects.playRemoteClick();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleIntercom = () => {
    const nextState = !intercomActive;
    setIntercomActive(nextState);
    soundEffects.playRemoteClick();
  };

  const toggleLock = async () => {
    const nextLocked = !ringState.smartLockLocked;
    soundEffects.playSmartLockSound(!nextLocked);
    await onDispatchTool('ring_control_smart_lock', { action: nextLocked ? 'lock' : 'unlock' });
  };

  const handleSimulateChime = () => {
    soundEffects.playRingDoorbellChime();
    const newEvent = {
      id: `ev-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'ring' as const,
      summary: 'Front Doorbell pressed. Live chime broadcast to Alexa+ and Echo Show.',
      severity: 'alert' as const
    };
    onUpdateRingState(prev => ({
      ...prev,
      recentEvents: [newEvent, ...prev.recentEvents]
    }));
  };

  const handleSimulateDelivery = async () => {
    soundEffects.playRingDoorbellChime();
    setActiveScenario('courier');
    await onDispatchTool('ring_dispatch_access_code', {
      recipientName: 'Amazon Logistics Prime Courier',
      durationMinutes: 20,
      autoUnlockGate: true
    });
  };

  const handleScenarioChange = (scenarioId: string) => {
    setActiveScenario(scenarioId);
    const scen = PRESET_SCENARIOS.find(s => s.id === scenarioId);
    if (scen) {
      onUpdateRingState(prev => ({
        ...prev,
        detectedObjects: scen.objects,
        nightVision: scenarioId === 'night_motion',
        recentEvents: [
          {
            id: `ev-${Date.now()}`,
            time: 'Just now',
            type: 'motion',
            summary: `Camera context shifted to: ${scen.label}`,
            severity: scenarioId === 'night_motion' ? 'warning' : 'info'
          },
          ...prev.recentEvents
        ]
      }));
    }
  };

  const handleVerifyKeypadPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualPinInput === ringState.activeAccessCode) {
      setPinFeedback('PIN Verified! Smart Deadbolt Unlocked.');
      onUpdateRingState(prev => ({ ...prev, smartLockLocked: false }));
    } else {
      setPinFeedback('Invalid Access PIN. Access Denied.');
    }
    setTimeout(() => setPinFeedback(null), 4000);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100">Ring Doorbell Pro 2 & Access Control Simulator</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-950 text-blue-400 border border-blue-800">
                Ring APIs & SDK Track
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live WebRTC 1080p Stream • Computer Vision Package Guard • Yale Smart Deadbolt Dispatch
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateChime}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all"
          >
            <Bell className="w-3.5 h-3.5" />
            Ring Doorbell Chime
          </button>
          <button
            onClick={handleSimulateDelivery}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all"
          >
            <Box className="w-3.5 h-3.5" />
            Simulate Courier Delivery
          </button>
        </div>
      </div>

      {/* Camera Scenario Preset & Live Feed Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mr-1">
            <Camera className="w-3.5 h-3.5 text-blue-400" />
            Camera Input:
          </span>
          {PRESET_SCENARIOS.map((scen) => (
            <button
              key={scen.id}
              onClick={() => {
                if (isWebcamActive && videoRef.current?.srcObject) {
                  (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
                  setIsWebcamActive(false);
                }
                setCustomImageUri(null);
                handleScenarioChange(scen.id);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                !isWebcamActive && !customImageUri && activeScenario === scen.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {scen.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Live Webcam Toggle Button */}
          <button
            onClick={startWebcam}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
              isWebcamActive
                ? 'bg-rose-600 text-white border-rose-500 shadow-md animate-pulse'
                : 'bg-slate-950 text-cyan-300 border-cyan-800/80 hover:bg-slate-800'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            {isWebcamActive ? 'Stop Webcam' : 'Use Live Webcam'}
          </button>

          {/* Custom Image Upload */}
          <label className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-950 text-amber-300 border border-amber-800/80 hover:bg-slate-800 cursor-pointer transition-all">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Upload Photo</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
          {/* Capture Snapshot Button */}
          <button
            onClick={handleCaptureSnapshot}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-950 text-emerald-300 border border-emerald-800/80 hover:bg-slate-800 transition-all"
            title="Download high-res security snapshot with timestamp"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save Snapshot</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Ring Camera Stream (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-black aspect-video shadow-2xl group">
            {/* Camera Viewport Canvas/Image */}
            <div 
              className={`w-full h-full relative transition-all duration-300 ${
                ringState.nightVision ? 'filter grayscale contrast-125 brightness-90' : ''
              }`}
            >
              {isWebcamActive ? (
                /* Real User Webcam Stream */
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : customImageUri ? (
                /* User Uploaded Custom Image */
                <img
                  src={customImageUri}
                  alt="Custom Uploaded View"
                  className="w-full h-full object-cover"
                />
              ) : (
                /* Dynamic Porch Scene */
                <img
                  src={PRESET_SCENARIOS.find(s => s.id === activeScenario)?.imgUrl || PRESET_SCENARIOS[0].imgUrl}
                  alt="Front Porch Ring View"
                  className="w-full h-full object-cover"
                />
              )}

              {/* Night Vision Infrared Noise Overlay */}
              {ringState.nightVision && (
                <div className="absolute inset-0 bg-emerald-950/20 mix-blend-color pointer-events-none" />
              )}

              {/* Computer Vision Bounding Boxes */}
              {showBoundingBoxes && (
                <>
                  {/* Courier Bounding Box */}
                  <div 
                    className="absolute border-2 border-emerald-400 bg-emerald-500/10 rounded pointer-events-none transition-all duration-300"
                    style={{ left: '32%', top: '24%', width: '24%', height: '62%' }}
                  >
                    <div className="absolute -top-6 left-0 bg-emerald-500 text-slate-950 px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                      <User className="w-2.5 h-2.5" />
                      Amazon Courier (98%)
                    </div>
                  </div>

                  {/* Package Bounding Box */}
                  <div 
                    className="absolute border-2 border-amber-400 bg-amber-500/15 rounded pointer-events-none transition-all duration-300"
                    style={{ left: '48%', top: '70%', width: '18%', height: '18%' }}
                  >
                    <div className="absolute -top-6 left-0 bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                      <Box className="w-2.5 h-2.5" />
                      Amazon Parcel (95%)
                    </div>
                  </div>
                </>
              )}

              {/* Live HUD Overlays */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/70 backdrop-blur-md text-[11px] font-mono text-white border border-white/20">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  REC • 1080p HDR
                </span>
                <span className="px-2 py-1 rounded-md bg-black/70 backdrop-blur-md text-[11px] font-mono text-cyan-300 border border-white/20">
                  Ring Doorbell Pro 2
                </span>
              </div>

              <div className="absolute top-3 right-3 flex items-center gap-2">
                <span className="px-2 py-1 rounded-md bg-black/70 backdrop-blur-md text-[11px] font-mono text-slate-300 border border-white/20">
                  Battery: {ringState.batteryLevel}%
                </span>
                <span className="px-2 py-1 rounded-md bg-black/70 backdrop-blur-md text-[11px] font-mono text-slate-300 border border-white/20">
                  RSSI: -52 dBm
                </span>
              </div>

              {/* In-HUD Toast Notification */}
              {toastMessage && (
                <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 bg-slate-950/95 border border-cyan-500/80 text-cyan-200 px-4 py-2 rounded-xl shadow-2xl backdrop-blur-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{toastMessage}</span>
                </div>
              )}

              {/* Two-Way Intercom Indicator */}
              {intercomActive && (
                <div className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600/90 text-white text-xs font-semibold shadow-lg backdrop-blur-md animate-pulse">
                  <Mic className="w-4 h-4" />
                  Two-Way Audio Live (Porch Speaker On)
                </div>
              )}

              {/* Siren Warning */}
              {isSirenActive && (
                <div className="absolute inset-0 bg-rose-600/40 animate-ping pointer-events-none flex items-center justify-center">
                  <div className="bg-rose-600 text-white font-black px-6 py-3 rounded-2xl text-xl shadow-2xl flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6" />
                    SIREN ALARM ACTIVE (110 dB)
                  </div>
                </div>
              )}
            </div>

            {/* Camera Control Toolbar */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-all ${
                    showBoundingBoxes
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  AI Vision Bounding Boxes
                </button>

                <button
                  onClick={() => onUpdateRingState(prev => ({ ...prev, nightVision: !prev.nightVision }))}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-all ${
                    ringState.nightVision
                      ? 'bg-purple-950 text-purple-300 border-purple-800'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  IR Night Vision {ringState.nightVision ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIntercomActive(!intercomActive)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-all ${
                    intercomActive
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {intercomActive ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                  {intercomActive ? 'Intercom Active' : 'Push to Talk'}
                </button>

                <button
                  onClick={() => setIsSirenActive(!isSirenActive)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-all ${
                    isSirenActive
                      ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                      : 'bg-slate-900 text-rose-400 border-slate-800 hover:bg-rose-950/40'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {isSirenActive ? 'Silence Siren' : 'Siren Alarm'}
                </button>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                Ring Security Audit Log
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                {ringState.recentEvents.length} Recent Events
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin">
              {ringState.recentEvents.map((ev) => (
                <div 
                  key={ev.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      ev.severity === 'alert' ? 'bg-rose-400 animate-ping' :
                      ev.severity === 'warning' ? 'bg-amber-400' : 'bg-blue-400'
                    }`} />
                    <span className="text-slate-200 font-medium">{ev.summary}</span>
                  </div>
                  <span className="text-slate-500 font-mono text-[11px] shrink-0">{ev.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Yale Smart Lock & Access Control Keypad (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Smart Lock Control */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl ${ringState.smartLockLocked ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'}`}>
                  {ringState.smartLockLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-100">Yale Smart Deadbolt</h4>
                  <p className="text-xs text-slate-400">Ring Access Control</p>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                ringState.smartLockLocked ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}>
                {ringState.smartLockLocked ? 'Locked' : 'Unlocked'}
              </span>
            </div>

            <button
              onClick={toggleLock}
              className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                ringState.smartLockLocked
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
              }`}
            >
              {ringState.smartLockLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              {ringState.smartLockLocked ? 'Unlock Front Deadbolt' : 'Lock Front Deadbolt'}
            </button>

            {/* Active OTP Access Code Display */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Single-Use Delivery Code:</span>
                <Key className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-lg text-cyan-300 tracking-wider">
                  {ringState.activeAccessCode ? ringState.activeAccessCode : '••••••'}
                </span>
                {ringState.activeAccessCode ? (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                    Active (15 min)
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500">
                    Generated via Alexa+
                  </span>
                )}
              </div>
            </div>

            {/* Courier Keypad Verification Simulator */}
            <form onSubmit={handleVerifyKeypadPin} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                Porch Keypad PIN Test (Simulate Courier Entry)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit PIN"
                  value={manualPinInput}
                  onChange={(e) => setManualPinInput(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 text-slate-100 font-mono text-center text-sm rounded-lg py-1.5 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-lg transition-all"
                >
                  Verify
                </button>
              </div>

              {pinFeedback && (
                <div className={`p-2 rounded text-xs font-medium ${
                  pinFeedback.includes('Verified') ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}>
                  {pinFeedback}
                </div>
              )}
            </form>
          </div>

          {/* Ring SDK Developer Integration Card */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-xl text-xs space-y-2">
            <div className="font-bold text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              Ring API & Simulator Architecture
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Integrates with the Ring Device SDK & Access Control protocol. Allows Alexa+ agents and MCP clients to query optical streams and dispatch cryptographically hashed one-time access codes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
