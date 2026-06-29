import React, { useState } from "react";
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  Clock, 
  Calendar, 
  CheckCircle, 
  Play, 
  AlertTriangle, 
  Edit3, 
  Filter,
  Check,
  BrainCircuit,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Task, UserProfile } from "../types";
import { calculateMissionRisk } from "../utils/ai";

interface TasksViewProps {
  tasks: Task[];
  profile: UserProfile;
  onAddTask?: (task: Omit<Task, "id" | "createdAt" | "riskLevel" | "aiRecommendation" | "progress" | "status">) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onNavigateToPage: (page: string) => void;
  onSelectHeroMission: (task: Task) => void;
  onOpenMissionModal: (dateStr?: string | null, taskToEdit?: Task | null) => void;
}

export default function TasksView({
  tasks,
  profile,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onNavigateToPage,
  onSelectHeroMission,
  onOpenMissionModal
}: TasksViewProps) {
  const [filter, setFilter] = useState<"all" | "in_progress" | "completed" | "critical">("all");

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
      // Define specialized milestones based on task keywords
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

  const filteredTasks = tasks.filter((t) => {
    if (filter === "in_progress") return t.status === "in_progress";
    if (filter === "completed") return t.status === "completed";
    if (filter === "critical") return t.priority === "high" && t.status !== "completed";
    return true; // "all"
  });

  const getPriorityColor = (p: string) => {
    if (p === "high") return "text-red-400 bg-red-500/10 border-red-500/20";
    if (p === "medium") return "text-[#F5B942] bg-[#F5B942]/10 border-[#F5B942]/20";
    return "text-[#22D3EE] bg-[#22D3EE]/10 border-[#22D3EE]/20";
  };

  const getRiskColor = (r: string) => {
    if (r === "high") return "bg-red-500 glow-primary";
    if (r === "medium") return "bg-[#F5B942] glow-accent";
    return "bg-[#22D3EE]";
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#F8FAFC]">
      
      {/* Header with Title and Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-black text-3xl tracking-tight text-white">Active Missions</h2>
          <p className="text-sm text-[#94A3B8] mt-1 font-sans">
            One mission at a time. Keep going! Your future self will thank you.
          </p>
        </div>
        
        <button
          onClick={() => onOpenMissionModal(null, null)}
          className="bg-[#6D5EF8] hover:bg-[#6D5EF8]/90 text-white px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border border-white/5 shadow-lg shadow-[#6D5EF8]/20 hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          New Mission
        </button>
      </div>

      {/* Filters and Tabs bar */}
      <div className="flex items-center justify-between border-b border-[#0e111b] pb-3 flex-wrap gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(["all", "in_progress", "completed", "critical"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all capitalize cursor-pointer shrink-0 border border-transparent ${
                filter === tab 
                  ? "bg-[#0e111b] text-white border-white/5 shadow-inner" 
                  : "text-[#94A3B8] hover:text-white"
              }`}
            >
              {tab === "completed" ? "Accomplished" : tab.replace("_", " ")}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2 text-xs text-[#94A3B8] font-mono">
          <Filter className="w-3.5 h-3.5 text-[#6D5EF8]" />
          Tracking {filteredTasks.length} missions
        </div>
      </div>

      {/* Core Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tasks.length === 0 ? (
          <div className="col-span-2 text-center py-16 bg-[#0e111b]/40 border border-dashed border-white/5 rounded-[24px] space-y-4">
            <h4 className="text-lg font-bold text-white">🎉 You're all caught up!</h4>
            <p className="text-sm text-[#22D3EE] font-display font-medium">Welcome to Deadline Hero.</p>
            <p className="text-xs text-[#94A3B8] max-w-md mx-auto leading-relaxed">
              You don't have any missions yet.
              <br />
              Create your first mission and let Hero help you stay ahead of your deadlines.
            </p>
            <button 
              onClick={() => onOpenMissionModal(null, null)}
              className="mt-5 bg-[#6D5EF8] hover:bg-[#6D5EF8]/90 text-white px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border border-white/5 shadow-lg shadow-[#6D5EF8]/20 hover:scale-105 mx-auto"
            >
              ➕ Create Your First Mission
            </button>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="col-span-2 text-center py-16 bg-[#0e111b]/40 border border-dashed border-white/5 rounded-[24px]">
            <p className="text-sm text-[#94A3B8] font-medium">No missions matching the filter criteria found.</p>
            <p className="text-xs text-[#22D3EE] font-mono mt-1">One mission at a time. You've got this!</p>
            <button onClick={() => setFilter("all")} className="text-xs text-[#6D5EF8] font-bold hover:underline mt-4 cursor-pointer">
              Show all missions
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.status === "completed";
            return (
              <div 
                key={task.id}
                className="bg-[#0e111b] border border-white/5 hover:border-[#6D5EF8]/30 rounded-[24px] p-5.5 flex flex-col justify-between transition-all group hover:-translate-y-1 relative"
              >
                {/* Soft blur accent based on priority */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-transparent to-transparent group-hover:from-[#6D5EF8]/5 rounded-full blur-xl pointer-events-none" />
                
                <div>
                  {/* Header: Priority, Category, Status badge */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded border ${getPriorityColor(task.priority)} uppercase tracking-wider`}>
                        {task.priority} Priority
                      </span>
                      <span className="text-[10px] text-[#94A3B8] font-mono capitalize">
                        • {task.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {(() => {
                        const r = calculateMissionRisk(task);
                        if (r === "high") {
                          return <span className="text-[10px] font-bold text-red-400 font-mono flex items-center gap-1 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">🔴 High Risk</span>;
                        }
                        if (r === "medium") {
                          return <span className="text-[10px] font-bold text-[#F5B942] font-mono flex items-center gap-1 bg-[#F5B942]/10 border border-[#F5B942]/20 px-2 py-0.5 rounded-full">🟡 Medium Risk</span>;
                        }
                        return <span className="text-[10px] font-bold text-emerald-400 font-mono flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">🟢 Low Risk</span>;
                      })()}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className={`font-display font-bold text-lg text-white group-hover:text-[#22D3EE] transition-colors leading-snug line-clamp-1 ${isCompleted ? "line-through opacity-50" : ""}`}>
                    {task.title}
                  </h3>
                  <p className="text-xs text-[#94A3B8] mt-1.5 line-clamp-2 leading-relaxed">
                    {task.description || "No tactical specifications provided. One mission at a time."}
                  </p>

                  {/* Slider for Progress */}
                  <div className="mt-5 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-[#94A3B8] font-bold uppercase tracking-wider">Mission Progress</span>
                      <span className="text-[#22D3EE] font-extrabold">{task.progress}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input 
                        type="range" 
                        min={0}
                        max={100}
                        value={task.progress}
                        onChange={(e) => {
                          const prog = Number(e.target.value);
                          onUpdateTask(task.id, { 
                            progress: prog,
                            status: prog === 100 ? "completed" : prog > 0 ? "in_progress" : "todo"
                          });
                        }}
                        className="w-full accent-[#22D3EE] cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Core metadata: Est Time & Deadline */}
                  <div className="grid grid-cols-2 gap-3 mt-5 border-t border-b border-white/5 py-3 text-xs">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#94A3B8]" />
                      <div>
                        <span className="text-[9px] text-[#94A3B8] font-bold block uppercase leading-none font-mono">Est Focus Block</span>
                        <span className="font-mono text-white font-bold leading-normal">
                          {task.estTime >= 60 ? `${Math.floor(task.estTime / 60)}h ${task.estTime % 60 > 0 ? `${task.estTime % 60}m` : ""}` : `${task.estTime}m`}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#94A3B8]" />
                      <div>
                        <span className="text-[9px] text-[#94A3B8] font-bold block uppercase leading-none font-mono">Target Deadline</span>
                        <span className="font-mono text-[#F5B942] font-bold leading-normal truncate block max-w-[120px]">
                          {new Date(task.deadline).toLocaleDateString(undefined, {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}
                        </span>
                      </div>
                    </div>
                  </div>

                   {/* Glowing AI Recommendation Box */}
                  {task.aiRecommendation && (
                    <div className="mt-4 p-3 rounded-xl bg-[#6D5EF8]/5 border border-[#6D5EF8]/15 flex items-start gap-2.5 relative">
                      <Sparkles className="w-4 h-4 text-[#22D3EE] shrink-0 mt-0.5 animate-pulse" />
                      <div>
                        <span className="text-[9px] font-bold text-[#22D3EE] uppercase tracking-widest block font-mono">Hero Tactical Suggestion</span>
                        <p className="text-[11px] text-[#94A3B8] leading-relaxed mt-0.5 font-sans font-medium">
                          {task.aiRecommendation}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* AI MILESTONES / BREAK DOWN ACTION */}
                  {!isCompleted && (
                    <div className="space-y-2">
                      <button
                        onClick={() => handleBreakIntoMilestones(task.id, task.title)}
                        disabled={isDividingTask[task.id]}
                        className="w-full mt-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/15 hover:border-purple-500/35 rounded-xl py-2 px-3 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isDividingTask[task.id] ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Planning milestones...
                          </>
                        ) : (
                          <>
                            <BrainCircuit className="w-3.5 h-3.5" /> 🧠 Break into milestones
                          </>
                        )}
                      </button>

                      <AnimatePresence>
                        {expandedMilestonesTaskId === task.id && milestones[task.id] && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 space-y-2 overflow-hidden bg-[#050608]/40 border border-white/5 rounded-2xl p-3"
                          >
                            <span className="text-[9px] text-[#94A3B8] font-bold uppercase tracking-wider block font-mono">Tactical Steps</span>
                            <div className="space-y-1.5 mt-1.5">
                              {milestones[task.id].map(item => (
                                <div 
                                  key={item.id} 
                                  onClick={() => {
                                    handleToggleMilestone(task.id, item.id);
                                    const currentList = milestones[task.id];
                                    const updatedList = currentList.map(m => m.id === item.id ? { ...m, completed: !m.completed } : m);
                                    const doneCount = updatedList.filter(m => m.completed).length;
                                    const newProgress = Math.round((doneCount / updatedList.length) * 100);
                                    onUpdateTask(task.id, { 
                                      progress: newProgress,
                                      status: newProgress === 100 ? "completed" : newProgress > 0 ? "in_progress" : "todo"
                                    });
                                  }}
                                  className="flex items-center gap-2.5 cursor-pointer p-1 rounded-lg transition-all hover:bg-white/5 group"
                                >
                                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0 ${
                                    item.completed ? "bg-[#22D3EE] border-transparent text-black" : "border-white/20 group-hover:border-purple-400"
                                  }`}>
                                    {item.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                  </div>
                                  <span className={`text-[11px] font-sans transition-colors ${
                                    item.completed ? "text-[#94A3B8] line-through" : "text-[#E2E8F0] group-hover:text-white"
                                  }`}>
                                    {item.label}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                {/* Action Rows */}
                <div className="flex items-center justify-between gap-4 mt-5 pt-3 border-t border-white/5">
                  <div className="flex items-center gap-1.5">
                    {/* Mark Complete */}
                    {!isCompleted ? (
                      <button
                        onClick={() => {
                          onUpdateTask(task.id, { progress: 100, status: "completed" });
                        }}
                        className="p-2 bg-[#22D3EE]/10 hover:bg-[#22D3EE]/25 border border-[#22D3EE]/25 rounded-lg text-[#22D3EE] transition-all cursor-pointer"
                        title="🎉 Mission Accomplished!"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="text-[9px] text-[#22D3EE] bg-[#22D3EE]/10 px-2.5 py-1.5 rounded-lg font-bold uppercase tracking-wider border border-[#22D3EE]/25 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Accomplished!
                      </span>
                    )}

                    {/* Launch Focus */}
                    <button
                      onClick={() => {
                        onSelectHeroMission(task);
                        onNavigateToPage("focus");
                      }}
                      disabled={isCompleted}
                      className="p-2 bg-[#6D5EF8]/10 hover:bg-[#6D5EF8]/25 border border-[#6D5EF8]/25 rounded-lg text-[#22D3EE] transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Initialize focus loop"
                    >
                      <Play className="w-4 h-4" />
                    </button>

                    {/* Edit Mission */}
                    <button
                      onClick={() => onOpenMissionModal(null, task)}
                      className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-[#94A3B8] hover:text-white transition-all cursor-pointer border border-transparent"
                      title="Refine Blueprint"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Remove Mission */}
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-[#94A3B8] hover:text-red-400 transition-all cursor-pointer border border-transparent"
                    title="Remove Mission"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
