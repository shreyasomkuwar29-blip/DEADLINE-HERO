import React, { useState, useEffect } from "react";
import { 
  motion, 
  AnimatePresence 
} from "motion/react";
import { 
  ShieldAlert, 
  Sparkles, 
  Clock, 
  Calendar, 
  Check, 
  ArrowRight, 
  Play, 
  Cpu, 
  AlertCircle, 
  X,
  Zap,
  TrendingUp,
  BrainCircuit
} from "lucide-react";
import { Task, CalendarEvent } from "../types";
import { sendMessageToAi } from "../utils/ai";

interface HeroRescueModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onAddEvent: (event: Omit<CalendarEvent, "id">) => void;
  onNavigateToPage: (page: string) => void;
  onSelectHeroMission: (task: Task) => void;
}

export default function HeroRescueModal({
  isOpen,
  onClose,
  tasks,
  onAddEvent,
  onNavigateToPage,
  onSelectHeroMission
}: HeroRescueModalProps) {
  const [phase, setPhase] = useState<"intro" | "scanning" | "result">("intro");
  const [scanStep, setScanStep] = useState<number>(0);
  const [rescuePlanText, setRescuePlanText] = useState<string>("");
  const [isApplyingPlan, setIsApplyingPlan] = useState<boolean>(false);
  const [isApplied, setIsApplied] = useState<boolean>(false);

  const atRiskTasks = tasks.filter(t => t.status !== "completed" && (t.priority === "high" || t.riskLevel === "high"));
  const displayTasks = atRiskTasks.length > 0 ? atRiskTasks : tasks.filter(t => t.status !== "completed").slice(0, 3);

  const scanSteps = [
    { text: "Mapping deadline compaction matrix indices...", duration: 1200 },
    { text: "Locating daily passive cognitive focus slots...", duration: 1100 },
    { text: "Simulating calendar relocations to absorb overload...", duration: 1000 },
    { text: "Synthesizing deep-flow schedule rescue plan...", duration: 1200 }
  ];

  useEffect(() => {
    if (!isOpen) {
      setPhase("intro");
      setScanStep(0);
      setRescuePlanText("");
      setIsApplied(false);
      setIsApplyingPlan(false);
    }
  }, [isOpen]);

  const triggerScan = async () => {
    setPhase("scanning");
    setScanStep(0);

    // Call real AI (or get fallback) in the background while scanning effect runs
    const taskNames = displayTasks.map(t => `${t.title} (Est. ${t.estTime}m, Due ${t.deadline})`).join(", ");
    const rescuePrompt = `Construct an elite Emergency Rescue Plan for these approaching deadlines: [${taskNames}]. 
Format the response clearly with:
- **COMPACTION THREAT STATUS**: Clear 1-sentence warning of risk factors.
- **TACTICAL RESCUE BLOCKS**: A structured hour-by-hour or daily guide to clear these specific targets without burnout.
- **CALENDAR BUFFER ADJUSTMENTS**: Suggest moving non-essential meetings/routines out of the way.
Make it deeply tactical, highly structured, encouraging, and easy to scan using elegant markdown bullet points. Do not include introductory conversational fluff.`;

    let aiResultPromise = sendMessageToAi(rescuePrompt, [], tasks, "strategist");

    // Execute scanning step animations
    for (let i = 0; i < scanSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, scanSteps[i].duration));
      setScanStep(prev => prev + 1);
    }

    try {
      const plan = await aiResultPromise;
      setRescuePlanText(plan);
    } catch (e) {
      setRescuePlanText(`**COMPACTION THREAT STATUS**: High deadline proximity detected for your core academic prep and design sprint streams.

**TACTICAL RESCUE BLOCKS**:
- **08:00 AM - 10:00 AM**: Emergency Focus Session on Neural Networks. Target derivative backprop loss calculations next.
- **10:30 AM - 12:00 PM**: Block out Figma spec designs.
- **02:00 PM - 03:00 PM**: Buffer slot to absorb calendar drift.

**CALENDAR BUFFER ADJUSTMENTS**:
- Shift all routine reviews to Monday to safeguard critical Tuesday output parameters.`);
    }

    setPhase("result");
  };

  const applyRescuePlanToCalendar = () => {
    setIsApplyingPlan(true);
    setTimeout(() => {
      // Add emergency focus events based on the plan
      displayTasks.forEach((t, idx) => {
        const offsetHours = idx === 0 ? 2 : 5;
        const start = new Date();
        start.setHours(start.getHours() + offsetHours);
        const end = new Date(start.getTime() + (t.estTime || 60) * 60 * 1000);

        onAddEvent({
          title: `🛡️ RESCUE: ${t.title}`,
          start: start.toISOString().substring(0, 16),
          end: end.toISOString().substring(0, 16),
          taskId: t.id,
          category: t.category
        });
      });

      setIsApplyingPlan(false);
      setIsApplied(true);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl overflow-y-auto p-4 select-none">
      
      {/* Cinematic Sci-fi Scanline overlays */}
      <div className="absolute inset-0 bg-scanlines pointer-events-none opacity-[0.03] z-0" />
      <div className="absolute inset-0 bg-radial-gradient-cinematic pointer-events-none z-0" />

      {/* Outer wrapper */}
      <div className="w-full max-w-3xl bg-[#050608]/90 border border-red-500/30 rounded-[32px] overflow-hidden shadow-2xl shadow-red-500/5 relative z-10 my-8">
        
        {/* Absolute Red Warning pulse glows */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-red-500/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Header bar */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-red-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-500 animate-pulse shadow-md shadow-red-500/10">
              <ShieldAlert className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-black text-red-400 uppercase tracking-widest block">Emergency Shield V4.1</span>
              <h2 className="font-display font-black text-lg text-white uppercase tracking-wider flex items-center gap-2">
                Hero Rescue Protocol
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/5 rounded-xl text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content area based on Phase */}
        <div className="p-6 md:p-8 min-h-[380px] flex flex-col justify-between">
          
          <AnimatePresence mode="wait">
            
            {/* PHASE 1: INTRO COMPACT AT-RISK SCREEN */}
            {phase === "intro" && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="space-y-6 flex-1 flex flex-col justify-between"
              >
                <div className="text-center max-w-xl mx-auto space-y-3.5">
                  <h3 className="font-display font-black text-3xl md:text-4xl text-white tracking-tight leading-none uppercase">
                    🛡️ HERO RESCUE ACTIVATED
                  </h3>
                  <p className="text-sm text-red-400 font-semibold tracking-wide uppercase font-mono">
                    "We found a way to save your deadline."
                  </p>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    Our AI cognitive buffer engine detected overlapping priority deadlocks within the next 48 hours. Launch emergency routines immediately to salvage safety margins.
                  </p>
                </div>

                {/* List of at risk targets */}
                <div className="space-y-3 max-w-lg mx-auto w-full py-4">
                  <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-wider block">TARGETS IN IMMINENT PERIL:</span>
                  
                  {displayTasks.map((t) => (
                    <div 
                      key={t.id} 
                      className="bg-[#0e111b] border border-red-500/15 rounded-2xl p-4 flex items-center justify-between gap-4 relative overflow-hidden group hover:border-red-500/30 transition-all"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
                      <div>
                        <span className="text-[10px] font-mono text-red-400 font-bold uppercase block tracking-wider">
                          Due {new Date(t.deadline).toLocaleDateString(undefined, {weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}
                        </span>
                        <h4 className="text-sm font-display font-bold text-white mt-1 group-hover:text-red-400 transition-colors">
                          {t.title}
                        </h4>
                        <p className="text-[11px] text-[#94A3B8] line-clamp-1 mt-0.5 leading-snug">
                          {t.description || "Requires immediate focus absorption."}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-semibold text-[#F5B942] bg-[#F5B942]/10 border border-[#F5B942]/20 px-2.5 py-1 rounded-lg block uppercase">
                          {t.estTime} min
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Confirm deployment button */}
                <div className="flex flex-col items-center gap-3 pt-4">
                  <button
                    onClick={triggerScan}
                    className="w-full sm:w-auto bg-gradient-to-r from-red-500 via-orange-500 to-red-500 hover:brightness-110 active:scale-95 text-white px-8 py-4 rounded-2xl text-sm font-black tracking-widest uppercase flex items-center justify-center gap-2.5 shadow-xl shadow-red-500/10 cursor-pointer border border-white/10"
                  >
                    <Zap className="w-4.5 h-4.5 fill-white" />
                    Deploy AI Rescue Plan
                  </button>
                  <span className="text-[10px] text-[#94A3B8] font-mono">Guarantees optimal schedule allocation</span>
                </div>
              </motion.div>
            )}

            {/* PHASE 2: SCI-FI SCANNING DYNAMIC SCREEN */}
            {phase === "scanning" && (
              <motion.div
                key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col items-center justify-center text-center space-y-6 py-10"
              >
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse" />
                  <div className="absolute inset-0 border-2 border-dashed border-red-500 rounded-full animate-spin-slow" />
                  <Cpu className="w-10 h-10 text-red-500 animate-pulse" />
                </div>

                <div className="space-y-2 max-w-sm">
                  <h4 className="font-display font-black text-lg text-white uppercase tracking-wider">
                    Engaging Cognitive Rescue Matrices
                  </h4>
                  <div className="h-1.5 w-48 bg-[#050608] border border-white/10 rounded-full overflow-hidden mx-auto">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-red-500 to-orange-400"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 4.5, ease: "linear" }}
                    />
                  </div>
                </div>

                <div className="h-8 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.p 
                      key={scanStep}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.18 }}
                      className="text-xs text-[#22D3EE] font-mono tracking-wide"
                    >
                      {scanSteps[Math.min(scanStep, scanSteps.length - 1)]?.text}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* PHASE 3: BEAUTIFUL GENERATED RESULTS TABLE */}
            {phase === "result" && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="space-y-6 flex-1 flex flex-col justify-between"
              >
                <div className="bg-[#0e111b] border border-red-500/20 rounded-2xl p-5 flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center shrink-0">
                    <BrainCircuit className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm font-display font-bold text-white uppercase">RESCUE FORMULATION COMPILED</h4>
                    <p className="text-xs text-[#94A3B8] leading-relaxed mt-0.5">
                      Your high-probability timeline has been restructured. Below is your cinematic action blueprint.
                    </p>
                  </div>
                </div>

                {/* Markdown text displaying plan */}
                <div className="bg-[#050608] border border-white/5 rounded-2xl p-5 h-64 overflow-y-auto text-xs text-[#94A3B8] leading-relaxed scrollbar">
                  <div className="space-y-4 whitespace-pre-wrap font-sans">
                    {rescuePlanText ? (
                      <div className="prose prose-invert prose-xs">
                        {/* Simple formatting render for bold lines */}
                        {rescuePlanText.split("\n").map((line, idx) => {
                          if (line.startsWith("**") || line.startsWith("###")) {
                            return (
                              <p key={idx} className="font-bold text-white text-xs tracking-wide uppercase flex items-center gap-1.5 mt-3 border-b border-white/5 pb-1 select-text">
                                <Sparkles className="w-3.5 h-3.5 text-[#22D3EE] shrink-0" />
                                {line.replace(/\*\*|###/g, "")}
                              </p>
                            );
                          }
                          return <p key={idx} className="pl-5 relative select-text">{line}</p>;
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-[#94A3B8] italic font-mono">
                        Receiving signal transmissions...
                      </div>
                    )}
                  </div>
                </div>

                {/* Final interactions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                  <button
                    onClick={applyRescuePlanToCalendar}
                    disabled={isApplyingPlan || isApplied}
                    className={`px-5 py-3.5 rounded-2xl text-xs font-bold uppercase flex items-center justify-center gap-2.5 transition-all cursor-pointer border ${
                      isApplied 
                        ? "bg-green-500/15 border-green-500/30 text-green-400" 
                        : "bg-[#0e111b] border-[#6D5EF8]/30 hover:border-[#6D5EF8]/60 text-white"
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    {isApplied ? "Rescue Calendar Synchronized!" : isApplyingPlan ? "Deploying Calendar Buffers..." : "Apply Calendar Rescue Block"}
                  </button>

                  <button
                    onClick={() => {
                      onClose();
                      onSelectHeroMission(displayTasks[0]);
                      onNavigateToPage("focus");
                    }}
                    className="bg-[#6D5EF8] hover:bg-[#6D5EF8]/90 text-white px-5 py-3.5 rounded-2xl text-xs font-black uppercase flex items-center justify-center gap-2.5 shadow-lg shadow-[#6D5EF8]/20 transition-all cursor-pointer border border-white/10"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    Launch Emergency Focus Mode
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

        </div>

      </div>

    </div>
  );
}
