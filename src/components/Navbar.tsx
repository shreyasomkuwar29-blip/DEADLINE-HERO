import React, { useState, useEffect, useRef } from "react";
import { 
  Search, 
  Bell, 
  Plus, 
  Menu, 
  Cpu, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Zap,
  User,
  Pencil,
  Paintbrush,
  Sparkles,
  Settings,
  LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile } from "../types";

interface NavbarProps {
  onOpenMobileSidebar: () => void;
  onQuickAddTask: () => void;
  profile: UserProfile;
  healthScore: number;
  isAiAnalyzing: boolean;
  onAiSync: () => void;
  activeTheme?: string;
  onNavigateToPage?: (page: string) => void;
  onLogOut?: () => void;
}

export default function Navbar({ 
  onOpenMobileSidebar, 
  onQuickAddTask, 
  profile, 
  healthScore, 
  isAiAnalyzing,
  onAiSync,
  activeTheme = "dark",
  onNavigateToPage,
  onLogOut
}: NavbarProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState([
    { id: 1, type: "danger", text: "Math assignment is due in 4 hours!", read: false },
    { id: 2, type: "success", text: "Deadline health increased by 12% today.", read: false },
    { id: 3, type: "warning", text: "AI warns: Tomorrow has 3 overlapping focus runs.", read: true },
  ]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsProfileOpen(false);
      }
    }

    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isProfileOpen]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-[#22D3EE] drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]";
    if (score >= 50) return "text-[#F5B942] drop-shadow-[0_0_8px_rgba(245,185,66,0.3)]";
    return "text-[#EF4444] drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]";
  };

  const navbarBg = activeTheme === "light"
    ? "bg-white/80 border-slate-200 text-slate-800"
    : activeTheme === "purple"
    ? "bg-[#1B142C]/80 border-purple-500/10 text-[#FAF5FF]"
    : activeTheme === "forest"
    ? "bg-[#0E2A1E]/80 border-emerald-500/10 text-[#F0FDF4]"
    : activeTheme === "ocean"
    ? "bg-[#112240]/80 border-blue-500/10 text-[#F0F8FF]"
    : activeTheme === "sunset"
    ? "bg-[#2A1414]/80 border-orange-500/10 text-[#FFF7ED]"
    : "bg-[#050608]/80 border-[#0e111b] text-[#F8FAFC]";

  const borderClass = activeTheme === "light"
    ? "border-slate-200"
    : activeTheme === "purple"
    ? "border-purple-500/10"
    : activeTheme === "forest"
    ? "border-emerald-500/10"
    : activeTheme === "ocean"
    ? "border-blue-500/10"
    : activeTheme === "sunset"
    ? "border-orange-500/10"
    : "border-[#0e111b]";

  const inputClass = activeTheme === "light"
    ? "bg-slate-100 border-slate-200 text-slate-900 focus:border-[#6D5EF8]/50 placeholder-slate-400"
    : "bg-[#0e111b] border-white/5 text-[#F8FAFC] focus:border-[#6D5EF8]/50 placeholder-[#94A3B8]/50";

  const btnClass = activeTheme === "light"
    ? "bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100/80"
    : "bg-[#0e111b] border-white/5 text-[#F8FAFC] hover:border-[#6D5EF8]/30 hover:bg-[#0e111b]/80";

  const clockTextClass = activeTheme === "light" ? "text-slate-900" : "text-white";

  return (
    <header className={`sticky top-0 z-40 w-full ${navbarBg} backdrop-blur-md border-b px-4 md:px-8 py-4 flex items-center justify-between`}>
      
      {/* Left side: Mobile menu toggle + Search bar */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <button 
          onClick={onOpenMobileSidebar}
          className={`md:hidden p-2 rounded-xl transition-colors border ${borderClass}`}
          aria-label="Open navigation drawer"
        >
          <Menu className="w-5 h-5 text-[#94A3B8]" />
        </button>
        
        {/* Dynamic Search */}
        <div className="relative w-full hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input 
            type="text" 
            placeholder="Search tasks, AI suggestions, agendas..." 
            className={`w-full border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none transition-all ${inputClass}`}
          />
        </div>
      </div>

      {/* Right side: Time, Sync, Stats, Notifications, Quick Add, Profile */}
      <div className="flex items-center gap-3 md:gap-5">
        
        {/* Live Clock Date Display */}
        <div className={`hidden lg:flex flex-col items-end border-r ${borderClass} pr-5`}>
          <span className="text-xs text-[#94A3B8] font-medium tracking-wide">
            {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
          <span className={`text-xs font-mono font-semibold tracking-widest mt-0.5 flex items-center gap-1.5 ${clockTextClass}`}>
            <Clock className="w-3 h-3 text-[#22D3EE]" />
            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
          </span>
        </div>

        {/* AI Sync / Analyzer status button */}
        <button
          onClick={onAiSync}
          disabled={isAiAnalyzing}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border transition-all text-xs font-medium cursor-pointer ${
            isAiAnalyzing 
              ? "bg-[#6D5EF8]/10 border-[#6D5EF8]/40 text-[#22D3EE] animate-pulse" 
              : btnClass
          }`}
        >
          <Cpu className={`w-3.5 h-3.5 ${isAiAnalyzing ? "animate-spin text-[#22D3EE]" : "text-[#6D5EF8]"}`} />
          <span className="hidden md:inline">{isAiAnalyzing ? "Analyzing Schedule..." : "AI Health Audit"}</span>
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${getHealthColor(healthScore)}`}>
            {healthScore}%
          </span>
        </button>

        {/* AI Status Badge */}
        <div className={`hidden sm:flex items-center gap-2 border px-3 py-1.5 rounded-xl text-xs ${activeTheme === "light" ? "bg-slate-50 border-slate-200" : "bg-[#0e111b] border-white/5"}`}>
          <div className="w-2 h-2 rounded-full bg-[#22D3EE] animate-pulse glow-accent" />
          <span className="font-mono text-[10px] font-bold text-[#22D3EE] uppercase tracking-wider">Hero Core V2.5</span>
        </div>

        {/* Quick Add Button */}
        <button
          onClick={onQuickAddTask}
          className="bg-gradient-to-r from-[#6D5EF8] to-[#22D3EE] hover:brightness-110 active:scale-95 text-white p-2 sm:px-4 sm:py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-[#6D5EF8]/10 transition-all cursor-pointer border border-white/10"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Mission</span>
        </button>

        {/* Notification popover */}
        <div className="relative">
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 bg-[#0e111b] border border-white/5 hover:border-[#6D5EF8]/30 rounded-xl transition-all relative cursor-pointer"
            aria-label="Toggle notifications"
          >
            <Bell className="w-4.5 h-4.5 text-[#94A3B8] hover:text-white transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-full text-[9px] font-black text-white flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-[#0e111b] border border-[#6D5EF8]/20 rounded-2xl shadow-2xl overflow-hidden z-50">
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#050608]/50 border-r-0">
                <h3 className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                  Inbox Triggers
                  <Zap className="w-3.5 h-3.5 text-[#F5B942]" />
                </h3>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-[10px] font-semibold text-[#22D3EE] hover:underline">
                    Mark read
                  </button>
                )}
              </div>
              <div className="divide-y divide-white/5 max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[#94A3B8]">No current alerts</div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={`p-3.5 transition-colors flex gap-3 text-xs ${
                        n.read ? "bg-transparent opacity-60" : "bg-[#6D5EF8]/5"
                      }`}
                    >
                      {n.type === "danger" && <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />}
                      {n.type === "warning" && <Clock className="w-4 h-4 text-[#F5B942] shrink-0 mt-0.5" />}
                      {n.type === "success" && <CheckCircle className="w-4 h-4 text-[#22D3EE] shrink-0 mt-0.5" />}
                      <p className="text-[#F8FAFC] leading-normal">{n.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar / Quick Profile Link */}
        <div ref={profileMenuRef} className="relative flex items-center gap-2 pl-2 border-l border-[#0e111b]">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-9 h-9 rounded-full overflow-hidden border border-[#6D5EF8]/30 hover:border-[#6D5EF8]/80 hover:scale-105 transition-all shadow-md focus:outline-none focus:ring-1 focus:ring-[#6D5EF8]/50 cursor-pointer flex items-center justify-center bg-[#0e111b]"
            aria-label="Toggle profile menu"
          >
            <img 
              src={profile.avatar} 
              alt={profile.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                style={{ width: "290px" }}
                className={`absolute right-0 top-full mt-3 border rounded-2xl overflow-hidden z-50 py-1.5 shadow-2xl ${
                  activeTheme === "light"
                    ? "bg-white border-slate-200 text-slate-800"
                    : activeTheme === "purple"
                    ? "bg-[#1B142C] border-purple-500/20 text-[#FAF5FF]"
                    : activeTheme === "forest"
                    ? "bg-[#0E2A1E] border-emerald-500/20 text-[#F0FDF4]"
                    : activeTheme === "ocean"
                    ? "bg-[#112240] border-blue-500/20 text-[#F0F8FF]"
                    : activeTheme === "sunset"
                    ? "bg-[#2A1414] border-orange-500/20 text-[#FFF7ED]"
                    : "bg-[#0c0f17] border-white/10 text-[#F8FAFC]"
                }`}
              >
                {/* Header info */}
                <div className={`px-4 py-3 border-b ${
                  activeTheme === "light"
                    ? "border-slate-100 bg-slate-50 text-slate-800"
                    : "border-white/5 bg-[#050608]/40 text-white"
                }`}>
                  <p className="text-[10px] text-[#94A3B8] font-semibold font-sans uppercase tracking-wider">Signed in as</p>
                  <p className="text-sm font-bold truncate font-sans mt-0.5">{profile.name}</p>
                  <p className="text-[10px] font-mono text-[#22D3EE] uppercase tracking-wider mt-0.5 font-medium">
                    {(profile as any).role || "Tactical Time Strategist"}
                  </p>
                </div>

                {/* Dropdown Items */}
                <div className="py-1">
                  <button
                    onClick={() => {
                      onNavigateToPage?.("profile");
                      setIsProfileOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 text-xs font-semibold flex items-center gap-3 transition-colors text-left ${
                      activeTheme === "light"
                        ? "hover:bg-slate-100 text-slate-700 hover:text-slate-900"
                        : "hover:bg-white/5 text-[#94A3B8] hover:text-white"
                    }`}
                  >
                    <User className="w-4 h-4 text-[#6D5EF8]" />
                    <span>👤 My Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      onNavigateToPage?.("profile");
                      setIsProfileOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 text-xs font-semibold flex items-center gap-3 transition-colors text-left ${
                      activeTheme === "light"
                        ? "hover:bg-slate-100 text-slate-700 hover:text-slate-900"
                        : "hover:bg-white/5 text-[#94A3B8] hover:text-white"
                    }`}
                  >
                    <Pencil className="w-4 h-4 text-[#22D3EE]" />
                    <span>✏️ Edit Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      onNavigateToPage?.("settings");
                      setIsProfileOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 text-xs font-semibold flex items-center gap-3 transition-colors text-left ${
                      activeTheme === "light"
                        ? "hover:bg-slate-100 text-slate-700 hover:text-slate-900"
                        : "hover:bg-white/5 text-[#94A3B8] hover:text-white"
                    }`}
                  >
                    <Paintbrush className="w-4 h-4 text-pink-500" />
                    <span>🎨 Themes</span>
                  </button>

                  <button
                    onClick={() => {
                      onNavigateToPage?.("settings");
                      setIsProfileOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 text-xs font-semibold flex items-center gap-3 transition-colors text-left ${
                      activeTheme === "light"
                        ? "hover:bg-slate-100 text-slate-700 hover:text-slate-900"
                        : "hover:bg-white/5 text-[#94A3B8] hover:text-white"
                    }`}
                  >
                    <Bell className="w-4 h-4 text-[#F5B942]" />
                    <span>🔔 Notifications</span>
                  </button>

                  <button
                    onClick={() => {
                      onNavigateToPage?.("settings");
                      setIsProfileOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 text-xs font-semibold flex items-center gap-3 transition-colors text-left ${
                      activeTheme === "light"
                        ? "hover:bg-slate-100 text-slate-700 hover:text-slate-900"
                        : "hover:bg-white/5 text-[#94A3B8] hover:text-white"
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>🤖 AI Preferences</span>
                  </button>

                  <button
                    onClick={() => {
                      onNavigateToPage?.("settings");
                      setIsProfileOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 text-xs font-semibold flex items-center gap-3 transition-colors text-left ${
                      activeTheme === "light"
                        ? "hover:bg-slate-100 text-slate-700 hover:text-slate-900"
                        : "hover:bg-white/5 text-[#94A3B8] hover:text-white"
                    }`}
                  >
                    <Settings className="w-4 h-4 text-[#94A3B8]" />
                    <span>⚙️ Settings</span>
                  </button>
                </div>

                <div className={`border-t mt-1 pt-1 ${
                  activeTheme === "light" ? "border-slate-100" : "border-white/5"
                }`}>
                  <button
                    onClick={() => {
                      onLogOut?.();
                      setIsProfileOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 text-xs font-semibold flex items-center gap-3 transition-colors text-left text-red-400 hover:bg-red-500/10 hover:text-red-300`}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>🚪 Log Out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </header>
  );
}
