import React, { useState, useEffect } from "react";
import { 
  Calendar as CalIcon, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Plus,
  Trash2,
  Edit3,
  Check,
  CalendarDays,
  Zap,
  CheckSquare
} from "lucide-react";
import { Task, CalendarEvent, UserProfile } from "../types";
import { optimizeScheduleWithAi, OptimizedBlock } from "../utils/ai";

interface CalendarViewProps {
  tasks: Task[];
  events: CalendarEvent[];
  profile: UserProfile;
  onAddTask: (task: Omit<Task, "id" | "createdAt" | "riskLevel" | "aiRecommendation">) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onOpenMissionModal: (dateStr?: string | null, taskToEdit?: Task | null) => void;
  activeTheme?: string;
}

export default function CalendarView({
  tasks,
  events,
  profile,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onOpenMissionModal,
  activeTheme = "dark"
}: CalendarViewProps) {
  // Calendar View Month/Week state
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 27)); // June 2026 (matching local time metadata!)
  const [view, setView] = useState<"month" | "week" | "agenda">("month");
  
  // Interactive Day Selection
  const [selectedDateObject, setSelectedDateObject] = useState<Date>(new Date(2026, 5, 27));
  
  // AI schedule suggestions
  const [aiSuggestions, setAiSuggestions] = useState<OptimizedBlock[]>([]);
  const [isCompiling, setIsCompiling] = useState(false);

  // Encouragement list to match human-friendly language
  const encouragements = [
    "You're making great progress.",
    "One mission at a time.",
    "You've got this!",
    "Keep going!",
    "Your future self will thank you.",
    "Nice work! You're one step closer to your goal."
  ];

  const [randomQuote, setRandomQuote] = useState(encouragements[0]);

  useEffect(() => {
    // Cycle quote on selected date change
    setRandomQuote(encouragements[Math.floor(Math.random() * encouragements.length)]);
  }, [selectedDateObject]);

  // Generate AI schedule recommendations
  const fetchOptimizedSchedule = async () => {
    setIsCompiling(true);
    const result = await optimizeScheduleWithAi(tasks, events);
    setAiSuggestions(result);
    setIsCompiling(false);
  };

  useEffect(() => {
    fetchOptimizedSchedule();
  }, [tasks]);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayIndex = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  // Helper: Format Date to YYYY-MM-DD
  const getFormattedDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // Helper: Find tasks/events due on specific date (YYYY-MM-DD)
  const getItemsForDay = (dayNum: number) => {
    const activeDayStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    const dayTasks = tasks.filter(t => t.deadline.startsWith(activeDayStr));
    const dayEvents = events.filter(e => e.start.startsWith(activeDayStr));
    return { dayTasks, dayEvents };
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Selected Day's Missions List
  const selectedDateStr = getFormattedDateString(selectedDateObject);
  const selectedDayMissions = tasks.filter(t => t.deadline.startsWith(selectedDateStr));

  // Determine today's date elements
  const today = new Date();
  const todayStr = getFormattedDateString(today);

  // Check if a date has overdue incomplete missions
  const isDateOverdue = (dayNum: number) => {
    const { dayTasks } = getItemsForDay(dayNum);
    const now = new Date();
    return dayTasks.some(t => {
      const isPast = new Date(t.deadline) < now;
      return isPast && t.status !== "completed";
    });
  };

  // Highlight classes based on active state, selection state, risk, today
  const getDayClass = (dayNum: number) => {
    const activeDayStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    const isSelected = selectedDateStr === activeDayStr;
    const isToday = todayStr === activeDayStr;
    const { dayTasks } = getItemsForDay(dayNum);
    const incompleteTasks = dayTasks.filter(t => t.status !== "completed");
    
    let base = "border rounded-2xl p-2.5 flex flex-col justify-between min-h-[85px] transition-all relative overflow-hidden group cursor-pointer text-left ";

    if (isSelected) {
      base += "border-[#6D5EF8] bg-[#6D5EF8]/10 text-white shadow-lg ring-1 ring-[#6D5EF8]/30 ";
    } else if (isToday) {
      base += "border-[#22D3EE] bg-[#22D3EE]/5 text-white ring-1 ring-[#22D3EE]/30 shadow-[#22D3EE]/10 shadow-md ";
    } else {
      // Risk heatmap coloring based on incomplete critical tasks
      const criticalCount = incompleteTasks.filter(t => t.priority === "high").length;
      if (criticalCount >= 2) {
        base += "bg-red-500/10 border-red-500/20 text-red-300 hover:border-red-500/45 ";
      } else if (criticalCount === 1) {
        base += "bg-[#F5B942]/5 border-[#F5B942]/10 text-[#F5B942] hover:border-[#F5B942]/30 ";
      } else if (dayTasks.length > 0) {
        base += "bg-[#181C25] border-white/5 text-white hover:border-[#6D5EF8]/30 ";
      } else {
        base += "bg-[#050608] border-white/5 hover:border-[#6D5EF8]/30 text-[#94A3B8] hover:text-white ";
      }
    }

    return base;
  };

  const isLight = activeTheme === "light";
  const bgCardClass = isLight ? "bg-white border-slate-200" : "bg-[#0e111b] border-white/5";
  const subBgCardClass = isLight ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-[#050608] border-white/5";

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-fade-in text-[#F8FAFC]">
      
      {/* LEFT COLUMN: Interactive Month/Week Calendar Grid (xl:col-span-8) */}
      <div className={`xl:col-span-8 space-y-5 flex flex-col h-full rounded-[24px] p-6 border ${bgCardClass}`}>
        
        {/* Calendar Nav Row */}
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-white/5 pb-4.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6D5EF8]/10 flex items-center justify-center">
              <CalIcon className="w-5 h-5 text-[#22D3EE]" />
            </div>
            <div>
              <h3 className="font-display font-black text-lg text-white">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <p className="text-[10px] text-[#94A3B8] font-mono uppercase tracking-wider">Your Daily Planner</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* View selectors */}
            <div className="flex bg-[#050608]/40 border border-white/5 p-1 rounded-xl">
              {(["month", "week", "agenda"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    view === v ? "bg-[#6D5EF8] text-white" : "text-[#94A3B8] hover:text-white"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            {/* Prev/Next Navigation */}
            <div className="flex items-center gap-1.5">
              <button 
                onClick={prevMonth} 
                className="p-2 bg-[#050608] hover:bg-[#181C25] border border-white/5 rounded-xl text-[#94A3B8] hover:text-white transition-all cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={nextMonth} 
                className="p-2 bg-[#050608] hover:bg-[#181C25] border border-white/5 rounded-xl text-[#94A3B8] hover:text-white transition-all cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 1. MONTH VIEW */}
        {view === "month" && (
          <div className="flex-1 flex flex-col justify-between">
            {/* Weekday Titles */}
            <div className="grid grid-cols-7 text-center text-[9px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2 font-mono">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Day slots grid */}
            <div className="grid grid-cols-7 gap-2.5 flex-1 min-h-[380px]">
              {/* Empty offsets */}
              {Array.from({ length: firstDayIndex }).map((_, idx) => (
                <div key={`empty-${idx}`} className="bg-[#0F1117]/10 border border-transparent rounded-2xl p-2 opacity-20" />
              ))}

              {/* Real Days */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const { dayTasks, dayEvents } = getItemsForDay(dayNum);
                const isOverdue = isDateOverdue(dayNum);
                
                // Group tasks by priority for dot rendering
                const highPrioCount = dayTasks.filter(t => t.priority === "high" && t.status !== "completed").length;
                const medPrioCount = dayTasks.filter(t => t.priority === "medium" && t.status !== "completed").length;
                const lowPrioCount = dayTasks.filter(t => t.priority === "low" && t.status !== "completed").length;
                const completedCount = dayTasks.filter(t => t.status === "completed").length;

                return (
                  <button
                    key={`day-${dayNum}`}
                    type="button"
                    onClick={() => setSelectedDateObject(new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum))}
                    className={getDayClass(dayNum)}
                  >
                    {/* Top row of day slot: Overdue triangle, and day number */}
                    <div className="flex items-center justify-between w-full">
                      {isOverdue ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-bounce" title="Critical Overdue Mission!" />
                      ) : (
                        <div />
                      )}
                      <span className="text-xs font-mono font-black text-white/40 group-hover:text-white/80">
                        {dayNum}
                      </span>
                    </div>

                    {/* Micro indicators / list inside slot */}
                    <div className="w-full space-y-1 mt-1.5 z-10">
                      {/* Dots & Badges showing missions */}
                      <div className="flex flex-wrap gap-1 items-center">
                        {/* High Prio Dots */}
                        {Array.from({ length: highPrioCount }).map((_, i) => (
                          <span key={`h-${i}`} className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="High Priority" />
                        ))}
                        {/* Medium Prio Dots */}
                        {Array.from({ length: medPrioCount }).map((_, i) => (
                          <span key={`m-${i}`} className="w-1.5 h-1.5 rounded-full bg-[#F5B942]" title="Medium Priority" />
                        ))}
                        {/* Low Prio Dots */}
                        {Array.from({ length: lowPrioCount }).map((_, i) => (
                          <span key={`l-${i}`} className="w-1.5 h-1.5 rounded-full bg-[#22D3EE]" title="Low Priority" />
                        ))}
                        {/* Completed Check icon */}
                        {completedCount > 0 && (
                          <Check className="w-3 h-3 text-[#22D3EE]" title={`${completedCount} Accomplished!`} />
                        )}
                      </div>

                      {/* Mini textual titles to keep the space structured */}
                      <div className="hidden md:block space-y-0.5">
                        {dayTasks.slice(0, 2).map((t) => (
                          <div 
                            key={t.id} 
                            className={`text-[8px] font-mono px-1 py-0.2 rounded truncate leading-none ${
                              t.status === "completed" 
                                ? "bg-emerald-500/10 text-[#22D3EE] border border-emerald-500/10 line-through opacity-50" 
                                : t.priority === "high"
                                ? "bg-red-500/10 text-red-400 border border-red-500/15"
                                : "bg-[#050608] text-white border border-white/5"
                            }`}
                          >
                            {t.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. WEEK VIEW (Interactive lists) */}
        {view === "week" && (
          <div className="flex-1 space-y-4">
            <p className="text-xs text-[#94A3B8] font-semibold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#22D3EE]" /> Active Weekly Mission Distribution
            </p>
            <div className="grid grid-cols-7 gap-3">
              {[
                { day: "Sun", dateOffset: -3, label: "Sunday" },
                { day: "Mon", dateOffset: -2, label: "Monday" },
                { day: "Tue", dateOffset: -1, label: "Tuesday" },
                { day: "Wed", dateOffset: 0, label: "Wednesday" },
                { day: "Thu", dateOffset: 1, label: "Thursday" },
                { day: "Fri", dateOffset: 2, label: "Friday" },
                { day: "Sat", dateOffset: 3, label: "Saturday" },
              ].map((w, index) => {
                const targetDay = new Date(selectedDateObject);
                targetDay.setDate(selectedDateObject.getDate() + w.dateOffset);
                const dStr = getFormattedDateString(targetDay);
                const dayMissions = tasks.filter(t => t.deadline.startsWith(dStr));
                const incompleteCount = dayMissions.filter(t => t.status !== "completed").length;
                const isSelected = getFormattedDateString(selectedDateObject) === dStr;

                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDateObject(targetDay)}
                    className={`border rounded-2xl p-4 flex flex-col justify-between items-center text-center min-h-[150px] transition-all cursor-pointer ${
                      isSelected 
                        ? "bg-[#6D5EF8]/15 border-[#6D5EF8]" 
                        : "bg-[#050608] border-white/5 hover:border-white/15"
                    }`}
                  >
                    <span className="text-[10px] font-mono font-bold text-[#94A3B8] block">{w.day} {targetDay.getDate()}</span>
                    <span className="text-3xl font-display font-black text-white block mt-2">{dayMissions.length}</span>
                    <span className="text-[8px] font-mono uppercase tracking-wider text-[#94A3B8] mt-1">
                      {incompleteCount} Pending
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. AGENDA VIEW */}
        {view === "agenda" && (
          <div className="flex-1 overflow-y-auto space-y-3 max-h-[380px] pr-2 scrollbar">
            {tasks.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-[20px] border border-dashed border-purple-500/25 bg-[#050608]/30 space-y-3.5">
                <p className="text-xs text-[#94A3B8] font-medium leading-relaxed">📅 No missions scheduled yet. Create your first mission to see it here.</p>
                <button
                  onClick={() => onOpenMissionModal(null, null)}
                  className="bg-[#6D5EF8] hover:bg-[#6D5EF8]/90 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  ➕ Add Mission
                </button>
              </div>
            ) : (
              [...tasks]
                .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
                .map((t) => (
                  <div 
                    key={t.id} 
                    onClick={() => {
                      const d = new Date(t.deadline);
                      if (!isNaN(d.getTime())) setSelectedDateObject(d);
                    }}
                    className={`bg-[#050608] border rounded-xl p-4 flex items-center justify-between gap-4 cursor-pointer hover:border-[#6D5EF8]/30 transition-all ${
                      t.deadline.startsWith(selectedDateStr) ? "border-[#6D5EF8]/60 bg-[#6D5EF8]/5" : "border-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-10 rounded-full ${
                        t.status === "completed" ? "bg-emerald-500" : t.priority === "high" ? "bg-red-500" : "bg-[#6D5EF8]"
                      }`} />
                      <div>
                        <h4 className={`text-xs font-bold text-white ${t.status === "completed" ? "line-through opacity-60" : ""}`}>{t.title}</h4>
                        <p className="text-[10px] text-[#94A3B8] mt-0.5 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-[#22D3EE]" /> 
                          {new Date(t.deadline).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} at {new Date(t.deadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`text-[8px] px-2 py-0.5 rounded font-bold uppercase ${
                        t.priority === "high" ? "bg-red-500/15 text-red-400" : "bg-[#22D3EE]/10 text-[#22D3EE]"
                      }`}>
                        {t.priority}
                      </span>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

      </div>

      {/* RIGHT COLUMN: Selected Day's Operations Hub & AI Schedule Optimizer (xl:col-span-4) */}
      <div className="xl:col-span-4 space-y-6 flex flex-col justify-between h-full">
        
        {/* PERSONAL DAILY OVERVIEW CARD */}
        <div className={`border rounded-[24px] p-5.5 space-y-3 ${bgCardClass}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6D5EF8] to-[#22D3EE] flex items-center justify-center shadow-md">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h4 className="font-display font-black text-sm text-white">
                {(() => {
                  const hour = new Date().getHours();
                  if (hour >= 5 && hour < 12) return `Good Morning, ${profile.name}!`;
                  if (hour >= 12 && hour < 17) return `Good Afternoon, ${profile.name}!`;
                  if (hour >= 17 && hour < 21) return `Good Evening, ${profile.name}!`;
                  return `Hi ${profile.name}!`;
                })()}
              </h4>
              <p className="text-[10px] font-mono text-[#22D3EE] uppercase tracking-wider">Daily Schedule Status</p>
            </div>
          </div>
          
          <div className="space-y-1.5 pt-1.5 border-t border-white/5">
            <div className="text-xs text-[#94A3B8] font-sans">
              You have <span className="text-white font-bold">{selectedDayMissions.length} {selectedDayMissions.length === 1 ? "mission" : "missions"}</span> scheduled today.
            </div>
            {selectedDayMissions.length === 0 ? (
              <div className="text-[11px] text-emerald-400 font-sans font-medium flex items-center gap-1">
                <span>⚡ You have some free time today!</span>
              </div>
            ) : (
              <div className="text-[11px] text-[#22D3EE] font-sans font-medium">
                ⏱️ Keep up your excellent pace!
              </div>
            )}
          </div>
        </div>

        {/* INTERACTIVE HUB: SELECTED DAY MISSIONS */}
        <div className={`border rounded-[24px] p-5.5 space-y-4 flex-1 flex flex-col justify-between ${bgCardClass}`}>
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4.5 h-4.5 text-[#22D3EE]" />
                <div>
                  <h4 className="font-display font-black text-sm text-white">Mission Control</h4>
                  <span className="text-[10px] font-mono text-[#94A3B8] uppercase block">
                    {selectedDateObject.toLocaleDateString(undefined, {month: 'long', day: 'numeric', year: 'numeric'})}
                  </span>
                </div>
              </div>

              {/* New Mission button for this specific date */}
              <button
                onClick={() => onOpenMissionModal(selectedDateStr, null)}
                className="bg-[#6D5EF8] hover:bg-[#6D5EF8]/90 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all border border-white/10"
              >
                <Plus className="w-3.5 h-3.5" />
                New Mission
              </button>
            </div>

            {/* Encouraging Quote */}
            <div className="bg-[#6D5EF8]/5 border border-[#6D5EF8]/10 rounded-xl px-3 py-2 text-[10px] text-[#94A3B8] italic">
              ✨ "{randomQuote}"
            </div>

            {/* Missions list for this day */}
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 scrollbar">
              {selectedDayMissions.length === 0 ? (
                <div className="text-center py-10 rounded-xl border border-dashed border-white/5 bg-[#050608]/20">
                  <p className="text-xs text-[#94A3B8] font-medium px-4">No missions scheduled for this day!</p>
                  <p className="text-[10px] text-[#22D3EE] mt-1 px-4 font-mono">You've got a secure visual range.</p>
                  <button
                    onClick={() => onOpenMissionModal(selectedDateStr, null)}
                    className="text-[10px] text-[#6D5EF8] font-bold hover:underline mt-2 cursor-pointer"
                  >
                    Add custom mission now
                  </button>
                </div>
              ) : (
                selectedDayMissions.map((t) => {
                  const isCompleted = t.status === "completed";
                  const isOverdue = !isCompleted && new Date(t.deadline) < new Date();
                  
                  return (
                    <div 
                      key={t.id}
                      className={`p-3 rounded-xl border transition-all relative group ${
                        isCompleted
                          ? "bg-[#22D3EE]/5 border-emerald-500/10 opacity-75"
                          : isOverdue
                          ? "bg-red-500/5 border-red-500/20 animate-pulse-glow"
                          : t.priority === "high"
                          ? "bg-red-500/5 border-red-500/15"
                          : "bg-[#050608] border-white/5 hover:border-[#6D5EF8]/30"
                      }`}
                    >
                      {/* Top Row: category + priority */}
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-mono text-[#94A3B8] uppercase">
                          📍 {t.category}
                        </span>
                        <span className={`text-[8px] font-mono uppercase font-extrabold ${
                          t.priority === "high" ? "text-red-400" : t.priority === "medium" ? "text-[#F5B942]" : "text-[#22D3EE]"
                        }`}>
                          {t.priority}
                        </span>
                      </div>

                      {/* Title */}
                      <h5 className={`text-xs font-bold mt-1 text-white leading-normal ${isCompleted ? "line-through opacity-50" : ""}`}>
                        {t.title}
                      </h5>

                      {/* Brief description */}
                      {t.description && (
                        <p className="text-[10px] text-[#94A3B8] mt-1 line-clamp-2 leading-relaxed">
                          {t.description}
                        </p>
                      )}

                      {/* Time due */}
                      <div className="flex items-center gap-1.5 mt-2 text-[9px] text-[#22D3EE] font-mono">
                        <Clock className="w-3 h-3" />
                        <span>Due: {new Date(t.deadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>

                      {/* Action buttons inside mission row */}
                      <div className="flex items-center justify-between gap-3 mt-3 pt-2.5 border-t border-white/5">
                        <div className="flex items-center gap-1">
                          {/* Mark Complete Checkbox */}
                          {!isCompleted ? (
                            <button
                              onClick={() => onUpdateTask(t.id, { progress: 100, status: "completed" })}
                              className="p-1.5 rounded bg-[#22D3EE]/10 text-[#22D3EE] hover:bg-[#22D3EE]/20 transition-all cursor-pointer border border-[#22D3EE]/20"
                              title="🎉 Mission Accomplished!"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          ) : (
                            <span className="text-[8px] text-[#22D3EE] font-extrabold uppercase bg-[#22D3EE]/10 border border-[#22D3EE]/20 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              Accomplished!
                            </span>
                          )}

                          {/* Edit Button */}
                          <button
                            onClick={() => onOpenMissionModal(null, t)}
                            className="p-1.5 rounded bg-white/5 text-[#94A3B8] hover:text-white hover:bg-white/10 transition-all cursor-pointer border border-transparent"
                            title="Refine Blueprint"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => onDeleteTask(t.id)}
                          className="p-1.5 rounded bg-red-500/10 text-[#94A3B8] hover:text-red-400 hover:bg-red-500/20 transition-all cursor-pointer border border-transparent"
                          title="Remove Mission"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick diagnostics footer inside Operations Hub */}
          <div className="border-t border-white/5 pt-3.5 mt-4 text-[10px] text-[#94A3B8] flex justify-between font-mono">
            <span>Overall day load:</span>
            <span className="text-white font-bold">{selectedDayMissions.length} active mission(s)</span>
          </div>
        </div>

        {/* AI STRATEGIC SCHEDULING ROUTINE */}
        <div className={`border rounded-[24px] p-6 space-y-4 relative overflow-hidden bg-[#181C25] border-[#6D5EF8]/25 mt-6`}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#6D5EF8]/5 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-center justify-between">
            <h4 className="font-display font-black text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#F5B942]" /> Hero AI Routine Planner
            </h4>
            <button 
              onClick={fetchOptimizedSchedule}
              disabled={isCompiling}
              className="text-[10px] text-[#22D3EE] font-bold hover:underline cursor-pointer"
            >
              {isCompiling ? "Just a moment..." : "Re-Calculate Plan"}
            </button>
          </div>

          <div className="space-y-3 my-4 overflow-y-auto max-h-[160px] scrollbar pr-1">
            {isCompiling ? (
              <div className="py-8 text-center text-xs text-[#94A3B8] font-sans animate-pulse">
                I'm putting together a plan for your day...
              </div>
            ) : aiSuggestions.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#94A3B8] font-mono">
                Nothing here yet.
              </div>
            ) : (
              aiSuggestions.map((item, idx) => (
                <div key={idx} className="bg-[#050608] border border-white/5 rounded-xl p-3 flex flex-col justify-between gap-1 hover:border-[#6D5EF8]/30 transition-all">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#94A3B8]">
                    <span className="font-bold uppercase text-[#22D3EE]">{item.time}</span>
                    <span className="bg-[#0e111b] px-1.5 py-0.5 rounded uppercase font-semibold text-[8px]">{item.type}</span>
                  </div>
                  <h5 className="text-[11px] font-sans font-bold text-white leading-normal mt-0.5">{item.label}</h5>
                  <p className="text-[10px] text-[#94A3B8] truncate leading-none">Task: {item.taskTitle}</p>
                </div>
              ))
            )}
          </div>

          <p className="text-[10px] text-[#94A3B8] leading-relaxed border-t border-white/5 pt-3 font-sans">
            I'll help you schedule your focus blocks to keep your day stress-free and smooth.
          </p>
        </div>

      </div>

    </div>
  );
}
