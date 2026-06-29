import React, { useState, useEffect } from "react";
import { 
  User, 
  Camera, 
  Bell, 
  Calendar, 
  Sparkles, 
  Paintbrush, 
  Cpu, 
  CheckCircle, 
  Moon, 
  Sun, 
  Trees, 
  Compass, 
  Sunset, 
  ShieldCheck, 
  Clock, 
  Volume2, 
  Lock, 
  Code
} from "lucide-react";
import { UserProfile } from "../types";

interface SettingsViewProps {
  profile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  activeTheme: string;
  onChangeTheme: (theme: string) => void;
  onAiSync: () => void;
}

const AVATAR_PRESETS = [
  { url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80", label: "Midnight Amethyst" },
  { url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80", label: "Retro Cobalt" },
  { url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80", label: "Cyber Emerald" },
  { url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80", label: "Ember Amber" },
  { url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80", label: "Neon Quartz" }
];

const THEME_OPTIONS = [
  { id: "dark", label: "Dark Mode", emoji: "🌙", description: "Default space obsidian canvas", color: "from-[#181C25] to-[#0F1117] border-[#6D5EF8]/30" },
  { id: "light", label: "Light Mode", emoji: "☀️", description: "Pure high-contrast clean slate", color: "from-[#FFFFFF] to-[#F4F6F9] border-slate-200" },
  { id: "purple", label: "Purple Theme", emoji: "💜", description: "Mystic crystal amethyst energy", color: "from-[#1B142C] to-[#120D1E] border-purple-500/30" },
  { id: "forest", label: "Forest Theme", emoji: "💚", description: "Lush botanical emerald breeze", color: "from-[#0E2A1E] to-[#091A13] border-emerald-500/30" },
  { id: "ocean", label: "Ocean Theme", emoji: "🌊", description: "Deep seaside abyssal calmness", color: "from-[#112240] to-[#0A192F] border-blue-500/30" },
  { id: "sunset", label: "Sunset Theme", emoji: "🌅", description: "Warm amber twilight twilight", color: "from-[#2A1414] to-[#1C0D0D] border-orange-500/30" }
];

export default function SettingsView({ 
  profile, 
  onUpdateProfile, 
  activeTheme, 
  onChangeTheme, 
  onAiSync 
}: SettingsViewProps) {
  const [nameInput, setNameInput] = useState(profile.name);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [connectedCalendar, setConnectedCalendar] = useState(profile.connectedGoogleCalendar ?? true);
  const [personality, setPersonality] = useState(profile.preferences.heroPersonality ?? "supportive");

  useEffect(() => {
    setNameInput(profile.name);
  }, [profile.name]);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      onUpdateProfile({ name: nameInput.trim() });
    }
  };

  const handleSelectAvatar = (url: string) => {
    onUpdateProfile({ avatar: url });
    setShowAvatarPicker(false);
  };

  const handleToggleCalendar = () => {
    const nextVal = !connectedCalendar;
    setConnectedCalendar(nextVal);
    onUpdateProfile({ connectedGoogleCalendar: nextVal });
  };

  const handleChangePersonality = (p: "supportive" | "strategist" | "tough_love") => {
    setPersonality(p);
    onUpdateProfile({
      preferences: {
        ...profile.preferences,
        heroPersonality: p
      }
    });
  };

  return (
    <div className="space-y-8 animate-fade-in text-[#F8FAFC]">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight text-white flex items-center gap-2.5">
            System Control Center
          </h2>
          <p className="text-sm text-[#94A3B8] mt-1.5 font-sans">
            Customize {profile.name}'s profile, Connected Calendar, AI parameters, and systemic theme appearances.
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-[#181C25]/50 border border-white/5 px-3.5 py-1.5 rounded-xl self-start">
          <div className="w-2 h-2 rounded-full bg-[#22D3EE] animate-pulse" />
          <span className="font-mono text-[10px] font-bold text-[#22D3EE] uppercase tracking-wider">Synced State</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT PROFILE & CUSTOMIZATION OPTIONS (col-span-8) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* PROFILE CARD & NAME SETTING */}
          <div className="bg-[#181C25] border border-white/5 rounded-[24px] p-6 space-y-6 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#6D5EF8]/5 rounded-full blur-3xl pointer-events-none" />
            
            <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
              <User className="w-4.5 h-4.5 text-[#6D5EF8]" />
              Hero Identity Settings
            </h3>

            <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-2">
              {/* Profile Avatar Trigger */}
              <div className="relative group self-center sm:self-auto">
                <div className="w-22 h-22 rounded-full overflow-hidden border-2 border-[#6D5EF8] shadow-lg shadow-[#6D5EF8]/10 bg-[#0F1117] relative">
                  <img 
                    src={profile.avatar} 
                    alt={profile.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  {/* Photo Edit overlay */}
                  <button 
                    onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[10px] font-bold text-white uppercase cursor-pointer"
                  >
                    <Camera className="w-4 h-4 mb-0.5 text-[#22D3EE]" />
                    Modify
                  </button>
                </div>
              </div>

              {/* Edit name input */}
              <form onSubmit={handleSaveName} className="flex-1 space-y-3.5">
                <div>
                  <label className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-widest block mb-1.5">What should we call you?</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="Enter hero name..."
                      className="flex-1 bg-[#0F1117] border border-white/5 focus:border-[#6D5EF8]/50 rounded-xl px-4 py-2.5 text-xs text-[#F8FAFC] focus:outline-none transition-all placeholder-[#94A3B8]/30 font-medium"
                    />
                    <button 
                      type="submit"
                      className="bg-[#6D5EF8] hover:bg-[#6D5EF8]/90 text-white px-5 rounded-xl text-xs font-bold transition-all cursor-pointer border border-white/10"
                    >
                      Update Name
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Avatar selector popup/drawer */}
            {showAvatarPicker && (
              <div className="bg-[#0F1117] border border-white/5 rounded-2xl p-4.5 space-y-3 animate-fade-in">
                <span className="text-[10px] text-[#22D3EE] font-mono font-bold uppercase tracking-wider block">Select Preset Identity Avatar</span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {AVATAR_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectAvatar(preset.url)}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all cursor-pointer hover:border-[#6D5EF8]/50 ${
                        profile.avatar === preset.url ? "bg-[#6D5EF8]/10 border-[#6D5EF8]" : "bg-[#181C25] border-transparent"
                      }`}
                    >
                      <img src={preset.url} alt={preset.label} className="w-10 h-10 rounded-full object-cover" />
                      <span className="text-[9px] text-[#94A3B8] truncate w-full text-center font-medium">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CHOOSE SYSTEM APPEARANCE & COLOR THEME */}
          <div className="bg-[#181C25] border border-white/5 rounded-[24px] p-6 space-y-5">
            <div>
              <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                <Paintbrush className="w-4.5 h-4.5 text-[#22D3EE]" />
                Appearance Theme Engine
              </h3>
              <p className="text-xs text-[#94A3B8] mt-0.5">Select your visual preset workspace. Applied globally across widgets immediately.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4.5">
              {THEME_OPTIONS.map((theme) => {
                const isSelected = activeTheme === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => onChangeTheme(theme.id)}
                    className={`p-4 rounded-2xl border text-left bg-gradient-to-br transition-all relative overflow-hidden group cursor-pointer ${theme.color} ${
                      isSelected 
                        ? "shadow-lg scale-[1.02] ring-1 ring-white/10" 
                        : "opacity-75 hover:opacity-100 hover:scale-[1.01]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-2xl filter drop-shadow">{theme.emoji}</span>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#6D5EF8] to-[#22D3EE] flex items-center justify-center text-white text-[8px] font-bold">
                          ✓
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-bold text-white block mt-2 group-hover:text-[#22D3EE] transition-colors">{theme.label}</span>
                    <span className="text-[10px] text-[#94A3B8] leading-tight block mt-0.5">{theme.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SYSTEM NOTIFICATION AND CALENDAR SWITCHES */}
          <div className="bg-[#181C25] border border-white/5 rounded-[24px] p-6 space-y-5">
            <div>
              <h3 className="font-display font-semibold text-base text-white flex items-center gap-2">
                <Bell className="w-4.5 h-4.5 text-[#F5B942]" />
                Connected Integrations
              </h3>
              <p className="text-xs text-[#94A3B8] mt-0.5">Automated synchronization triggers with third-party channels.</p>
            </div>

            <div className="space-y-4 divide-y divide-white/5">
              {/* Push Notifs */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <span className="text-xs font-bold text-white block">System Push Warnings</span>
                  <span className="text-[11px] text-[#94A3B8] block mt-0.5">Let the browser flash alert banners whenever threat scores spike.</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={notifEnabled}
                  onChange={() => setNotifEnabled(!notifEnabled)}
                  className="w-10 h-5 bg-[#0F1117] rounded-full appearance-none checked:bg-[#22D3EE] relative after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:bg-white after:rounded-full checked:after:translate-x-5 after:transition-all cursor-pointer border border-white/10"
                />
              </div>

              {/* Connected Calendars */}
              <div className="flex items-center justify-between pt-3">
                <div>
                  <span className="text-xs font-bold text-white block">Connected Calendar (Google Calendar Spec)</span>
                  <span className="text-[11px] text-[#94A3B8] block mt-0.5">Dynamically sync active high-risk deadlines to calendar timelines.</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={connectedCalendar}
                  onChange={handleToggleCalendar}
                  className="w-10 h-5 bg-[#0F1117] rounded-full appearance-none checked:bg-[#22D3EE] relative after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:bg-white after:rounded-full checked:after:translate-x-5 after:transition-all cursor-pointer border border-white/10"
                />
              </div>
            </div>
          </div>

          {/* AI COMPANION PROFILE PERSONALITY */}
          <div className="bg-[#181C25] border border-white/5 rounded-[24px] p-6 space-y-4">
            <div>
              <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-[#6D5EF8]" />
                AI Hero Personality Profile
              </h3>
              <p className="text-xs text-[#94A3B8] mt-0.5">Select how you want your floating companion to guide your deadline tasks.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Supportive */}
              <button
                onClick={() => handleChangePersonality("supportive")}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  personality === "supportive" 
                    ? "bg-[#6D5EF8]/10 border-[#6D5EF8]" 
                    : "bg-[#0F1117] border-white/5 hover:border-[#6D5EF8]/30"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">🌸</span>
                  <span className="text-xs font-bold text-white">Supportive</span>
                </div>
                <p className="text-[10px] text-[#94A3B8] leading-normal">Optimistic encouragement, warm suggestions, dynamic praise.</p>
              </button>

              {/* Strategist */}
              <button
                onClick={() => handleChangePersonality("strategist")}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  personality === "strategist" 
                    ? "bg-[#22D3EE]/10 border-[#22D3EE]" 
                    : "bg-[#0F1117] border-white/5 hover:border-[#22D3EE]/30"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">🧠</span>
                  <span className="text-xs font-bold text-white">Strategist</span>
                </div>
                <p className="text-[10px] text-[#94A3B8] leading-normal">Data-focused, buffer optimization analysis, chronological logs.</p>
              </button>

              {/* Tough Love */}
              <button
                onClick={() => handleChangePersonality("tough_love")}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  personality === "tough_love" 
                    ? "bg-red-500/10 border-red-500" 
                    : "bg-[#0F1117] border-white/5 hover:border-red-500/30"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">⚡</span>
                  <span className="text-xs font-bold text-white">Tough Love</span>
                </div>
                <p className="text-[10px] text-[#94A3B8] leading-normal">No excuses execution coaching. High accountability urgency.</p>
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT SYSTEM DIAGNOSTICS COLUMN (col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-[#181C25] border border-white/5 rounded-[24px] p-5.5 space-y-4 shadow-xl">
            <h4 className="font-display font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-[#6D5EF8]" />
              Diagnostics Core
            </h4>
            
            <div className="space-y-3.5 text-xs text-[#94A3B8]">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span>App version</span>
                <span className="font-mono text-white font-bold">V1.5.0-PREMIUM</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span>Deployment container</span>
                <span className="font-mono text-[#22D3EE] font-bold">Google Cloud Run</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span>Database persistence</span>
                <span className="font-mono text-white font-bold">Local Sync Store</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Active Theme</span>
                <span className="font-mono text-white uppercase font-bold text-[#F5B942]">{activeTheme}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#181C25] border border-white/5 rounded-[24px] p-5.5 text-xs text-[#94A3B8] leading-relaxed flex items-start gap-2.5 shadow-md">
            <Code className="w-4.5 h-4.5 text-[#22D3EE] shrink-0 mt-0.5" />
            <p>
              Deadline Hero is calibrated as an intelligent productivity companion keeping you ahead of your timeline. Theme variations are stored safely in local memory cache.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
