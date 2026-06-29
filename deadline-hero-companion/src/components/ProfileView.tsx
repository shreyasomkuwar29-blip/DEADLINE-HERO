import React, { useState } from "react";
import { 
  Award, 
  Flame, 
  Settings, 
  Calendar, 
  ShieldCheck, 
  Bell, 
  CheckCircle, 
  Cpu, 
  User, 
  Mail,
  Zap,
  Lock,
  ExternalLink
} from "lucide-react";
import { UserProfile, Achievement, Task } from "../types";

interface ProfileViewProps {
  profile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  achievements: Achievement[];
  tasks: Task[];
}

export default function ProfileView({
  profile,
  onUpdateProfile,
  achievements,
  tasks
}: ProfileViewProps) {
  const [activeTab, setActiveTab] = useState<"preferences" | "achievements" | "integrations">("preferences");
  
  const handleConnectCalendar = () => {
    onUpdateProfile({ connectedGoogleCalendar: !profile.connectedGoogleCalendar });
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  const getMotivationalStatus = () => {
    if (!tasks || tasks.length === 0) {
      return "🚀 Welcome to Deadline Hero. Let's achieve something great.";
    }

    const incompleteTasks = tasks.filter(t => t.status !== "completed");
    if (incompleteTasks.length === 0) {
      return "🎉 All missions completed. Amazing work!";
    }

    if (profile.streakCount && profile.streakCount > 0) {
      return `🔥 ${profile.streakCount}-day streak! Keep the momentum going.`;
    }

    return "⚡ Stay focused. Your next mission is waiting.";
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#F8FAFC]">
      
      {/* 1. Profile Core Card with Glow Backdrop */}
      <div className="bg-[#0e111b] border border-white/5 rounded-[24px] p-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 left-0 w-44 h-44 bg-[#6D5EF8]/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
        
        <div className="flex flex-col md:flex-row items-center gap-5 z-10">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#6D5EF8]/60 shadow-xl">
              <img 
                src={profile.avatar} 
                alt={profile.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#22D3EE] flex items-center justify-center text-black shadow shadow-[#22D3EE]/50">
              <Zap className="w-3.5 h-3.5 fill-black" />
            </div>
          </div>

          <div className="text-center md:text-left">
            <h2 className="font-display font-bold text-2xl text-white tracking-tight">{profile.name}</h2>
            <p className="text-xs font-medium text-[#22D3EE] mt-1 flex items-center justify-center md:justify-start gap-1.5 font-sans">
              {getMotivationalStatus()}
            </p>
            <div className="flex items-center gap-1.5 justify-center md:justify-start mt-2.5">
              <span className="text-[10px] bg-[#6D5EF8]/10 border border-[#6D5EF8]/25 text-[#22D3EE] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Hero Tier Gold
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Streak widget */}
        <div className="bg-[#050608] border border-white/5 rounded-2xl p-4 flex items-center gap-4.5 z-10 shrink-0 self-stretch md:self-auto justify-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#F5B942] to-red-500 flex items-center justify-center shadow-lg shadow-[#F5B942]/10">
            <Flame className="w-5.5 h-5.5 text-white fill-white" />
          </div>
          <div>
            <span className="text-[9px] text-[#94A3B8] font-bold block uppercase tracking-wider leading-none">Streaks Index</span>
            <span className="text-base font-mono font-bold text-white block mt-1">{profile.streakCount} Days Active</span>
          </div>
        </div>
      </div>

      {/* 2. Secondary Tab headers */}
      <div className="flex border-b border-[#0e111b] pb-3 gap-2 overflow-x-auto">
        {(["preferences", "achievements", "integrations"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all capitalize cursor-pointer shrink-0 ${
              activeTab === tab 
                ? "bg-[#0e111b] text-[#22D3EE]" 
                : "text-[#94A3B8] hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 3. Tab contents displays */}
      
      {/* PREFERENCES CONFIGS */}
      {activeTab === "preferences" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="bg-[#0e111b] border border-white/5 rounded-[24px] p-6 space-y-5">
            <div>
              <h3 className="font-display font-semibold text-base text-white">Assistant Presets</h3>
              <p className="text-xs text-[#94A3B8] mt-0.5">Customize your Hero AI model behaviors.</p>
            </div>
 
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block">Cognitive Personality mode</label>
                <select
                  value={profile.preferences.heroPersonality}
                  onChange={(e) => {
                    onUpdateProfile({
                      preferences: {
                        ...profile.preferences,
                        heroPersonality: e.target.value as any
                      }
                    });
                  }}
                  className="w-full bg-[#050608] border border-white/5 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none"
                >
                  <option value="supportive">Coach Supportive (Encouraging, empathetic)</option>
                  <option value="tough_love">Tough Love (Direct, zero-excuses)</option>
                  <option value="strategist">Tactical Strategist (Objective schedule solver)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block">Focus Soundscape Preset</label>
                <select
                  value={profile.preferences.focusTheme}
                  onChange={(e) => {
                    onUpdateProfile({
                      preferences: {
                        ...profile.preferences,
                        focusTheme: e.target.value as any
                      }
                    });
                  }}
                  className="w-full bg-[#050608] border border-white/5 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none"
                >
                  <option value="space">🌌 Deep Space Waves (Synthesizer beats)</option>
                  <option value="ocean">🌊 Binary Resonance (528Hz Ocean tides)</option>
                  <option value="forest">🍃 Zen Rain (Binaural nature drops)</option>
                  <option value="zen">🧘 Minimal Calm (Bells and silence)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-[#0e111b] border border-white/5 rounded-[24px] p-6 space-y-5">
            <div>
              <h3 className="font-display font-semibold text-base text-white">Daily Alerts Parameters</h3>
              <p className="text-xs text-[#94A3B8] mt-0.5">Fine-tune dynamic proactive warning intervals.</p>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#94A3B8]">Alert notification check interval</span>
                  <span className="text-[#22D3EE] font-bold">{profile.preferences.notifInterval}m</span>
                </div>
                <input 
                  type="range" 
                  min={15}
                  max={120}
                  step={15}
                  value={profile.preferences.notifInterval}
                  onChange={(e) => {
                    onUpdateProfile({
                      preferences: {
                        ...profile.preferences,
                        notifInterval: Number(e.target.value)
                      }
                    });
                  }}
                  className="w-full accent-[#22D3EE] cursor-pointer mt-1"
                />
              </div>

              <div className="bg-[#050608] border border-white/5 rounded-xl p-4 flex gap-3 text-xs text-[#94A3B8] leading-normal">
                <Bell className="w-4 h-4 text-[#22D3EE] shrink-0 mt-0.5" />
                <p>
                  Proactive checks are run every {profile.preferences.notifInterval} minutes. The engine evaluates calendar overlays and notifies you via the inbox popover.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ACHIEVEMENTS GRID */}
      {activeTab === "achievements" && (
        <div className="bg-[#0e111b] border border-white/5 rounded-[24px] p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold text-base text-white">Cognitive Badges</h3>
              <p className="text-xs text-[#94A3B8] mt-0.5">Unlock rewards for consistency and secure health scoring.</p>
            </div>
            <span className="text-xs font-mono text-[#22D3EE] bg-[#22D3EE]/10 border border-[#22D3EE]/25 px-2.5 py-1 rounded font-bold uppercase">
              {unlockedCount} / {achievements.length} UNLOCKED
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
            {achievements.map((a) => (
              <div 
                key={a.id}
                className={`border rounded-2xl p-4.5 flex flex-col justify-between min-h-[140px] relative transition-all group ${
                  a.unlocked 
                    ? "bg-[#0e111b] border-[#6D5EF8]/20 hover:border-[#6D5EF8]/40" 
                    : "bg-[#050608]/50 border-white/5 opacity-50"
                }`}
              >
                {/* Achievement Icon */}
                <div className="flex items-center justify-between">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    a.unlocked ? "bg-[#6D5EF8]/10 text-[#22D3EE] glow-accent" : "bg-[#0e111b] text-[#94A3B8]"
                  }`}>
                    {a.unlocked ? <Award className="w-5 h-5 animate-pulse" /> : <Lock className="w-4.5 h-4.5" />}
                  </div>
                  {a.unlocked && (
                    <span className="text-[8px] bg-green-500/10 border border-green-500/20 text-green-400 font-mono font-black px-1.5 py-0.5 rounded uppercase">
                      ACTIVE
                    </span>
                  )}
                </div>

                <div className="mt-4">
                  <h4 className="text-xs font-display font-bold text-white leading-snug">{a.title}</h4>
                  <p className="text-[10px] text-[#94A3B8] leading-relaxed mt-1 font-medium">{a.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EXTERNAL INTEGRATIONS */}
      {activeTab === "integrations" && (
        <div className="bg-[#0e111b] border border-white/5 rounded-[24px] p-6 space-y-6">
          <div>
            <h3 className="font-display font-semibold text-base text-white">API Core Integrations</h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">Connect to your third-party calendar providers.</p>
          </div>

          <div className="border border-white/5 rounded-2xl p-4.5 bg-[#050608]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[#94A3B8]">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                <Calendar className="w-5.5 h-5.5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Google Calendar Synchronizer</span>
                <span className="text-[10px] text-[#94A3B8] leading-normal block mt-0.5">
                  Import academic blocks, personal routines, and sync deadlines back to your phone.
                </span>
              </div>
            </div>

            <button
              onClick={handleConnectCalendar}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                profile.connectedGoogleCalendar 
                  ? "bg-[#22D3EE]/10 hover:bg-[#22D3EE]/20 border-[#22D3EE]/25 text-[#22D3EE]" 
                  : "bg-[#6D5EF8] hover:bg-[#6D5EF8]/90 text-white border-transparent shadow-md shadow-[#6D5EF8]/10"
              }`}
            >
              {profile.connectedGoogleCalendar ? `Synchronized (${profile.email})` : "Connect Google Calendar"}
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
