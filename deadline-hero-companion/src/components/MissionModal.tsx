import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Sparkles, 
  Calendar as CalIcon, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  Flame,
  CheckCircle,
  Briefcase,
  GraduationCap,
  Heart,
  DollarSign,
  HelpCircle,
  Zap
} from "lucide-react";
import { Task } from "../types";

interface MissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: {
    title: string;
    description: string;
    category: 'work' | 'personal' | 'academic' | 'finance' | 'other';
    priority: 'high' | 'medium' | 'low';
    estTime: number;
    deadline: string;
  }) => void;
  task?: Task | null; // If provided, we are in Edit mode
  preselectedDate?: string | null; // e.g. "2026-06-27"
  activeTheme?: string;
}

export default function MissionModal({
  isOpen,
  onClose,
  onSave,
  task,
  preselectedDate,
  activeTheme = "dark"
}: MissionModalProps) {
  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<'work' | 'personal' | 'academic' | 'finance' | 'other'>("academic");
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>("high");
  const [estTime, setEstTime] = useState<number>(60);
  
  // Date & Time Picker States
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 5, 27)); // Defaults to current local year/month/day
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerUpward, setDatePickerUpward] = useState(false);
  
  const [hour, setHour] = useState("09");
  const [minute, setMinute] = useState("00");
  const [ampm, setAmpm] = useState("AM");
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timePickerUpward, setTimePickerUpward] = useState(false);

  // For mini calendar date picker
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date(2026, 5, 27));

  // Ref container to close dropdowns when clicking outside
  const datePickerRef = useRef<HTMLDivElement>(null);
  const timePickerRef = useRef<HTMLDivElement>(null);

  // Human encouraging quotes to cycle through in the footer
  const [motivationalQuote, setMotivationalQuote] = useState("");
  const quotes = [
    "You're making great progress. One mission at a time.",
    "Keep going! Your future self will thank you.",
    "Nice work! You're one step closer to your goal.",
    "You've got this! Let's lock in this mission.",
    "Every small step secures your timeline.",
    "Calm focus conquers tight schedules."
  ];

  // Initialize form when opening modal or changing task
  useEffect(() => {
    if (isOpen) {
      // Choose random motivation
      setMotivationalQuote(quotes[Math.floor(Math.random() * quotes.length)]);

      if (task) {
        setTitle(task.title);
        setDescription(task.description);
        setCategory(task.category);
        setPriority(task.priority);
        setEstTime(task.estTime);
        
        // Parse task deadline (e.g. "2026-06-27T14:30")
        try {
          const dlDate = new Date(task.deadline);
          if (!isNaN(dlDate.getTime())) {
            setSelectedDate(dlDate);
            setCalendarMonth(new Date(dlDate.getFullYear(), dlDate.getMonth(), 1));
            
            let h = dlDate.getHours();
            const m = String(dlDate.getMinutes()).padStart(2, "0");
            const ap = h >= 12 ? "PM" : "AM";
            h = h % 12;
            h = h ? h : 12; // 0 should be 12
            setHour(String(h).padStart(2, "0"));
            setMinute(m);
            setAmpm(ap);
          }
        } catch (err) {
          console.error("Error parsing task deadline", err);
        }
      } else {
        // New task
        setTitle("");
        setDescription("");
        setCategory("academic");
        setPriority("high");
        setEstTime(60);
        
        // Set date to preselected date or default
        if (preselectedDate) {
          const parsed = new Date(preselectedDate);
          if (!isNaN(parsed.getTime())) {
            setSelectedDate(parsed);
            setCalendarMonth(new Date(parsed.getFullYear(), parsed.getMonth(), 1));
          }
        } else {
          const today = new Date();
          setSelectedDate(today);
          setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1));
        }

        setHour("09");
        setMinute("00");
        setAmpm("AM");
      }
    }
  }, [isOpen, task, preselectedDate]);

  // Click outside detection for dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
      if (timePickerRef.current && !timePickerRef.current.contains(event.target as Node)) {
        setShowTimePicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Measure space around picker inputs to decide upward/downward positioning
  useEffect(() => {
    if (showDatePicker && datePickerRef.current) {
      const rect = datePickerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // Calendar popover is around 320px in height.
      // If there's less than 320px space below, and we have enough space above, display upward.
      if (spaceBelow < 320 && rect.top > 320) {
        setDatePickerUpward(true);
      } else {
        setDatePickerUpward(false);
      }
    }
  }, [showDatePicker]);

  useEffect(() => {
    if (showTimePicker && timePickerRef.current) {
      const rect = timePickerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // Timepicker popover is around 260px in height.
      if (spaceBelow < 260 && rect.top > 260) {
        setTimePickerUpward(true);
      } else {
        setTimePickerUpward(false);
      }
    }
  }, [showTimePicker]);

  if (!isOpen) return null;

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Convert selected Date + Time state to ISO or YYYY-MM-DDTHH:mm format
    let finalHour = parseInt(hour);
    if (ampm === "PM" && finalHour < 12) finalHour += 12;
    if (ampm === "AM" && finalHour === 12) finalHour = 0;

    const deadlineDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      finalHour,
      parseInt(minute)
    );

    // Format as local-safe ISO string: YYYY-MM-DDTHH:mm
    const year = deadlineDate.getFullYear();
    const month = String(deadlineDate.getMonth() + 1).padStart(2, "0");
    const day = String(deadlineDate.getDate()).padStart(2, "0");
    const hrs = String(deadlineDate.getHours()).padStart(2, "0");
    const mins = String(deadlineDate.getMinutes()).padStart(2, "0");
    const formattedDeadline = `${year}-${month}-${day}T${hrs}:${mins}`;

    onSave({
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      estTime,
      deadline: formattedDeadline
    });
  };

  // Date handlers for Date Picker
  const setDateToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setShowDatePicker(false);
  };

  const setDateToTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow);
    setCalendarMonth(new Date(tomorrow.getFullYear(), tomorrow.getMonth(), 1));
    setShowDatePicker(false);
  };

  const setDateToNextWeek = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    setSelectedDate(nextWeek);
    setCalendarMonth(new Date(nextWeek.getFullYear(), nextWeek.getMonth(), 1));
    setShowDatePicker(false);
  };

  // Mini Calendar rendering calculations
  const monthDays = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
  const firstDayIndex = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay();
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const handleMonthPrev = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1));
  };

  const handleMonthNext = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));
  };

  const selectCalendarDay = (dayNum: number) => {
    const newSelected = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth(),
      dayNum
    );
    setSelectedDate(newSelected);
    setShowDatePicker(false);
  };

  // Human-friendly date representation
  const getFormattedDateLabel = () => {
    return selectedDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Theme Config mapper for consistent modals
  const isLight = activeTheme === "light";
  const bgClass = isLight ? "bg-white text-slate-800 border-slate-200" : "bg-[#181C25] text-white border-white/5";
  const overlayBg = "bg-black/60 backdrop-blur-md";
  const subBgClass = isLight ? "bg-slate-100/80 border-slate-200" : "bg-[#0e111b] border-white/5";
  const inputClass = isLight 
    ? "bg-slate-50 border-slate-200 text-slate-900 focus:border-[#6D5EF8]" 
    : "bg-[#050608] border-white/5 text-white focus:border-[#6D5EF8]/50";
  const textMutedClass = isLight ? "text-slate-500" : "text-[#94A3B8]";

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto p-4 flex justify-center items-start sm:items-center ${overlayBg}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`w-full max-w-xl rounded-[28px] border p-6 md:p-8 relative shadow-2xl overflow-y-auto max-h-[90vh] md:max-h-[85vh] ${bgClass}`}
      >
        {/* Decorative blur backdrop */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#6D5EF8]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#22D3EE]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6D5EF8]/15 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#22D3EE] animate-pulse" />
            </div>
            <div>
              <h3 className="font-display font-black text-xl tracking-tight text-white flex items-center gap-2">
                {task ? "Refine Mission Blueprint" : "Draft New Mission"}
              </h3>
              <p className="text-xs text-[#22D3EE] font-mono tracking-wide uppercase mt-0.5">Tactical Deployment Matrix</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-all hover:scale-105 cursor-pointer border border-transparent ${
              isLight ? "hover:bg-slate-100 text-slate-400 hover:text-slate-600" : "hover:bg-[#0e111b] text-[#94A3B8] hover:text-white"
            }`}
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Title Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#22D3EE] uppercase tracking-wider block font-mono">Mission Name</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What goal are we securing?"
              className={`w-full rounded-xl px-4 py-3 text-xs focus:outline-none transition-all font-semibold ${inputClass}`}
            />
          </div>

          {/* 2. Description Textarea */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#22D3EE] uppercase tracking-wider block font-mono">Description (Optional)</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline mission objectives, parameters, and core coordinates..."
              className={`w-full rounded-xl p-4 text-xs focus:outline-none transition-all resize-none font-medium leading-relaxed ${inputClass}`}
            />
          </div>

          {/* 3. Category & Priority selection in a clean split layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category Selector with elegant buttons */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#22D3EE] uppercase tracking-wider block font-mono">Category</label>
              <div className={`grid grid-cols-5 gap-1.5 p-1 rounded-xl ${subBgClass}`}>
                {[
                  { value: "academic", icon: GraduationCap, label: "Academia" },
                  { value: "work", icon: Briefcase, label: "Work" },
                  { value: "personal", icon: Heart, label: "Personal" },
                  { value: "finance", icon: DollarSign, label: "Finance" },
                  { value: "other", icon: HelpCircle, label: "Other" }
                ].map((cat) => {
                  const CatIcon = cat.icon;
                  const isSelected = category === cat.value;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value as any)}
                      title={cat.label}
                      className={`py-2 rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#6D5EF8] text-white shadow-md shadow-[#6D5EF8]/20 scale-[1.05]"
                          : isLight
                          ? "hover:bg-slate-200 text-slate-500 hover:text-slate-800"
                          : "hover:bg-[#181C25] text-[#94A3B8] hover:text-white"
                      }`}
                    >
                      <CatIcon className="w-4.5 h-4.5" />
                    </button>
                  );
                })}
              </div>
              <span className={`text-[9px] font-mono capitalize block text-right mt-1 ${textMutedClass}`}>
                Sector: <strong className="text-[#22D3EE]">{category}</strong>
              </span>
            </div>

            {/* Priority Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#22D3EE] uppercase tracking-wider block font-mono">Priority</label>
              <div className={`grid grid-cols-3 gap-1.5 p-1 rounded-xl ${subBgClass}`}>
                {[
                  { id: "high", emoji: "🔥", label: "High" },
                  { id: "medium", emoji: "⚡", label: "Medium" },
                  { id: "low", emoji: "❄️", label: "Low" }
                ].map((p) => {
                  const isSelected = priority === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPriority(p.id as any)}
                      className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#6D5EF8] text-white shadow-md shadow-[#6D5EF8]/20 scale-[1.05]"
                          : isLight
                          ? "hover:bg-slate-200 text-slate-500 hover:text-slate-800"
                          : "hover:bg-[#181C25] text-[#94A3B8] hover:text-white"
                      }`}
                    >
                      <span>{p.emoji}</span>
                      <span className="hidden xs:inline text-[10px]">{p.label}</span>
                    </button>
                  );
                })}
              </div>
              <span className={`text-[9px] font-mono uppercase block text-right mt-1 ${textMutedClass}`}>
                Threat Assessment: <strong className="text-red-400">{priority}</strong>
              </span>
            </div>
          </div>

          {/* 4. Estimated Time Slider with friendly human presets */}
          <div className="space-y-1.5 bg-[#0e111b]/30 p-4 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-[#22D3EE] uppercase tracking-wider font-mono">Estimated Time Block</label>
              <span className="font-mono text-xs text-white font-black bg-[#6D5EF8]/20 px-2.5 py-1 rounded-lg border border-[#6D5EF8]/30">
                {estTime >= 60 ? `${Math.floor(estTime / 60)}h ${estTime % 60 > 0 ? `${estTime % 60}m` : ""}` : `${estTime} Minutes`}
              </span>
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-[10px] font-mono text-[#94A3B8]">15m</span>
              <input
                type="range"
                min={15}
                max={300}
                step={15}
                value={estTime}
                onChange={(e) => setEstTime(Number(e.target.value))}
                className="flex-1 accent-[#22D3EE] cursor-pointer"
              />
              <span className="text-[10px] font-mono text-[#94A3B8]">5h</span>
            </div>
            {/* Presets clickers */}
            <div className="flex items-center gap-1.5 justify-end mt-2">
              {[30, 60, 90, 120, 180].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setEstTime(val)}
                  className={`text-[9px] font-mono px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                    estTime === val 
                      ? "bg-[#22D3EE]/20 border-[#22D3EE] text-[#22D3EE]" 
                      : "bg-[#050608]/40 border-white/5 text-[#94A3B8] hover:text-white"
                  }`}
                >
                  {val >= 60 ? `${val / 60}h` : `${val}m`}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Custom Date Picker & Time Picker Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Custom Date Picker */}
            <div className="space-y-1.5 relative" ref={datePickerRef}>
              <label className="text-[10px] font-bold text-[#22D3EE] uppercase tracking-wider block font-mono">Due Date</label>
              
              <button
                type="button"
                onClick={() => {
                  setShowDatePicker(!showDatePicker);
                  setShowTimePicker(false);
                }}
                className={`w-full flex items-center justify-between rounded-xl px-4 py-2.5 text-xs focus:outline-none transition-all cursor-pointer font-semibold text-left border ${
                  showDatePicker ? "border-[#6D5EF8] ring-1 ring-[#6D5EF8]/30" : "border-white/5"
                } ${isLight ? "bg-slate-50 text-slate-800" : "bg-[#050608] text-white"}`}
              >
                <span className="flex items-center gap-2">
                  <CalIcon className="w-4 h-4 text-[#22D3EE]" />
                  {getFormattedDateLabel()}
                </span>
                <ChevronRight className={`w-3.5 h-3.5 text-[#94A3B8] transition-transform ${showDatePicker ? "rotate-90" : ""}`} />
              </button>

              {/* Date Picker Dropdown Calendar popover */}
              <AnimatePresence>
                {showDatePicker && (
                  <motion.div
                    initial={{ opacity: 0, y: datePickerUpward ? -10 : 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: datePickerUpward ? -4 : 4, scale: 1 }}
                    exit={{ opacity: 0, y: datePickerUpward ? -10 : 10, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute left-0 right-0 z-30 bg-[#120D1E] border border-purple-500/20 rounded-2xl p-4 shadow-xl space-y-3 ${
                      datePickerUpward ? "bottom-full mb-2" : "top-full mt-2"
                    }`}
                  >
                    {/* Quick presets buttons */}
                    <div className="grid grid-cols-3 gap-1.5 pb-2.5 border-b border-white/5">
                      <button
                        type="button"
                        onClick={setDateToToday}
                        className="py-1 rounded bg-[#181C25] hover:bg-[#6D5EF8]/20 border border-white/5 text-[10px] font-bold text-[#F8FAFC] cursor-pointer transition-all"
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        onClick={setDateToTomorrow}
                        className="py-1 rounded bg-[#181C25] hover:bg-[#6D5EF8]/20 border border-white/5 text-[10px] font-bold text-[#F8FAFC] cursor-pointer transition-all"
                      >
                        Tomorrow
                      </button>
                      <button
                        type="button"
                        onClick={setDateToNextWeek}
                        className="py-1 rounded bg-[#181C25] hover:bg-[#6D5EF8]/20 border border-white/5 text-[10px] font-bold text-[#F8FAFC] cursor-pointer transition-all"
                      >
                        Next Week
                      </button>
                    </div>

                    {/* Month selector */}
                    <div className="flex items-center justify-between">
                      <button type="button" onClick={handleMonthPrev} className="p-1 hover:bg-[#181C25] rounded text-white">
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[11px] font-bold text-[#22D3EE] font-mono">
                        {monthNames[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
                      </span>
                      <button type="button" onClick={handleMonthNext} className="p-1 hover:bg-[#181C25] rounded text-white">
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Simple calendar layout */}
                    <div>
                      <div className="grid grid-cols-7 text-center text-[8px] font-bold text-[#94A3B8] font-mono mb-1.5 uppercase tracking-wider">
                        <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {/* Empty spacing for offsetting first day */}
                        {Array.from({ length: firstDayIndex }).map((_, i) => (
                          <div key={`empty-${i}`} className="w-6 h-6" />
                        ))}
                        {/* Days list */}
                        {Array.from({ length: monthDays }).map((_, idx) => {
                          const dayNum = idx + 1;
                          const isCurrent = 
                            selectedDate.getDate() === dayNum &&
                            selectedDate.getMonth() === calendarMonth.getMonth() &&
                            selectedDate.getFullYear() === calendarMonth.getFullYear();

                          return (
                            <button
                              key={dayNum}
                              type="button"
                              onClick={() => selectCalendarDay(dayNum)}
                              className={`w-6 h-6 rounded-lg text-[10px] font-mono font-bold flex items-center justify-center transition-all cursor-pointer ${
                                isCurrent
                                  ? "bg-[#6D5EF8] text-white shadow-sm ring-1 ring-white/10"
                                  : "text-white hover:bg-white/5 hover:text-[#22D3EE]"
                              }`}
                            >
                              {dayNum}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Custom Time Picker */}
            <div className="space-y-1.5 relative" ref={timePickerRef}>
              <label className="text-[10px] font-bold text-[#22D3EE] uppercase tracking-wider block font-mono">Due Time</label>
              
              <button
                type="button"
                onClick={() => {
                  setShowTimePicker(!showTimePicker);
                  setShowDatePicker(false);
                }}
                className={`w-full flex items-center justify-between rounded-xl px-4 py-2.5 text-xs focus:outline-none transition-all cursor-pointer font-semibold text-left border ${
                  showTimePicker ? "border-[#6D5EF8] ring-1 ring-[#6D5EF8]/30" : "border-white/5"
                } ${isLight ? "bg-slate-50 text-slate-800" : "bg-[#050608] text-white"}`}
              >
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#22D3EE]" />
                  {hour}:{minute} {ampm}
                </span>
                <ChevronRight className={`w-3.5 h-3.5 text-[#94A3B8] transition-transform ${showTimePicker ? "rotate-90" : ""}`} />
              </button>

              {/* Time Picker Dropdown Picker popover */}
              <AnimatePresence>
                {showTimePicker && (
                  <motion.div
                    initial={{ opacity: 0, y: timePickerUpward ? -10 : 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: timePickerUpward ? -4 : 4, scale: 1 }}
                    exit={{ opacity: 0, y: timePickerUpward ? -10 : 10, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute left-0 right-0 z-30 bg-[#120D1E] border border-purple-500/20 rounded-2xl p-4.5 shadow-xl space-y-4 ${
                      timePickerUpward ? "bottom-full mb-2" : "top-full mt-2"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-3">
                      {/* Hour selectors */}
                      <div className="flex flex-col items-center">
                        <span className="text-[8px] font-bold uppercase text-[#94A3B8] mb-1 font-mono">Hour</span>
                        <div className="flex items-center bg-[#050608] rounded-lg border border-white/5 p-1">
                          <select
                            value={hour}
                            onChange={(e) => setHour(e.target.value)}
                            className="bg-transparent text-white font-mono font-bold text-xs focus:outline-none cursor-pointer px-1 py-0.5"
                          >
                            {Array.from({ length: 12 }).map((_, i) => {
                              const h = String(i + 1).padStart(2, "0");
                              return <option key={h} value={h} className="bg-[#120D1E]">{h}</option>;
                            })}
                          </select>
                        </div>
                      </div>

                      <span className="text-white font-bold font-mono mt-4">:</span>

                      {/* Minutes Selector */}
                      <div className="flex flex-col items-center">
                        <span className="text-[8px] font-bold uppercase text-[#94A3B8] mb-1 font-mono">Minute</span>
                        <div className="flex items-center bg-[#050608] rounded-lg border border-white/5 p-1">
                          <select
                            value={minute}
                            onChange={(e) => setMinute(e.target.value)}
                            className="bg-transparent text-white font-mono font-bold text-xs focus:outline-none cursor-pointer px-1 py-0.5"
                          >
                            {Array.from({ length: 12 }).map((_, i) => {
                              const m = String(i * 5).padStart(2, "0");
                              return <option key={m} value={m} className="bg-[#120D1E]">{m}</option>;
                            })}
                          </select>
                        </div>
                      </div>

                      {/* AM / PM selector buttons */}
                      <div className="flex flex-col items-center">
                        <span className="text-[8px] font-bold uppercase text-[#94A3B8] mb-1 font-mono">Period</span>
                        <div className="flex bg-[#050608] border border-white/5 rounded-lg overflow-hidden p-0.5">
                          {["AM", "PM"].map((ap) => (
                            <button
                              key={ap}
                              type="button"
                              onClick={() => setAmpm(ap)}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                ampm === ap ? "bg-[#6D5EF8] text-white" : "text-[#94A3B8] hover:text-white"
                              }`}
                            >
                              {ap}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Preselected quick time coordinates */}
                    <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-white/5">
                      {[
                        { label: "09:00 AM (Morning)", h: "09", m: "00", ap: "AM" },
                        { label: "01:00 PM (Midday)", h: "01", m: "00", ap: "PM" },
                        { label: "05:00 PM (Afternoon)", h: "05", m: "00", ap: "PM" },
                        { label: "09:00 PM (Night)", h: "09", m: "00", ap: "PM" }
                      ].map((tPreset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setHour(tPreset.h);
                            setMinute(tPreset.m);
                            setAmpm(tPreset.ap);
                            setShowTimePicker(false);
                          }}
                          className="py-1 px-2 rounded bg-[#181C25] hover:bg-[#6D5EF8]/20 border border-white/5 text-[9px] font-mono text-left text-white cursor-pointer transition-all truncate"
                        >
                          🕒 {tPreset.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Motivational Encouragement Footer */}
          <div className="bg-[#6D5EF8]/5 border border-[#6D5EF8]/10 rounded-2xl p-4 flex items-start gap-3 mt-4">
            <Zap className="w-4 h-4 text-[#22D3EE] shrink-0 mt-0.5 animate-pulse" />
            <p className="text-[11px] text-[#94A3B8] leading-relaxed font-sans font-medium">
              {motivationalQuote}
            </p>
          </div>

          {/* Action Row */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isLight ? "text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200" : "text-[#94A3B8] hover:text-white bg-[#181C25] hover:bg-[#181C25]/80"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#6D5EF8] hover:bg-[#6D5EF8]/90 text-white rounded-xl text-xs font-bold transition-all cursor-pointer border border-white/10 flex items-center gap-1.5 shadow-lg shadow-[#6D5EF8]/10"
            >
              <CheckCircle className="w-4 h-4" />
              Save Mission
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
