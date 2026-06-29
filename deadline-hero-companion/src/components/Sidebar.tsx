import { 
  LayoutDashboard, 
  CheckSquare, 
  Sparkles, 
  Calendar, 
  BarChart2, 
  Target, 
  User, 
  Settings,
  X,
  Zap,
  ShieldCheck
} from "lucide-react";
import { motion } from "motion/react";
import Logo from "./Logo";

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  isMobileOpen?: boolean;
  onClose?: () => void;
  activeTheme?: string;
}

export default function Sidebar({ activePage, setActivePage, isMobileOpen = false, onClose, activeTheme = "dark" }: SidebarProps) {
  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, emoji: "🏠" },
    { id: "tasks", label: "Tasks", icon: CheckSquare, emoji: "✅" },
    { id: "hero-ai", label: "Hero AI", icon: Sparkles, emoji: "🤖" },
    { id: "calendar", label: "Calendar", icon: Calendar, emoji: "📅" },
    { id: "insights", label: "Insights", icon: BarChart2, emoji: "📊" },
    { id: "focus", label: "Focus Mode", icon: Target, emoji: "🎯" },
    { id: "profile", label: "Profile", icon: User, emoji: "👤" },
    { id: "settings", label: "Settings", icon: Settings, emoji: "⚙️" },
  ];

  const sidebarBgColor = activeTheme === "light" 
    ? "bg-white border-slate-200 text-slate-800" 
    : activeTheme === "purple" 
    ? "bg-[#1B142C] border-purple-500/10 text-[#FAF5FF]" 
    : activeTheme === "forest" 
    ? "bg-[#0E2A1E] border-emerald-500/10 text-[#F0FDF4]" 
    : activeTheme === "ocean" 
    ? "bg-[#112240] border-blue-500/10 text-[#F0F8FF]" 
    : activeTheme === "sunset" 
    ? "bg-[#2A1414] border-orange-500/10 text-[#FFF7ED]" 
    : "bg-[#050608] border-[#0e111b] text-[#F8FAFC]";

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

  const activeBtnClass = activeTheme === "light"
    ? "text-[#6D5EF8] bg-slate-100 border-[#6D5EF8]/30 shadow-sm"
    : activeTheme === "purple"
    ? "text-purple-300 bg-purple-500/10 border-purple-500/30"
    : activeTheme === "forest"
    ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/30"
    : activeTheme === "ocean"
    ? "text-blue-300 bg-blue-500/10 border-blue-500/30"
    : activeTheme === "sunset"
    ? "text-orange-300 bg-orange-500/10 border-orange-500/30"
    : "text-[#F8FAFC] bg-[#0e111b]/80 border-[#6D5EF8]/30 shadow-sm shadow-[#6D5EF8]/5";

  const hoverBtnClass = activeTheme === "light"
    ? "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-transparent"
    : "text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#0e111b]/40 border-transparent";

  const brandTextClass = activeTheme === "light"
    ? "from-[#6D5EF8] via-slate-800 to-slate-900 bg-clip-text text-transparent"
    : "from-white via-[#F8FAFC] to-[#94A3B8] bg-clip-text text-transparent";

  const cardBgClass = activeTheme === "light"
    ? "bg-slate-50 border-slate-200 text-slate-800"
    : "bg-[#0e111b] border-white/5 text-[#F8FAFC]";

  const sidebarContent = (
    <div className={`flex flex-col h-full ${sidebarBgColor} border-r ${borderClass}`}>
      {/* Brand Logo Header */}
      <div className={`p-6 border-b ${borderClass} flex items-center justify-between`}>
        <Logo showText={true} size="md" />
        {onClose && (
          <button 
            onClick={onClose} 
            className={`md:hidden p-1.5 rounded-lg transition-colors border border-transparent hover:border-white/5 ${activeTheme === "light" ? "hover:bg-slate-100" : "hover:bg-[#0e111b]"}`}
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5 text-[#94A3B8]" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <p className="px-3 text-[10px] font-semibold text-[#94A3B8]/60 uppercase tracking-widest mb-3">SYSTEM COMMANDS</p>
        {sidebarItems.map((item) => {
          const isActive = activePage === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActivePage(item.id);
                if (onClose) onClose();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all relative overflow-hidden group ${
                isActive 
                  ? activeBtnClass
                  : hoverBtnClass
              }`}
            >
              <div className="flex items-center gap-3.5 relative z-10">
                <span className="text-base leading-none filter drop-shadow-sm group-hover:scale-110 transition-transform">{item.emoji}</span>
                <Icon className={`w-4 h-4 transition-colors ${isActive ? "text-[#6D5EF8]" : "text-[#94A3B8] group-hover:text-white"}`} />
                <span className="font-sans font-medium tracking-wide">{item.label}</span>
              </div>
              
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-[#22D3EE] glow-accent animate-pulse relative z-10" />
              )}
              
              {/* Soft glowing active indicator background */}
              {isActive && (
                <motion.div 
                  layoutId="activeGlow"
                  className="absolute inset-0 bg-gradient-to-r from-[#6D5EF8]/5 via-[#22D3EE]/0 to-transparent pointer-events-none"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Branding Card */}
      <div className={`p-4 border-t ${borderClass}`}>
        <div className={`p-4 rounded-2xl border relative overflow-hidden group ${cardBgClass}`}>
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#6D5EF8]/10 to-[#22D3EE]/0 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2 h-2 rounded-full bg-[#22D3EE] animate-pulse glow-accent" />
            <span className="text-[10px] font-semibold text-[#22D3EE] tracking-wider uppercase font-mono">Hero Core Active</span>
          </div>
          <p className="text-[11px] text-[#94A3B8] leading-normal font-sans">
            AI scheduler actively guarding <strong>0</strong> immediate deadline risks.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar Layout */}
      <aside className="hidden md:block w-64 h-screen shrink-0 sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop blur clickoff */}
          <div 
            onClick={onClose} 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          />
          <motion.div 
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            className="relative z-10 w-72 h-full"
          >
            {sidebarContent}
          </motion.div>
        </div>
      )}
    </>
  );
}
