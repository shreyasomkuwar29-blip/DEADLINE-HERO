import React from "react";
import { 
  TrendingUp, 
  Target, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  Award, 
  Flame, 
  Sparkles,
  BarChart2
} from "lucide-react";
import { Task, FocusRecord } from "../types";

interface InsightsViewProps {
  tasks: Task[];
  focusRecords: FocusRecord[];
  healthScore: number;
}

export default function InsightsView({
  tasks,
  focusRecords,
  healthScore
}: InsightsViewProps) {
  const completedTasks = tasks.filter(t => t.status === "completed");
  const totalTasksCount = tasks.length;
  const completionRate = totalTasksCount > 0 
    ? Math.round((completedTasks.length / totalTasksCount) * 100) 
    : 100;

  // Calculate total focus hours
  const totalFocusMin = focusRecords.reduce((acc, curr) => acc + curr.duration, 0);
  const focusHours = (totalFocusMin / 60).toFixed(1);

  // Custom mock analytics coordinates for SVG charts:
  // 1. Deadline Health trend line (e.g. 5 days)
  const healthPoints = [
    { day: "Mon", score: 78 },
    { day: "Tue", score: 82 },
    { day: "Wed", score: 80 },
    { day: "Thu", score: 88 },
    { day: "Fri", score: healthScore }
  ];

  // SVG Line coords: width=320, height=120
  // X: Mon=30, Tue=100, Wed=170, Thu=240, Fri=310
  // Y: Score 100 -> 10, Score 0 -> 110 (formula: 110 - (score - 50) * 2)
  const getLineSvgPath = () => {
    let path = "";
    healthPoints.forEach((p, idx) => {
      const x = 30 + idx * 70;
      const y = 110 - (p.score - 50) * 1.8;
      if (idx === 0) path += `M ${x} ${y}`;
      else path += ` L ${x} ${y}`;
    });
    return path;
  };

  // 2. Weekly Productivity blocks (Hours per day of focus work)
  const focusDays = [
    { label: "Mon", hrs: 1.5 },
    { label: "Tue", hrs: 2.2 },
    { label: "Wed", hrs: 1.8 },
    { label: "Thu", hrs: 3.5 },
    { label: "Fri", hrs: totalFocusMin > 0 ? Number(focusHours) : 2.5 },
    { label: "Sat", hrs: 0 },
    { label: "Sun", hrs: 0 }
  ];

  return (
    <div className="space-y-6 animate-fade-in text-[#F8FAFC]">
      
      {/* 1. Header Row */}
      <div>
        <h2 className="font-display font-bold text-3xl tracking-tight text-white">Execution Metrics</h2>
        <p className="text-sm text-[#94A3B8] mt-1 font-sans">
          In-depth tracking of baseline cognitive metrics and predictive risk analytics.
        </p>
      </div>

      {/* 2. Top Level Bento Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* COMPLETION STAT CARD */}
        <div className="bg-[#0e111b] border border-white/5 rounded-2xl p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-widest">Completion rate</span>
            <Target className="w-4.5 h-4.5 text-[#22D3EE]" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-display font-bold text-white tracking-tight">{completionRate}%</span>
            <span className="text-xs text-[#22D3EE] font-semibold tracking-wide">Target meet</span>
          </div>
          {/* Glowing bar */}
          <div className="w-full h-1.5 bg-[#050608] rounded-full mt-4 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#6D5EF8] to-[#22D3EE] rounded-full transition-all duration-1000" 
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* FOCUS HOURS CARD */}
        <div className="bg-[#0e111b] border border-white/5 rounded-2xl p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-widest">Focus Duration</span>
            <Clock className="w-4.5 h-4.5 text-[#6D5EF8]" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-display font-bold text-white tracking-tight">{focusHours}h</span>
            <span className="text-xs text-[#6D5EF8] font-semibold tracking-wide">Accumulated</span>
          </div>
          {/* Subtle micro text */}
          <p className="text-[10px] text-[#94A3B8] mt-4 font-mono uppercase tracking-wider">
            {focusRecords.length} Active Pomodoro cycles
          </p>
        </div>

        {/* COMPLETED MISSIONS */}
        <div className="bg-[#0e111b] border border-white/5 rounded-2xl p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-widest">Missions Cleared</span>
            <Award className="w-4.5 h-4.5 text-[#F5B942]" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-display font-bold text-white tracking-tight">
              {completedTasks.length} / {totalTasksCount}
            </span>
            <span className="text-xs text-[#F5B942] font-semibold tracking-wide">Targets</span>
          </div>
          <p className="text-[10px] text-[#94A3B8] mt-4 font-mono uppercase tracking-wider">
            {tasks.filter(t => t.status !== "completed").length} active items in queue
          </p>
        </div>

        {/* BASELINE STREAK */}
        <div className="bg-[#0e111b] border border-white/5 rounded-2xl p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-widest">Streaks Consistency</span>
            <Flame className="w-4.5 h-4.5 text-red-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-display font-bold text-white tracking-tight">5 Days</span>
            <span className="text-xs text-red-400 font-semibold tracking-wide">Active</span>
          </div>
          <p className="text-[10px] text-[#94A3B8] mt-4 font-mono uppercase tracking-wider">
            Average 94m focus sprint per day
          </p>
        </div>

      </div>

      {/* 3. Detailed Custom Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* DEADLINE HEALTH TREND (lg:col-span-1) */}
        <div className="bg-[#0e111b] border border-white/5 rounded-[24px] p-6 space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-sm text-white">Deadline Health Wave</h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">Historical tracking indices of schedule risk levels.</p>
          </div>

          {/* Interactive Vector Line Chart SVG */}
          <div className="relative h-44 flex items-center justify-center bg-[#050608]/30 border border-white/5 rounded-xl p-4 overflow-hidden">
            <svg viewBox="0 0 340 140" className="w-full h-full overflow-visible">
              <defs>
                {/* Neon shadow gradient for wave line */}
                <linearGradient id="waveGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#6D5EF8" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#6D5EF8" stopOpacity="0" />
                </linearGradient>
                <filter id="shadow">
                  <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#6D5EF8" floodOpacity="0.5" />
                </filter>
              </defs>

              {/* Grid guide lines */}
              <line x1="30" y1="20" x2="310" y2="20" stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
              <line x1="30" y1="60" x2="310" y2="60" stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
              <line x1="30" y1="100" x2="310" y2="100" stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />

              {/* Shaded Area underneath Line */}
              <path 
                d={`${getLineSvgPath()} L 310 120 L 30 120 Z`} 
                fill="url(#waveGlow)" 
                className="transition-all duration-1000"
              />

              {/* Core Wave Line */}
              <path 
                d={getLineSvgPath()} 
                fill="none" 
                stroke="#6D5EF8" 
                strokeWidth="3.5" 
                strokeLinecap="round"
                filter="url(#shadow)"
                className="transition-all duration-1000"
              />

              {/* Dots for scores */}
              {healthPoints.map((p, idx) => {
                const x = 30 + idx * 70;
                const y = 110 - (p.score - 50) * 1.8;
                return (
                  <g key={idx}>
                    <circle cx={x} cy={y} r="6" fill="#0e111b" stroke="#22D3EE" strokeWidth="2.5" />
                    <text x={x} y={y - 12} textAnchor="middle" fill="white" className="text-[10px] font-mono font-bold">{p.score}%</text>
                  </g>
                );
              })}

              {/* Week labels */}
              {healthPoints.map((p, idx) => (
                <text key={`lbl-${idx}`} x={30 + idx * 70} y="134" textAnchor="middle" fill="#94A3B8" className="text-[9px] font-mono uppercase tracking-wider">{p.day}</text>
              ))}
            </svg>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#22D3EE] bg-[#22D3EE]/5 p-3 rounded-xl border border-[#22D3EE]/15">
            <ShieldCheck className="w-4.5 h-4.5" />
            <span>AI assessment: Safe. Overdue threat minimized.</span>
          </div>
        </div>

        {/* WEEKLY PRODUCTIVITY CHART (lg:col-span-1) */}
        <div className="bg-[#0e111b] border border-white/5 rounded-[24px] p-6 space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="font-display font-bold text-sm text-white">Focus Sprints Matrix</h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">Hours logged in quiet execution sprints per day.</p>
          </div>

          {/* Productivity bar chart Vector SVG */}
          <div className="h-44 flex items-center justify-center bg-[#050608]/30 border border-white/5 rounded-xl p-4 overflow-hidden">
            <svg viewBox="0 0 340 140" className="w-full h-full overflow-visible">
              <line x1="30" y1="110" x2="310" y2="110" stroke="rgba(255,255,255,0.08)" />
              
              {/* Bars render loops */}
              {focusDays.map((d, idx) => {
                const x = 35 + idx * 40;
                // Height limit: 80px (for 4 hours)
                const barHeight = (d.hrs / 4) * 80;
                const y = 110 - barHeight;
                
                return (
                  <g key={idx} className="group cursor-pointer">
                    {/* Shadow block bar */}
                    <rect 
                      x={x} 
                      y={y} 
                      width="16" 
                      height={barHeight} 
                      rx="4" 
                      fill="url(#barGradient)" 
                      className="transition-all duration-1000 ease-out hover:brightness-115"
                    />
                    
                    {/* Text values */}
                    {d.hrs > 0 && (
                      <text x={x + 8} y={y - 8} textAnchor="middle" fill="white" className="text-[9px] font-mono font-bold">
                        {d.hrs}h
                      </text>
                    )}
                    
                    {/* Week labels */}
                    <text x={x + 8} y="126" textAnchor="middle" fill="#94A3B8" className="text-[9px] font-mono">{d.label}</text>
                  </g>
                );
              })}

              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22D3EE" />
                  <stop offset="100%" stopColor="#6D5EF8" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span className="flex items-center gap-1.5"><BarChart2 className="w-4 h-4 text-[#6D5EF8]" /> Peak productivity is Thursday</span>
            <span className="font-mono text-[10px] font-bold text-white bg-[#0e111b] px-2 py-0.5 rounded border border-white/5">Weekly Average: 1.8h/day</span>
          </div>
        </div>

      </div>

      {/* 4. Risk Prediction Model Analysis */}
      <div className="bg-[#0e111b] border border-white/5 rounded-[24px] p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
        <h3 className="font-display font-semibold text-base text-white flex items-center gap-2">
          <AlertTriangle className="w-4.5 h-4.5 text-red-400" />
          AI Future Overload Predictions
        </h3>
        <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
          The Deadline Hero predictive model projects potential schedules bottlenecks 48-72 hours in advance.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          <div className="bg-[#050608] border border-white/5 rounded-xl p-4 flex gap-3.5 items-start">
            <div className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Compaction Danger Slot</h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed mt-1">
                A potential overload is predicted on Tuesday afternoon due to overlapping research paper milestones and exams prep. AI recommends splitting workloads immediately.
              </p>
            </div>
          </div>

          <div className="bg-[#050608] border border-white/5 rounded-xl p-4 flex gap-3.5 items-start">
            <div className="w-7 h-7 rounded-lg bg-[#22D3EE]/10 text-[#22D3EE] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Mitigation Blueprint</h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed mt-1">
                Move 45 minutes of Academic editing blocks up to Monday evening. This offsets Tuesday compaction risk indices by 42% and retains Deadline Health above 85.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
