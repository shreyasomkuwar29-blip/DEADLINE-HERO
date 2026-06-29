import React, { useState } from "react";
import { 
  Zap, 
  Target, 
  Flame, 
  Clock, 
  Sparkles, 
  TrendingUp, 
  Calendar, 
  RefreshCw, 
  ShieldCheck, 
  ArrowRight,
  AlertTriangle,
  Play,
  ShieldAlert,
  X,
  Award,
  BrainCircuit,
  CheckSquare,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Task, AiInsight, UserProfile, CalendarEvent } from "../types";
import { calculateMissionRisk } from "../utils/ai";

interface DashboardViewProps {
  tasks: Task[];
  profile: UserProfile;
  insights: AiInsight[];
  healthScore: number;
  isAiAnalyzing: boolean;
  onAiSync: () => void;
  onNavigateToPage: (page: string) => void;
  onSelectHeroMission: (task: Task) => void;
  onOpenRescueModal: () => void;
  onOpenMissionModal: (dateStr?: string | null, taskToEdit?: Task | null) => void;
  onAddEvent?: (event: Omit<CalendarEvent, "id">) => void;
}

export default function DashboardView({
  tasks,
  profile,
  insights,
  healthScore,
  isAiAnalyzing,
  onAiSync,
  onNavigateToPage,
  onSelectHeroMission,
  onOpenRescueModal,
  onOpenMissionModal,
  onAddEvent
}: DashboardViewProps) {
  // Get active tasks
  const activeTasks = tasks.filter(t => t.status !== "completed");
  
  // Find highest priority nearest deadline task to be Today's Hero Mission
  const heroMission = activeTasks.length > 0 
    ? [...activeTasks].sort((a, b) => {
        // High priority first, then closer deadlines
        const prioMap = { high: 3, medium: 2, low: 1 };
        const pDiff = prioMap[b.priority] - prioMap[a.priority];
        if (pDiff !== 0) return pDiff;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      })[0]
    : null;

  // Group tasks by risk level
  const highRiskTasks = activeTasks.filter(t => t.riskLevel === "high");
  const mediumRiskTasks = activeTasks.filter(t => t.riskLevel === "medium");
  const lowRiskTasks = activeTasks.filter(t => t.riskLevel === "low");

  // Get active streak
  const streak = profile.streakCount ?? 5;
  const [showProfileHologram, setShowProfileHologram] = useState(false);
  const [showWhyExplain, setShowWhyExplain] = useState(false);

  const getFriendlyDeadlineText = (deadlineStr: string) => {
    const deadlineDate = new Date(deadlineStr);
    const now = new Date();
    const deadlineReset = new Date(deadlineDate.getFullYear(), deadlineDate.getMonth(), deadlineDate.getDate());
    const nowReset = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffTime = deadlineReset.getTime() - nowReset.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Due Today";
    if (diffDays === 1) return "Due Tomorrow";
    if (diffDays === -1) return "Overdue by 1 day";
    if (diffDays < -1) return `Overdue by ${Math.abs(diffDays)} days`;
    if (diffDays <= 7) return `Due in ${diffDays} days`;
    return `Due on ${deadlineDate.toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}`;
  };

  const getHeroGreeting = (name: string, activeMissionsCount: number) => {
    if (tasks.length > 0 && activeMissionsCount === 0) {
      return {
        title: `🎉 Amazing work, ${name}!`,
        body: "You completed all your missions today. Enjoy the rest of your day!"
      };
    }
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return { title: `Good Morning, ${name}! ☀️`, body: "Let's make today productive." };
    } else if (hour >= 12 && hour < 17) {
      return { title: `Good Afternoon, ${name}! 👋`, body: "You're making good progress. Let's finish your next mission together." };
    } else if (hour >= 17 && hour < 22) {
      return { title: `Good Evening, ${name}! 🌙`, body: "You're almost done for today. Let's complete one more mission." };
    } else {
      return { title: `Hi ${name}! 👋`, body: "Working late? Let's check what needs your focus." };
    }
  };

  // AI Rescue Plan States
  const [rescuePlanAccepted, setRescuePlanAccepted] = useState(false);
  const [rescuePlanSuccessRate, setRescuePlanSuccessRate] = useState(89);
  const [isRegeneratingRescue, setIsRegeneratingRescue] = useState(false);
  const [rescuePlanStep, setRescuePlanStep] = useState(0);

  // AI Task Milestones / Division States
  const [milestones, setMilestones] = useState<Record<string, { id: string; label: string; completed: boolean }[]>>({});
  const [expandedMilestonesTaskId, setExpandedMilestonesTaskId] = useState<string | null>(null);
  const [isDividingTask, setIsDividingTask] = useState<Record<string, boolean>>({});

  const handleBreakIntoMilestones = (taskId: string, taskTitle: string) => {
    if (milestones[taskId]) {
      setExpandedMilestonesTaskId(expandedMilestonesTaskId === taskId ? null : taskId);
      return;
    }

    setIsDividingTask(prev => ({ ...prev, [taskId]: true }));
    setTimeout(() => {
      // Define specialized milestones based on task keywords, or generic steps
      const titleLower = taskTitle.toLowerCase();
      let customMilestones = [
        { id: "1", label: "📋 Phase 1: Planning & Requirements", completed: false },
        { id: "2", label: "⚙️ Phase 2: Core Development & Implementation", completed: false },
        { id: "3", label: "🧪 Phase 3: Comprehensive Testing & Verification", completed: false },
        { id: "4", label: "🚀 Phase 4: Final Refinement & Production Check", completed: false }
      ];

      if (titleLower.includes("resume") || titleLower.includes("cv") || titleLower.includes("portfolio")) {
        customMilestones = [
          { id: "r1", label: "🔍 Research target roles & key requirements", completed: false },
          { id: "r2", label: "✍️ Draft executive summary & contact details", completed: false },
          { id: "r3", label: "💻 Outline work experience with action verbs & metrics", completed: false },
          { id: "r4", label: "✨ Format layout with consistent spacing & clean fonts", completed: false },
          { id: "r5", label: "👀 Thorough proofread & export to PDF format", completed: false }
        ];
      } else if (titleLower.includes("exam") || titleLower.includes("study") || titleLower.includes("test") || titleLower.includes("preparation")) {
        customMilestones = [
          { id: "e1", label: "📚 Gather all lecture notes, syllabus, and slides", completed: false },
          { id: "e2", label: "📝 Summarize core theories & high-yield concepts", completed: false },
          { id: "e3", label: "🧠 Solve 3 sample practice papers & review errors", completed: false },
          { id: "e4", label: "☕ Take structured breaks & review flashcards", completed: false },
          { id: "e5", label: "🧘 Final quick formulas cheat-sheet review", completed: false }
        ];
      } else if (titleLower.includes("design") || titleLower.includes("figma") || titleLower.includes("ui") || titleLower.includes("ux")) {
        customMilestones = [
          { id: "d1", label: "🎨 Competitor UI research & moodboarding", completed: false },
          { id: "d2", label: "✏️ Low-fidelity paper layout sketches", completed: false },
          { id: "d3", label: "📐 Create high-fidelity responsive wireframes in Figma", completed: false },
          { id: "d4", label: "✨ Establish type hierarchy, colors, & visual styles", completed: false },
          { id: "d5", label: "🔄 Connect frames to build interactive clickable prototype", completed: false }
        ];
      } else if (titleLower.includes("project") || titleLower.includes("code") || titleLower.includes("app") || titleLower.includes("software")) {
        customMilestones = [
          { id: "p1", label: "🔍 Research APIs, framework setup, & package config", completed: false },
          { id: "p2", label: "📐 Design database schema & frontend layouts", completed: false },
          { id: "p3", label: "💻 Code primary endpoints & component controllers", completed: false },
          { id: "p4", label: "🧪 Verify and test for performance or UX errors", completed: false },
          { id: "p5", label: "📝 Draft setup documentation & readme logs", completed: false },
          { id: "p6", label: "🚀 Final deployment review & live publish checklist", completed: false }
        ];
      }

      setMilestones(prev => ({ ...prev, [taskId]: customMilestones }));
      setIsDividingTask(prev => ({ ...prev, [taskId]: false }));
      setExpandedMilestonesTaskId(taskId);
    }, 1200);
  };

  const handleToggleMilestone = (taskId: string, milestoneId: string) => {
    setMilestones(prev => {
      const current = prev[taskId] || [];
      const updated = current.map(m => m.id === milestoneId ? { ...m, completed: !m.completed } : m);
      return { ...prev, [taskId]: updated };
    });
  };

  const handleRegenerateRescuePlan = () => {
    setIsRegeneratingRescue(true);
    setTimeout(() => {
      // Set a random high success rate (e.g. 91% to 98%) to indicate smart adjustment
      const newRate = Math.floor(Math.random() * 8) + 91;
      setRescuePlanSuccessRate(newRate);
      setRescuePlanStep(prev => prev + 1);
      setIsRegeneratingRescue(false);
      setRescuePlanAccepted(false);
    }, 1500);
  };

  const handleAcceptRescuePlan = () => {
    setRescuePlanAccepted(true);
    if (onAddEvent && activeTasks.length > 0) {
      // Create actual rescue calendar slots for active tasks!
      activeTasks.slice(0, 2).forEach((task, idx) => {
        const start = new Date();
        start.setHours(start.getHours() + (idx === 0 ? 3 : 6));
        const end = new Date(start.getTime() + 90 * 60 * 1000); // 90m focus
        
        onAddEvent({
          title: `🛡️ RESCUE: ${task.title}`,
          start: start.toISOString().substring(0, 16),
          end: end.toISOString().substring(0, 16),
          taskId: task.id,
          category: task.category
        });
      });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-[#F8FAFC]">
      
      {/* 1. HERO AI CARD (Absolute top of the Dashboard) */}
      <div className="bg-gradient-to-br from-[#0e111b] via-[#120D1E] to-[#050608] border border-[#6D5EF8]/30 rounded-[28px] p-6 relative overflow-hidden group shadow-xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#6D5EF8]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#22D3EE]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center justify-between gap-4 mb-4 border-b border-white/5 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🦸</span>
            <h3 className="font-display font-black text-lg text-white tracking-tight">
              Hero AI
            </h3>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Clickable Profile Avatar to still trigger hologram */}
            <button 
              type="button"
              onClick={() => setShowProfileHologram(true)}
              className="w-8 h-8 rounded-full overflow-hidden border border-[#6D5EF8]/60 shadow-lg hover:border-[#22D3EE] hover:scale-105 active:scale-95 transition-all cursor-pointer relative shrink-0"
              title="Click to view tactical status hologram"
            >
              <img 
                src={profile.avatar} 
                alt={profile.name} 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
            </button>
            
            {/* Streak Badge */}
            <div className="flex items-center gap-2 bg-[#050608]/50 border border-white/5 px-3 py-1.5 rounded-xl">
              <Flame className="w-4 h-4 text-[#F5B942] fill-[#F5B942]" />
              <span className="text-xs font-mono font-bold text-white">🔥 {streak}-Day Streak</span>
            </div>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-white font-medium leading-relaxed">
              Hi {profile.name}! 👋
            </p>
            <p className="text-sm text-[#94A3B8] leading-relaxed">
              Welcome to <strong>Deadline Hero</strong>. You don't have any missions yet. Let's create your first mission together!
            </p>
            <button
              onClick={() => onOpenMissionModal(null, null)}
              className="bg-[#6D5EF8] hover:bg-[#6D5EF8]/90 active:scale-95 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border border-white/10 flex items-center gap-1.5 shadow-lg shadow-[#6D5EF8]/20"
            >
              ➕ Create My First Mission
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <div className="text-sm font-medium text-[#94A3B8] leading-relaxed">
                {(() => {
                  const greetingObj = getHeroGreeting(profile.name, activeTasks.length);
                  return (
                    <>
                      <strong className="text-white text-base block mb-1">{greetingObj.title}</strong>
                      <span>{greetingObj.body || "I looked at your missions and here's what I found today."}</span>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Quick Summary Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#050608]/40 border border-white/5 rounded-2xl p-4">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">📌</span>
                <div>
                  <span className="text-[10px] text-[#94A3B8] font-bold block uppercase leading-none font-mono">Missions</span>
                  <span className="text-xs font-extrabold text-white font-mono mt-1 block">{tasks.length} logged</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-lg">⚠️</span>
                <div>
                  <span className="text-[10px] text-[#94A3B8] font-bold block uppercase leading-none font-mono">Attention</span>
                  <span className="text-xs font-extrabold text-[#F5B942] font-mono mt-1 block">
                    {activeTasks.filter(t => t.priority === "high" || calculateMissionRisk(t) === "high").length} items
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-lg">🔥</span>
                <div>
                  <span className="text-[10px] text-[#94A3B8] font-bold block uppercase leading-none font-mono">High Priority</span>
                  <span className="text-xs font-extrabold text-red-400 font-mono mt-1 block">
                    {activeTasks.filter(t => t.priority === "high").length} urgent
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-lg">💚</span>
                <div>
                  <span className="text-[10px] text-[#94A3B8] font-bold block uppercase leading-none font-mono">Health</span>
                  <span className="text-xs font-extrabold text-emerald-400 font-mono mt-1 block">{healthScore}%</span>
                </div>
              </div>
            </div>

            {/* Today's Best Move */}
            {heroMission && (
              <div className="bg-[#050608]/50 border border-[#6D5EF8]/25 rounded-2xl p-4.5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono font-bold text-[#22D3EE] uppercase tracking-wider block">Today's Best Move</span>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#22D3EE] animate-pulse" />
                      📄 {heroMission.title}
                    </h4>
                  </div>
                  
                  {/* Why This? button */}
                  <button
                    onClick={() => setShowWhyExplain(!showWhyExplain)}
                    className="bg-white/5 hover:bg-white/10 text-[#22D3EE] px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border border-[#22D3EE]/20 hover:border-[#22D3EE]/40 transition-all cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <span>❓ Why this?</span>
                  </button>
                </div>

                {showWhyExplain && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-[#050608] border border-white/5 rounded-xl p-3.5 space-y-2 text-xs text-[#CBD5E1] leading-relaxed"
                  >
                    <p className="font-bold text-[#22D3EE]">Why I Suggested This:</p>
                    <p className="mb-1">I recommended <strong>{heroMission.title}</strong> because:</p>
                    <ul className="space-y-1 pl-1">
                      <li className="flex items-start gap-2">
                        <span>✅</span> 
                        <span>It's {getFriendlyDeadlineText(heroMission.deadline).toLowerCase()}.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>✅</span> 
                        <span>It's estimated to take {heroMission.estTime >= 60 ? `${(heroMission.estTime / 60).toFixed(1)} hours` : `${heroMission.estTime} minutes`}.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>✅</span> 
                        <span>Completing it today makes the rest of your week much easier.</span>
                      </li>
                    </ul>
                  </motion.div>
                )}
              </div>
            )}

            {/* Show what Hero AI has already done */}
            <div className="bg-[#050608]/20 border border-white/5 rounded-2xl p-4 space-y-2.5">
              <span className="text-[10px] font-mono text-[#94A3B8]/80 flex items-center gap-1.5 uppercase font-bold tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ✨ Hero AI Checked Your Day
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium text-[#94A3B8]">
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-400">✔</span> Checked all your missions ({tasks.length})
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-400">✔</span> Found highest priority mission
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-400">✔</span> Checked for deadline risks
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-400">✔</span> Created a Rescue Plan
                </div>
              </div>
            </div>

            {/* Buttons Row */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              <button
                onClick={onOpenRescueModal}
                className="bg-[#6D5EF8] hover:bg-[#6D5EF8]/90 active:scale-95 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border border-white/10 flex items-center gap-1.5 shadow-lg shadow-[#6D5EF8]/20"
              >
                <span>🟣 View Rescue Plan</span>
              </button>
              
              <button
                onClick={() => onNavigateToPage("hero-ai")}
                className="bg-white/5 hover:bg-white/10 active:scale-95 text-[#F8FAFC] px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border border-white/10 flex items-center gap-1.5"
              >
                <span>⚪ Ask Hero</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. START HERE CARD (Always right below Hero AI card) */}
      {heroMission && (
        <div className="bg-[#0e111b] border border-emerald-500/10 hover:border-emerald-500/30 rounded-[28px] p-6 relative overflow-hidden group shadow-lg transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎯</span>
              <h3 className="font-display font-black text-lg text-white tracking-tight">
                Start Here
              </h3>
            </div>
            
            {/* Risk badge */}
            {(() => {
              const r = calculateMissionRisk(heroMission);
              if (r === "high") {
                return <span className="text-[10px] font-bold text-red-400 font-mono flex items-center gap-1 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full">🔴 High Risk</span>;
              }
              if (r === "medium") {
                return <span className="text-[10px] font-bold text-[#F5B942] font-mono flex items-center gap-1 bg-[#F5B942]/10 border border-[#F5B942]/20 px-2.5 py-1 rounded-full">🟡 Medium Risk</span>;
              }
              return <span className="text-[10px] font-bold text-emerald-400 font-mono flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">🟢 Low Risk</span>;
            })()}
          </div>

          <div className="my-4 space-y-2">
            <h4 className="font-display font-bold text-xl text-white group-hover:text-[#22D3EE] transition-colors leading-snug">
              {heroMission.title}
            </h4>
            <p className="text-xs text-[#94A3B8] leading-relaxed line-clamp-2">
              {heroMission.description || "The recommended next milestone to build progress and maintain schedule momentum."}
            </p>
            
            {/* Metadata tags */}
            <div className="flex flex-wrap gap-2.5 pt-1">
              <span className="text-[10px] bg-[#050608]/50 border border-white/5 px-3 py-1 rounded-lg text-[#F5B942] font-mono font-bold flex items-center gap-1">
                📅 {getFriendlyDeadlineText(heroMission.deadline)}
              </span>
              <span className="text-[10px] bg-[#050608]/50 border border-white/5 px-3 py-1 rounded-lg text-[#22D3EE] font-mono font-bold flex items-center gap-1">
                ⏳ {heroMission.estTime >= 60 ? `About ${Math.round(heroMission.estTime / 60)} Hours` : `${heroMission.estTime} Minutes`}
              </span>
            </div>
          </div>

          <p className="text-xs text-[#CBD5E1] font-medium mt-3 mb-4">
            I think this is the best place to start today. Let's make it happen!
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                onSelectHeroMission(heroMission);
                onNavigateToPage("focus");
              }}
              className="bg-emerald-500 hover:bg-emerald-500/90 active:scale-95 text-black px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
            >
              <span>▶ Start Mission</span>
            </button>
            <button
              onClick={onOpenRescueModal}
              className="bg-white/5 hover:bg-white/10 active:scale-95 text-[#F8FAFC] px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border border-white/10 flex items-center gap-1.5"
            >
              <span>📋 View Rescue Plan</span>
            </button>
          </div>
        </div>
      )}

      {/* PROFILE STATUS HOLOGRAM */}
      <AnimatePresence>
        {showProfileHologram && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="w-full max-w-md bg-[#120D1E] border border-purple-500/30 rounded-[32px] p-6 relative shadow-2xl overflow-hidden text-center"
            >
              {/* Futuristic scanlines and lighting */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#6D5EF8] via-[#22D3EE] to-[#EC4899] animate-pulse" />
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#22D3EE]/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-[#6D5EF8]/10 rounded-full blur-2xl pointer-events-none" />

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowProfileHologram(false)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>

              {/* Hologram Header */}
              <div className="mb-6">
                <span className="text-[9px] font-mono font-bold text-[#22D3EE] uppercase tracking-[0.25em] block mb-1">Tactical Core Status</span>
                <h3 className="font-display font-black text-2xl text-white">Profile Status Hologram</h3>
              </div>

              {/* Profile Avatar and Level Indicator */}
              <div className="relative w-24 h-24 mx-auto mb-5">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#6D5EF8] to-[#22D3EE] animate-spin-slow p-1">
                  <div className="w-full h-full rounded-full bg-[#120D1E]" />
                </div>
                <div className="absolute inset-2 rounded-full overflow-hidden border border-white/10">
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                {/* Level badge */}
                <div className="absolute -bottom-1 right-0 bg-[#6D5EF8] text-white border border-white/10 text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full shadow-lg">
                  LVL 4
                </div>
              </div>

              {/* Status details */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-bold text-white">{profile.name}</h4>
                  <p className="text-xs text-[#22D3EE] font-mono uppercase tracking-wider">{(profile as any).role || "Tactical Time Strategist"}</p>
                </div>

                {/* Level Progress Bar */}
                <div className="bg-[#0e111b] border border-white/5 rounded-2xl p-3.5 space-y-1 text-left">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#94A3B8]">
                    <span>TACTICAL EXPERIENCE</span>
                    <span className="text-[#22D3EE] font-bold">780 / 1000 XP</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#050608] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#6D5EF8] to-[#22D3EE] rounded-full" style={{ width: "78%" }} />
                  </div>
                </div>

                {/* Grid stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#0e111b] border border-white/5 rounded-2xl p-3 text-left">
                    <span className="text-[9px] text-[#94A3B8] font-bold block uppercase font-mono mb-1">Missions Cleared</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-mono font-black text-white">{tasks.filter(t => t.status === "completed").length || 14}</span>
                      <span className="text-[10px] text-emerald-400 font-bold">+2 this week</span>
                    </div>
                  </div>
                  <div className="bg-[#0e111b] border border-white/5 rounded-2xl p-3 text-left">
                    <span className="text-[9px] text-[#94A3B8] font-bold block uppercase font-mono mb-1">Focus Time</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-mono font-black text-white">{(profile as any).totalFocusMins || 480}m</span>
                      <span className="text-[10px] text-[#22D3EE] font-bold">8.0 hrs</span>
                    </div>
                  </div>
                </div>

                {/* Achievements row */}
                <div className="bg-[#0e111b] border border-[#6D5EF8]/15 rounded-2xl p-3 flex items-center gap-3 text-left">
                  <div className="w-9 h-9 rounded-xl bg-[#6D5EF8]/10 border border-[#6D5EF8]/20 flex items-center justify-center text-[#22D3EE] shrink-0">
                    <Award className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[9px] text-[#22D3EE] font-bold uppercase tracking-wider block font-mono">Current Title</span>
                    <span className="text-xs font-bold text-white leading-tight">Master of Deadline Evasion Shield</span>
                  </div>
                </div>
              </div>

              {/* Bottom buttons */}
              <div className="flex gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowProfileHologram(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold transition-all text-[#94A3B8] cursor-pointer"
                >
                  Dismiss Hologram
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileHologram(false);
                    onNavigateToPage("profile");
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#6D5EF8] hover:bg-[#6D5EF8]/90 text-white text-xs font-bold transition-all cursor-pointer border border-white/5 shadow-md shadow-[#6D5EF8]/15"
                >
                  Open Profile Blueprint
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* HERO RESCUE ALERT BANNER */}
      {highRiskTasks.length > 0 && (
        <div className="bg-gradient-to-r from-red-500/10 via-orange-500/5 to-transparent border border-red-500/20 rounded-[24px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden shadow-lg shadow-red-500/5 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
          <div className="flex items-start sm:items-center gap-4 z-10">
            <div className="w-12 h-12 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0 shadow-inner animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[9px] font-mono font-black text-red-400 uppercase tracking-widest block leading-none">HIGH COMPACTION THREAT REGISTERED</span>
              <h4 className="text-sm font-bold text-white mt-1">AI Proactive Shield Plan Available</h4>
              <p className="text-xs text-[#94A3B8] mt-0.5 leading-relaxed">
                We detected {highRiskTasks.length} highly critical approaching deadlines. Click below to formulation a rescue recovery protocol.
              </p>
            </div>
          </div>
          <button 
            onClick={onOpenRescueModal}
            className="bg-red-500 hover:bg-red-500/90 hover:scale-[1.02] active:scale-95 text-white px-6 py-3 rounded-xl text-xs font-black tracking-widest uppercase shadow-lg shadow-red-500/10 transition-all cursor-pointer border border-white/10 shrink-0 z-10"
          >
            Deploy Rescue Shield
          </button>
        </div>
      )}

      {/* 2. Bento Grid Row 1: Health Score (Circular Chart) + Hero's Reasoning */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CIRCULAR PROGRESS CARD (lg:col-span-5) */}
        <div className="lg:col-span-5 bg-[#0e111b] border border-white/5 rounded-[24px] p-6 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#6D5EF8]/5 to-[#22D3EE]/0 pointer-events-none" />
          
          <div className="flex items-center justify-between z-10">
            <h3 className="font-display font-semibold text-base text-[#94A3B8] uppercase tracking-wider">
              Deadline Health Score
            </h3>
            <span className="text-[10px] bg-[#22D3EE]/10 border border-[#22D3EE]/20 text-[#22D3EE] font-mono px-2 py-0.5 rounded-full font-bold uppercase">
              Proactive Safety
            </span>
          </div>

          {/* Large Circular Gauge */}
          <div className="my-8 flex items-center justify-center relative">
            <svg className="w-44 h-44 transform -rotate-90">
              {/* Outer track */}
              <circle 
                cx="88" 
                cy="88" 
                r="74" 
                className="stroke-[#050608]" 
                strokeWidth="11" 
                fill="transparent" 
              />
              {/* Active track with gradient */}
              <circle 
                cx="88" 
                cy="88" 
                r="74" 
                className="stroke-[#6D5EF8] transition-all duration-1000 ease-out" 
                strokeWidth="11" 
                fill="transparent" 
                strokeDasharray={2 * Math.PI * 74}
                strokeDashoffset={((100 - healthScore) / 100) * (2 * Math.PI * 74)}
                strokeLinecap="round"
              />
            </svg>
            
            {/* Center score readout */}
            <div className="absolute flex flex-col items-center text-center px-4">
              {tasks.length === 0 ? (
                <span className="text-sm font-bold text-white leading-normal">No data yet.</span>
              ) : (
                <>
                  <span className="text-4xl font-display font-bold text-white tracking-tight leading-none">
                    {healthScore}%
                  </span>
                  <span className="text-[10px] text-[#22D3EE] uppercase font-mono font-semibold tracking-wider mt-1.5 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Secure state
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="border-t border-white/5 pt-4 z-10">
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              {tasks.length === 0 
                ? "Add your first mission and I'll start tracking your progress."
                : `Based on ${activeTasks.length} active missions. High risk exposure is currently minimized.`
              }
            </p>
          </div>
        </div>

        {/* HERO'S REASONING CARD (lg:col-span-7) */}
        {heroMission ? (
          <div className="lg:col-span-7 bg-[#0e111b] border border-white/5 rounded-[24px] p-6 relative overflow-hidden group shadow-lg shadow-[#6D5EF8]/5 flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#6D5EF8]/5 rounded-full blur-3xl pointer-events-none" />
            
            <div>
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <BrainCircuit className="w-5.5 h-5.5 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono font-bold text-purple-400 block leading-none">Hero Analysis</span>
                    <h3 className="font-display font-bold text-base text-white mt-1">🧠 Hero's Logic</h3>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-[#22D3EE] bg-[#22D3EE]/10 px-2.5 py-1 rounded border border-[#22D3EE]/20 uppercase">
                  Active Audit
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-[10px] font-mono font-bold text-[#94A3B8] uppercase">Recommended Objective</h4>
                  <p className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
                    {heroMission.title}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] font-mono font-bold text-[#94A3B8] uppercase">Prioritization Summary</h4>
                  <p className="text-xs text-[#CBD5E1] leading-relaxed font-sans">
                    {heroMission.priority === 'high' 
                      ? `This mission is due on ${new Date(heroMission.deadline).toLocaleDateString(undefined, {month: 'long', day: 'numeric'})}. It is marked as high priority and is estimated to take ${heroMission.estTime} minutes. Completing it today significantly reduces your schedule compaction risk and maintains a secure Deadline Health state.`
                      : `Although it has a moderate priority, this is your nearest deadline. Completing it now will establish positive execution momentum, clear the runway for larger upcoming missions, and safeguard your current Deadline Health.`
                    }
                  </p>
                </div>

                {/* Decision factors */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  <span className="text-[9px] bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-[#94A3B8] font-mono">
                    ⏰ Nearest: {new Date(heroMission.deadline).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                  </span>
                  <span className="text-[9px] bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-[#94A3B8] font-mono">
                    ⏳ Weight: {heroMission.estTime} mins
                  </span>
                  <span className="text-[9px] bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-lg text-[#22D3EE] font-mono">
                    📈 Health Impact: +{Math.round(180 / Math.max(1, tasks.length))}%
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5">
              <button
                onClick={() => {
                  onSelectHeroMission(heroMission);
                  onNavigateToPage("focus");
                }}
                className="w-full bg-[#6D5EF8]/20 hover:bg-[#6D5EF8] text-white py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border border-[#6D5EF8]/35 hover:border-transparent flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-white" /> Start Prioritized Mission
              </button>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-7 bg-[#0e111b] border border-white/5 rounded-[24px] p-6 flex flex-col justify-center items-center text-center space-y-3 min-h-[300px]">
            <p className="text-sm font-bold text-white">🎉 All caught up!</p>
            <p className="text-xs text-[#94A3B8]">Create a mission and let's get things done!</p>
            <button 
              onClick={() => onOpenMissionModal(null, null)}
              className="bg-[#6D5EF8]/30 hover:bg-[#6D5EF8] text-white px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border border-[#6D5EF8]/40"
            >
              ➕ Create Your First Mission
            </button>
          </div>
        )}

      </div>

      {/* 3. AI Insights Row */}
      <div className="bg-[#0e111b]/60 border border-white/5 rounded-[24px] p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-[#22D3EE]/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-semibold text-base text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#22D3EE]" />
            AI Proactive Insights
          </h3>
          <span className="text-xs font-mono text-[#94A3B8]">Updated Real-Time</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map((ins, index) => {
            const isWarning = ins.type === "warning";
            const isTip = ins.type === "tip";
            
            return (
              <div 
                key={ins.id || index} 
                className="bg-[#0e111b] border border-white/5 rounded-2xl p-4.5 flex flex-col justify-between hover:border-[#6D5EF8]/30 transition-all group"
              >
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isWarning ? "bg-red-500/15 text-red-400" :
                    isTip ? "bg-[#22D3EE]/15 text-[#22D3EE]" :
                    "bg-[#F5B942]/15 text-[#F5B942]"
                  }`}>
                    {isWarning ? <AlertTriangle className="w-4 h-4" /> :
                     isTip ? <Clock className="w-4 h-4" /> :
                     <ShieldCheck className="w-4 h-4" />}
                  </div>
                  <h4 className="text-xs font-display font-bold text-white group-hover:text-[#22D3EE] transition-colors">
                    {ins.title}
                  </h4>
                </div>
                <p className="text-xs text-[#94A3B8] leading-relaxed flex-1">
                  {ins.content}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Statistics + AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Statistics Grid (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-base text-[#94A3B8] uppercase tracking-wider flex items-center gap-2">
              <span>📊 Statistics</span>
            </h3>
            <span className="text-xs text-[#22D3EE] hover:underline cursor-pointer flex items-center gap-1" onClick={() => onNavigateToPage("tasks")}>
              View All <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            
            {/* TOTAL MISSIONS */}
            <div className="bg-[#0e111b] border border-white/5 rounded-2xl p-4.5 flex flex-col justify-between relative group transition-all">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#6D5EF8]/5 rounded-full blur-lg pointer-events-none" />
              <div>
                <span className="text-[9px] bg-[#6D5EF8]/10 border border-[#6D5EF8]/20 text-[#22D3EE] font-mono font-bold px-2 py-0.5 rounded uppercase">
                  Total
                </span>
                <h4 className="text-3xl font-mono font-extrabold text-white mt-4">{tasks.length}</h4>
                <p className="text-[11px] text-[#94A3B8] mt-1 font-medium">Total Missions</p>
              </div>
            </div>

            {/* COMPLETED */}
            <div className="bg-[#0e111b] border border-white/5 rounded-2xl p-4.5 flex flex-col justify-between relative group transition-all">
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-lg pointer-events-none" />
              <div>
                <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-bold px-2 py-0.5 rounded uppercase">
                  Completed
                </span>
                <h4 className="text-3xl font-mono font-extrabold text-white mt-4">
                  {tasks.filter(t => t.status === "completed").length}
                </h4>
                <p className="text-[11px] text-[#94A3B8] mt-1 font-medium">Completed</p>
              </div>
            </div>

            {/* UPCOMING */}
            <div className="bg-[#0e111b] border border-white/5 rounded-2xl p-4.5 flex flex-col justify-between relative group transition-all">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#22D3EE]/5 rounded-full blur-lg pointer-events-none" />
              <div>
                <span className="text-[9px] bg-[#22D3EE]/10 border border-[#22D3EE]/20 text-[#22D3EE] font-mono font-bold px-2 py-0.5 rounded uppercase">
                  Upcoming
                </span>
                <h4 className="text-3xl font-mono font-extrabold text-white mt-4">
                  {tasks.filter(t => t.status !== "completed" && new Date(t.deadline) >= new Date()).length}
                </h4>
                <p className="text-[11px] text-[#94A3B8] mt-1 font-medium">Upcoming</p>
              </div>
            </div>

            {/* OVERDUE */}
            <div className="bg-[#0e111b] border border-white/5 rounded-2xl p-4.5 flex flex-col justify-between relative group transition-all">
              <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 rounded-full blur-lg pointer-events-none" />
              <div>
                <span className="text-[9px] bg-red-500/10 border border-red-500/20 text-red-400 font-mono font-bold px-2 py-0.5 rounded uppercase">
                  Overdue
                </span>
                <h4 className="text-3xl font-mono font-extrabold text-white mt-4">
                  {tasks.filter(t => t.status !== "completed" && new Date(t.deadline) < new Date()).length}
                </h4>
                <p className="text-[11px] text-[#94A3B8] mt-1 font-medium">Overdue</p>
              </div>
            </div>

          </div>
        </div>

        {/* Quick Actions Panel (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="font-display font-semibold text-base text-[#94A3B8] uppercase tracking-wider">
            Quick Actions
          </h3>
          
          <div className="bg-[#0e111b] border border-white/5 rounded-[24px] p-4.5 space-y-2.5">
            <button
              onClick={onAiSync}
              disabled={isAiAnalyzing}
              className="w-full bg-[#050608] hover:bg-[#0e111b] border border-white/5 hover:border-[#6D5EF8]/30 rounded-xl p-3.5 flex items-center justify-between transition-all group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#6D5EF8]/10 flex items-center justify-center text-[#6D5EF8] group-hover:bg-[#6D5EF8] group-hover:text-white transition-all">
                  <RefreshCw className={`w-4 h-4 ${isAiAnalyzing ? "animate-spin" : ""}`} />
                </div>
                <div>
                  <span className="text-xs font-semibold text-white block">Audit Deadlines</span>
                  <span className="text-[10px] text-[#94A3B8]">Audit risk predictive indices</span>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#22D3EE] group-hover:translate-x-0.5 transition-all" />
            </button>

            <button
              onClick={() => onNavigateToPage("focus")}
              className="w-full bg-[#050608] hover:bg-[#0e111b] border border-white/5 hover:border-[#6D5EF8]/30 rounded-xl p-3.5 flex items-center justify-between transition-all group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#22D3EE]/10 flex items-center justify-center text-[#22D3EE] group-hover:bg-[#22D3EE] group-hover:text-black transition-all">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-white block">Focus Sprint</span>
                  <span className="text-[10px] text-[#94A3B8]">Initialize silent pomodoro block</span>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#22D3EE] group-hover:translate-x-0.5 transition-all" />
            </button>

            <button
              onClick={() => onNavigateToPage("calendar")}
              className="w-full bg-[#050608] hover:bg-[#0e111b] border border-white/5 hover:border-[#6D5EF8]/30 rounded-xl p-3.5 flex items-center justify-between transition-all group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#F5B942]/10 flex items-center justify-center text-[#F5B942] group-hover:bg-[#F5B942] group-hover:text-black transition-all">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-white block">Optimize Calendar</span>
                  <span className="text-[10px] text-[#94A3B8]">Solve routine bottleneck scheduling</span>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#22D3EE] group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
