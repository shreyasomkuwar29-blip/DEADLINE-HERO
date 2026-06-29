import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Compass, 
  Cpu, 
  Zap, 
  ShieldCheck,
  Music,
  Tv
} from "lucide-react";
import { Task, UserProfile } from "../types";

interface FocusModeViewProps {
  tasks: Task[];
  activeMission: Task | null;
  profile: UserProfile;
  onLogFocusSession: (taskId: string | undefined, duration: number) => void;
}

export default function FocusModeView({
  tasks,
  activeMission,
  profile,
  onLogFocusSession
}: FocusModeViewProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(activeMission);
  const [sessionLength, setSessionLength] = useState<number>(25); // In minutes
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60); // In seconds
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCinemaMode, setIsCinemaMode] = useState<boolean>(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState<boolean>(false);
  
  // Ambient Sound states
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioNodesRef = useRef<any[]>([]);

  // Procedural celebration chime
  const playCelebrationChime = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C E G C E G C cascade!
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0, now + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.06, now + idx * 0.12 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 1.2);
      });
    } catch (e) {
      console.warn("AudioContext block by user gesture limits", e);
    }
  };

  // Web Audio Synth engine controller
  useEffect(() => {
    let intervalId: any = null;
    
    const stopAudio = () => {
      audioNodesRef.current.forEach(node => {
        try { node.stop(); } catch (e) {}
        try { node.disconnect(); } catch (e) {}
      });
      audioNodesRef.current = [];
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    if (!activeSound || isMuted) {
      stopAudio();
      return;
    }

    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      stopAudio();

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.08, ctx.currentTime); // Soft, non-intrusive
      masterGain.connect(ctx.destination);

      if (activeSound === "space") {
        // Deep Space drone pads
        const frequencies = [73.42, 110.00, 146.83]; // D2, A2, D3 chord
        frequencies.forEach(freq => {
          const osc = ctx.createOscillator();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          const filter = ctx.createBiquadFilter();
          filter.type = "lowpass";
          filter.frequency.setValueAtTime(160, ctx.currentTime);

          const lfo = ctx.createOscillator();
          lfo.frequency.setValueAtTime(0.06, ctx.currentTime); // Ultra slow filter sweep
          const lfoGain = ctx.createGain();
          lfoGain.gain.setValueAtTime(50, ctx.currentTime);

          lfo.connect(lfoGain);
          lfoGain.connect(filter.frequency);

          osc.connect(filter);
          filter.connect(masterGain);

          lfo.start();
          osc.start();

          audioNodesRef.current.push(lfo, osc);
        });

      } else if (activeSound === "rain") {
        // Cosmic White noise rain shower
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(600, ctx.currentTime);
        filter.Q.setValueAtTime(1.2, ctx.currentTime);

        const windLfo = ctx.createOscillator();
        windLfo.frequency.setValueAtTime(0.15, ctx.currentTime);
        const windGain = ctx.createGain();
        windGain.gain.setValueAtTime(250, ctx.currentTime);

        windLfo.connect(windGain);
        windGain.connect(filter.frequency);

        noise.connect(filter);
        filter.connect(masterGain);

        windLfo.start();
        noise.start();

        audioNodesRef.current.push(windLfo, noise);

      } else if (activeSound === "forest") {
        // Nature meditation frequency (Carrier: 136.1Hz Om tone + random chirps)
        const carrier = ctx.createOscillator();
        carrier.type = "sine";
        carrier.frequency.setValueAtTime(136.1, ctx.currentTime);

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(140, ctx.currentTime);

        carrier.connect(filter);
        filter.connect(masterGain);
        carrier.start();
        audioNodesRef.current.push(carrier);

        // Wind rustling chime oscillator
        const chimeOsc = ctx.createOscillator();
        chimeOsc.type = "sine";
        chimeOsc.frequency.setValueAtTime(640, ctx.currentTime);

        const chimeGain = ctx.createGain();
        chimeGain.gain.setValueAtTime(0, ctx.currentTime);

        chimeOsc.connect(chimeGain);
        chimeGain.connect(ctx.destination);
        chimeOsc.start();
        audioNodesRef.current.push(chimeOsc);

        intervalId = setInterval(() => {
          const now = ctx.currentTime;
          chimeGain.gain.setValueAtTime(0, now);
          chimeGain.gain.linearRampToValueAtTime(0.015, now + 0.12);
          chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
          chimeOsc.frequency.setValueAtTime(500 + Math.random() * 500, now);
        }, 4000);

      } else if (activeSound === "waves") {
        // Real Theta Binaural wave (Left ear: 200Hz, Right ear: 204Hz -> 4Hz Theta beat)
        const merger = ctx.createChannelMerger(2);

        const leftOsc = ctx.createOscillator();
        leftOsc.type = "sine";
        leftOsc.frequency.setValueAtTime(200, ctx.currentTime);

        const rightOsc = ctx.createOscillator();
        rightOsc.type = "sine";
        rightOsc.frequency.setValueAtTime(204, ctx.currentTime);

        const leftGain = ctx.createGain();
        leftGain.gain.setValueAtTime(0.5, ctx.currentTime);

        const rightGain = ctx.createGain();
        rightGain.gain.setValueAtTime(0.5, ctx.currentTime);

        leftOsc.connect(leftGain);
        rightOsc.connect(rightGain);

        leftGain.connect(merger, 0, 0);
        rightGain.connect(merger, 0, 1);

        merger.connect(masterGain);

        leftOsc.start();
        rightOsc.start();

        audioNodesRef.current.push(leftOsc, rightOsc);
      }
    } catch (e) {
      console.warn("Web Audio Context execution blocked until user click gesture", e);
    }

    return () => {
      stopAudio();
    };
  }, [activeSound, isMuted]);

  // Sync with prop from outside
  useEffect(() => {
    if (activeMission) {
      setSelectedTask(activeMission);
      setSessionLength(activeMission.estTime || 25);
      setTimeLeft((activeMission.estTime || 25) * 60);
      setIsRunning(false);
    }
  }, [activeMission]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (timerRef.current) clearInterval(timerRef.current);
            // Log completed focus record!
            onLogFocusSession(selectedTask?.id, sessionLength);
            
            // Trigger stunning modal celebration and procedural victory cascade!
            playCelebrationChime();
            setIsCompleteOpen(true);

            return sessionLength * 60;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, selectedTask, sessionLength]);

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(sessionLength * 60);
  };

  const handleLengthChange = (mins: number) => {
    setIsRunning(false);
    setSessionLength(mins);
    setTimeLeft(mins * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleSoundToggle = (soundId: string) => {
    if (activeSound === soundId) {
      setActiveSound(null);
    } else {
      setActiveSound(soundId);
      setIsMuted(false);
    }
  };

  const activeIncompleteTasks = tasks.filter(t => t.status !== "completed");

  const progressPercent = ((sessionLength * 60 - timeLeft) / (sessionLength * 60)) * 100;

  // Sound items
  const ambientSounds = [
    { id: "space", label: "🌌 Deep Space Synth", desc: "Ambient cosmic waves" },
    { id: "rain", label: "🌧️ Cosmic Rain", desc: "Soft white-noise downpour" },
    { id: "forest", label: "🍃 Zen Forest", desc: "Nature binaural frequency" },
    { id: "waves", label: "🌊 Binary Waves", desc: "528Hz memory resonance" }
  ];

  return (
    <div className={`space-y-6 transition-all duration-500 text-[#F8FAFC] ${isCinemaMode ? "max-w-2xl mx-auto py-8" : "animate-fade-in"}`}>
      
      {/* 1. CINEMA MODE HEADER */}
      <div className="flex items-center justify-between">
        {!isCinemaMode ? (
          <div>
            <h2 className="font-display font-bold text-3xl tracking-tight text-white">Focus Core</h2>
            <p className="text-sm text-[#94A3B8] mt-1 font-sans">
              Deploy distraction-free pomodoro filters to stay in the zone.
            </p>
          </div>
        ) : (
          <div className="w-2 h-2" />
        )}

        <button
          onClick={() => setIsCinemaMode(!isCinemaMode)}
          className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border ${
            isCinemaMode 
              ? "bg-[#6D5EF8]/20 border-[#6D5EF8]/40 text-[#22D3EE]" 
              : "bg-[#0e111b] border-white/5 hover:border-white/10 text-[#94A3B8] hover:text-white"
          }`}
        >
          <Tv className="w-4 h-4" />
          {isCinemaMode ? "Normal View" : "Cinema Mode"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* TIMER CORE CIRCLE (Col span 12 or 8) */}
        <div className={`${isCinemaMode ? "md:col-span-12" : "md:col-span-7 lg:col-span-8"} bg-[#0e111b] border border-white/5 rounded-[24px] p-6 flex flex-col items-center justify-center relative overflow-hidden min-h-[420px]`}>
          <div className="absolute inset-0 bg-gradient-to-tr from-[#6D5EF8]/5 via-transparent to-[#22D3EE]/0 pointer-events-none" />
          
          {/* Animated pulsing gradient orb backdrop inside */}
          {isRunning && (
            <div className="absolute w-72 h-72 bg-gradient-to-tr from-[#6D5EF8] to-[#22D3EE] rounded-full opacity-[0.03] blur-3xl animate-pulse-glow pointer-events-none" />
          )}

          {/* Active Mission header */}
          <div className="text-center z-10 mb-6">
            <span className="text-[10px] text-[#22D3EE] font-mono font-bold uppercase tracking-widest block mb-1">
              Active Focus target
            </span>
            {selectedTask ? (
              <h3 className="font-display font-bold text-lg text-white max-w-sm truncate">
                🎯 {selectedTask.title}
              </h3>
            ) : (
              <select
                onChange={(e) => {
                  const task = tasks.find(t => t.id === e.target.value);
                  if (task) {
                    setSelectedTask(task);
                    setSessionLength(task.estTime || 25);
                    setTimeLeft((task.estTime || 25) * 60);
                  }
                }}
                className="bg-[#050608] border border-white/5 text-xs text-[#94A3B8] font-medium px-4 py-2 rounded-xl focus:outline-none"
              >
                <option value="">Select a mission target...</option>
                {activeIncompleteTasks.map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            )}
          </div>

          {/* Core Countdown Progress Circle */}
          <div className="relative w-56 h-56 flex items-center justify-center z-10">
            <svg className="w-full h-full transform -rotate-90">
              <circle 
                cx="112" 
                cy="112" 
                r="94" 
                className="stroke-[#050608]" 
                strokeWidth="6" 
                fill="transparent" 
              />
              <circle 
                cx="112" 
                cy="112" 
                r="94" 
                className="stroke-[#22D3EE] transition-all duration-300" 
                strokeWidth="6" 
                fill="transparent" 
                strokeDasharray={2 * Math.PI * 94}
                strokeDashoffset={((100 - progressPercent) / 100) * (2 * Math.PI * 94)}
                strokeLinecap="round"
              />
            </svg>

            <div className="absolute flex flex-col items-center">
              <span className="text-5xl font-mono font-bold text-white tracking-tight leading-none glow-text-primary">
                {formatTime(timeLeft)}
              </span>
              <span className="text-[10px] text-[#94A3B8] uppercase font-mono tracking-widest mt-3.5 flex items-center gap-1">
                {isRunning ? (
                  <>
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                    Deep Flow Loop
                  </>
                ) : "Loop paused"}
              </span>
            </div>
          </div>

          {/* Quick buttons */}
          <div className="flex items-center gap-4 mt-8 z-10">
            <button
              onClick={handleReset}
              className="p-3.5 bg-[#050608] hover:bg-[#0e111b] border border-white/5 hover:border-white/10 rounded-2xl text-[#94A3B8] hover:text-white transition-all cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-4.5 h-4.5" />
            </button>

            <button
              onClick={handleStartPause}
              className="w-16 h-16 rounded-2xl bg-gradient-to-r from-[#6D5EF8] to-[#22D3EE] text-white flex items-center justify-center shadow-lg shadow-[#6D5EF8]/20 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/10"
              title={isRunning ? "Pause" : "Play"}
            >
              {isRunning ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-1" />}
            </button>

            <div className="flex bg-[#050608] border border-white/5 rounded-2xl overflow-hidden p-1">
              {[25, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => handleLengthChange(mins)}
                  className={`px-3 py-1.5 text-[10px] font-mono font-bold rounded-xl transition-all cursor-pointer ${
                    sessionLength === mins ? "bg-[#0e111b] text-[#22D3EE]" : "text-[#94A3B8] hover:text-white"
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AMBIENT MUSIC SIDE PANEL (Col span 4, hidable on cinema mode) */}
        {!isCinemaMode && (
          <div className="md:col-span-5 lg:col-span-4 space-y-6">
            <div className="bg-[#0e111b] border border-white/5 rounded-[24px] p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h4 className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                  <Music className="w-4.5 h-4.5 text-[#6D5EF8]" /> Ambient Soundscape
                </h4>
                {activeSound && (
                  <button 
                    onClick={() => setIsMuted(!isMuted)} 
                    className="p-1.5 bg-[#050608] border border-white/5 rounded-lg text-[#94A3B8] hover:text-white cursor-pointer"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-[#22D3EE]" />}
                  </button>
                )}
              </div>

              <p className="text-xs text-[#94A3B8] leading-normal">
                Synthesize custom binaural audio patterns designed to align neural cognitive baseline speeds.
              </p>

              <div className="space-y-2.5">
                {ambientSounds.map((s) => {
                  const isActive = activeSound === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => handleSoundToggle(s.id)}
                      className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        isActive 
                          ? "bg-[#6D5EF8]/10 border-[#6D5EF8]/40" 
                          : "bg-[#050608] border-white/5 hover:border-white/10"
                      }`}
                    >
                      <div>
                        <span className="text-xs font-semibold text-white block">{s.label}</span>
                        <span className="text-[10px] text-[#94A3B8] block mt-0.5">{s.desc}</span>
                      </div>
                      {isActive && !isMuted && (
                        <div className="flex space-x-0.5 items-end h-3 shrink-0">
                          <div className="h-2 w-0.5 bg-[#22D3EE] animate-pulse" />
                          <div className="h-3 w-0.5 bg-[#22D3EE] animate-pulse [animation-delay:0.2s]" />
                          <div className="h-1.5 w-0.5 bg-[#22D3EE] animate-pulse [animation-delay:0.4s]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* FOCUS TIPS */}
            <div className="bg-[#181C25] border border-white/5 rounded-[24px] p-5.5 space-y-4">
              <h4 className="font-display font-bold text-xs text-white uppercase tracking-wider">Flow Strategy</h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                "Eliminate split-attention hazards. Turn off secondary displays, close tab arrays, and focus on one specific visual target for at least 8 minutes to enter deep block states."
              </p>
            </div>
          </div>
        )}

      </div>

      {/* POMODORO COMPLETION MODAL */}
      {isCompleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-md bg-[#181C25] border border-[#22D3EE]/30 rounded-[32px] p-6.5 text-center relative overflow-hidden shadow-2xl shadow-[#22D3EE]/5">
            {/* Ambient stars/floating particles background */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#22D3EE]/10 to-transparent rounded-full blur-xl animate-pulse" />
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-t from-[#6D5EF8]/10 to-transparent rounded-full blur-2xl pointer-events-none" />

            {/* Glowing check circle */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#6D5EF8] to-[#22D3EE] flex items-center justify-center mx-auto text-white shadow-xl shadow-[#6D5EF8]/20 animate-scale-up relative group">
              <Sparkles className="w-9 h-9 text-white animate-pulse" />
              {/* Internal spinning orbit rings */}
              <div className="absolute inset-0 border border-white/20 rounded-full animate-spin-slow scale-110 pointer-events-none" />
            </div>

            <span className="text-[10px] text-[#22D3EE] font-mono font-black uppercase tracking-widest block mt-6">BLOCK SESSION COMPLETED</span>
            <h3 className="font-display font-black text-2xl text-white mt-1.5 uppercase tracking-wide leading-none">
              EMERGENCY DRIFT PREVENTED
            </h3>
            
            <p className="text-xs text-[#94A3B8] leading-relaxed mt-3.5 px-2">
              Outstanding work, {profile.name}! You completed your <strong className="text-white">{sessionLength}-minute</strong> focus run on <strong className="text-[#22D3EE]">{selectedTask?.title || "your active mission target"}</strong>. Your Deadline Health Index has been recalibrated.
            </p>

            <div className="flex flex-col gap-2.5 mt-7">
              <button
                onClick={() => {
                  setIsCompleteOpen(false);
                  handleReset();
                }}
                className="w-full bg-gradient-to-r from-[#6D5EF8] to-[#22D3EE] hover:brightness-110 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#6D5EF8]/10 cursor-pointer border border-white/10"
              >
                Launch Next Loop
              </button>
              
              <button
                onClick={() => setIsCompleteOpen(false)}
                className="w-full bg-[#050608] hover:bg-[#0e111b] border border-white/5 hover:border-white/10 text-[#94A3B8] hover:text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Close Shield
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
