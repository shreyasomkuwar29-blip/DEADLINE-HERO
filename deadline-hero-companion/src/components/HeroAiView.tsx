import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Sparkles, 
  Mic, 
  MicOff, 
  Compass, 
  AlertTriangle, 
  CheckCircle,
  HelpCircle,
  Cpu,
  User,
  Zap,
  Info
} from "lucide-react";
import { Message, Task, UserProfile } from "../types";

interface HeroAiViewProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  tasks: Task[];
  profile: UserProfile;
  isAiThinking: boolean;
  onSetAiPersonality: (personality: 'supportive' | 'tough_love' | 'strategist') => void;
  onOpenMissionModal?: (dateStr?: string | null, taskToEdit?: Task | null) => void;
}

export default function HeroAiView({
  messages,
  onSendMessage,
  tasks,
  profile,
  isAiThinking,
  onSetAiPersonality,
  onOpenMissionModal
}: HeroAiViewProps) {
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiThinking]);

  const activePersonality = profile.preferences.heroPersonality ?? "supportive";

  const suggestedPrompts = [
    { text: "What should I do next?", icon: Sparkles, color: "text-[#22D3EE]" },
    { text: "I'm overwhelmed. Plan my day.", icon: AlertTriangle, color: "text-red-400" },
    { text: "Break my resume task into steps.", icon: Compass, color: "text-[#F5B942]" },
    { text: "Give me tough love focus motivation.", icon: Cpu, color: "text-[#6D5EF8]" },
  ];

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isAiThinking) return;
    onSendMessage(inputText);
    setInputText("");
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      setIsListening(false);
      // Mock voice recognized string
      const voiceInputs = [
        "Audit my deadline risk matrices immediately.",
        "Synthesize a study slot for tonight starting at 7 PM.",
        "Suggest key focus routines for tomorrow's work.",
        "Review my completion trend indices."
      ];
      const randomInput = voiceInputs[Math.floor(Math.random() * voiceInputs.length)];
      setInputText(randomInput);
    } else {
      setIsListening(true);
      // Simulate speech detection stopping after 3s
      setTimeout(() => {
        setIsListening(false);
        setInputText("Optimize my focus runs for today's high-priority items.");
      }, 3000);
    }
  };

  const getPersonalityLabel = (type: string) => {
    if (type === "supportive") return "Empathetic companion";
    if (type === "tough_love") return "Tough Love Executor";
    return "Tactical Strategist";
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-[calc(100vh-120px)] animate-fade-in text-[#F8FAFC]">
      
      {/* LEFT COLUMN: Main Chat Assistant Panel (xl:col-span-8) */}
      <div className="xl:col-span-8 flex flex-col bg-[#0e111b] border border-white/5 rounded-[24px] overflow-hidden h-full">
        
        {/* Chat Header */}
        <div className="p-4.5 border-b border-white/5 flex items-center justify-between bg-[#050608]/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6D5EF8]/10 border border-[#6D5EF8]/30 flex items-center justify-center text-[#6D5EF8]">
              <Sparkles className="w-5 h-5 animate-pulse text-[#22D3EE]" />
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-white">Hero AI Companion</h3>
              <p className="text-[10px] text-[#94A3B8] font-mono uppercase tracking-wider mt-0.5">
                Mode: <strong className="text-[#22D3EE]">{getPersonalityLabel(activePersonality)}</strong>
              </p>
            </div>
          </div>
          
          {/* Quick instructions indicator */}
          <div className="flex items-center gap-1.5 bg-[#050608] border border-white/5 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-[#94A3B8]">
            <Info className="w-3.5 h-3.5 text-[#22D3EE]" /> Context sync active
          </div>
        </div>

        {/* Messages list view */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 scrollbar">
          {tasks.length === 0 && messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-6">
              {/* Dynamic glowing AI Orb in center */}
              <div className="relative w-24 h-24 flex items-center justify-center">
                {/* Glowing ring effects */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#6D5EF8] via-[#22D3EE] to-[#F5B942] rounded-full blur-xl opacity-60 animate-pulse-glow" />
                <div className="absolute inset-1.5 bg-[#050608] rounded-full" />
                <div className="absolute inset-3 bg-gradient-to-tr from-[#6D5EF8] to-[#22D3EE] rounded-full flex items-center justify-center shadow-inner group cursor-pointer">
                  <Sparkles className="w-6 h-6 text-white animate-spin-slow" />
                </div>
              </div>

              <div>
                <h4 className="font-display font-bold text-xl text-white">Hi {profile.name}! 👋</h4>
                <p className="text-sm font-bold text-[#22D3EE] mt-1.5">Welcome to Deadline Hero.</p>
                <p className="text-xs text-[#94A3B8] leading-relaxed mt-2 font-sans font-medium">
                  Let's create your first mission together.
                </p>
              </div>

              <button
                onClick={() => onOpenMissionModal?.(null, null)}
                className="bg-gradient-to-r from-[#6D5EF8] to-[#22D3EE] hover:brightness-110 active:scale-95 text-white px-6 py-3.5 rounded-xl text-xs font-black tracking-widest uppercase shadow-lg shadow-[#6D5EF8]/20 transition-all cursor-pointer border border-white/10 flex items-center gap-2 mx-auto"
              >
                ✨ Create My First Mission
              </button>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-6">
              
              {/* Dynamic glowing AI Orb in center */}
              <div className="relative w-24 h-24 flex items-center justify-center">
                {/* Glowing ring effects */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#6D5EF8] via-[#22D3EE] to-[#F5B942] rounded-full blur-xl opacity-60 animate-pulse-glow" />
                <div className="absolute inset-1.5 bg-[#050608] rounded-full" />
                <div className="absolute inset-3 bg-gradient-to-tr from-[#6D5EF8] to-[#22D3EE] rounded-full flex items-center justify-center shadow-inner group cursor-pointer">
                  <Sparkles className="w-6 h-6 text-white animate-spin-slow" />
                </div>
              </div>

              <div>
                <h4 className="font-display font-bold text-xl text-white">Ask anything, conquer everything.</h4>
                <p className="text-xs text-[#94A3B8] leading-relaxed mt-2 font-sans font-medium">
                  I am synchronized with your active deadlines, focus averages, and current calendar. Tell me what needs to get done, and I will construct the ultimate strategy.
                </p>
              </div>

              {/* Suggestion Prompts grids */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full pt-4">
                {suggestedPrompts.map((p, idx) => {
                  const PromIcon = p.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => onSendMessage(p.text)}
                      className="bg-[#050608] hover:bg-[#0e111b]/80 border border-white/5 hover:border-[#6D5EF8]/30 rounded-xl p-3.5 text-left transition-all group cursor-pointer"
                    >
                      <PromIcon className={`w-4 h-4 mb-1.5 ${p.color}`} />
                      <span className="text-[11px] font-sans font-semibold text-white group-hover:text-[#22D3EE] block leading-snug">
                        {p.text}
                      </span>
                    </button>
                  );
                })}
              </div>

            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((m) => {
                const isHero = m.sender === "hero";
                return (
                  <div key={m.id} className={`flex items-start gap-3.5 ${isHero ? "" : "flex-row-reverse"}`}>
                    
                    {/* Avatar Icon */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      isHero 
                        ? "bg-[#6D5EF8]/10 border-[#6D5EF8]/30 text-[#22D3EE]" 
                        : "bg-[#0e111b] border-white/5 text-white"
                    }`}>
                      {isHero ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>

                    {/* Chat Bubble content */}
                    <div className={`max-w-[80%] rounded-[20px] p-4 text-xs font-sans font-medium leading-relaxed shadow-lg ${
                      isHero 
                        ? "bg-[#0e111b] border border-white/5 text-[#F8FAFC]" 
                        : "bg-[#6D5EF8] text-white"
                    }`}>
                      {/* Formatted output helper */}
                      <p className="whitespace-pre-wrap">{m.text}</p>
                    </div>

                  </div>
                );
              })}

              {/* Loader indicator while thinking */}
              {isAiThinking && (
                <div className="flex items-start gap-3.5 animate-pulse">
                  <div className="w-9 h-9 rounded-xl bg-[#6D5EF8]/10 border border-[#6D5EF8]/30 flex items-center justify-center text-[#22D3EE] shrink-0">
                    <Sparkles className="w-4 h-4 animate-spin text-[#22D3EE]" />
                  </div>
                  <div className="bg-[#0e111b] border border-white/5 rounded-[20px] p-4 text-xs text-[#94A3B8] font-mono flex items-center gap-2">
                    <div className="flex space-x-1 items-center">
                      <div className="w-1.5 h-1.5 bg-[#22D3EE] rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-[#22D3EE] rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-[#22D3EE] rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                    Working on it...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Audio Visualizer line on Voice active */}
        {isListening && (
          <div className="h-6 bg-[#6D5EF8]/10 px-6 flex items-center gap-2.5 text-[10px] text-[#22D3EE] font-mono border-t border-white/5">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
            Voice capture streaming active:
            <div className="flex space-x-0.5 items-center flex-1 max-w-[200px]">
              <div className="h-3 w-0.5 bg-[#22D3EE] animate-pulse" />
              <div className="h-2 w-0.5 bg-[#22D3EE] animate-pulse [animation-delay:0.1s]" />
              <div className="h-4 w-0.5 bg-[#22D3EE] animate-pulse [animation-delay:0.2s]" />
              <div className="h-1 w-0.5 bg-[#22D3EE] animate-pulse [animation-delay:0.3s]" />
              <div className="h-3.5 w-0.5 bg-[#22D3EE] animate-pulse [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-[#050608]/30 flex items-center gap-3">
          <button
            type="button"
            onClick={toggleVoiceInput}
            className={`p-3 border border-white/5 rounded-xl transition-all cursor-pointer ${
              isListening ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-[#0e111b] hover:border-[#6D5EF8]/30 text-[#94A3B8]"
            }`}
            title="Toggle Voice dictation"
          >
            {isListening ? <MicOff className="w-4 h-4 animate-bounce" /> : <Mic className="w-4 h-4" />}
          </button>

          <input 
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isAiThinking}
            placeholder={isListening ? "Listening to speak..." : "Inquire schedule changes, ask for tips, prioritize work..."}
            className="flex-1 bg-[#0e111b] border border-white/5 focus:border-[#6D5EF8]/50 focus:outline-none rounded-xl px-4 py-3 text-xs text-[#F8FAFC] placeholder-[#94A3B8]/40 transition-all disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isAiThinking}
            className="bg-[#6D5EF8] hover:bg-[#6D5EF8]/90 text-white p-3.5 rounded-xl transition-all shadow-lg shadow-[#6D5EF8]/10 cursor-pointer disabled:opacity-40 border border-white/5 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

      {/* RIGHT COLUMN: AI Configuration Side Panel (xl:col-span-4) */}
      <div className="xl:col-span-4 space-y-6 flex flex-col justify-between">
        
        {/* PERSONALITY SELECTION CARD */}
        <div className="bg-[#0e111b] border border-white/5 rounded-[24px] p-6 space-y-5">
          <div>
            <h4 className="font-display font-bold text-sm text-white">AI Core Mode</h4>
            <p className="text-xs text-[#94A3B8] mt-1 leading-normal">
              Re-calibrate the proactive companion's verbal and strategic feedback style.
            </p>
          </div>

          <div className="space-y-3.5">
            {/* SUPPORTIVE MODE */}
            <button
              onClick={() => onSetAiPersonality("supportive")}
              className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-start gap-3.5 group cursor-pointer ${
                activePersonality === "supportive" 
                  ? "bg-[#6D5EF8]/10 border-[#6D5EF8]/40" 
                  : "bg-[#050608] border-white/5 hover:border-white/10"
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Supportive Coach</span>
                <span className="text-[10px] text-[#94A3B8] leading-normal block mt-0.5">
                  High empathy, supportive breakdowns, reduces deadline anxiety.
                </span>
              </div>
            </button>

            {/* TOUGH LOVE MODE */}
            <button
              onClick={() => onSetAiPersonality("tough_love")}
              className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-start gap-3.5 group cursor-pointer ${
                activePersonality === "tough_love" 
                  ? "bg-[#6D5EF8]/10 border-[#6D5EF8]/40" 
                  : "bg-[#050608] border-white/5 hover:border-white/10"
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center shrink-0 mt-0.5">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Tough Love Mode</span>
                <span className="text-[10px] text-[#94A3B8] leading-normal block mt-0.5">
                  No excuses, hyper-focused on raw progress, directly alerts delays.
                </span>
              </div>
            </button>

            {/* STRATEGIST MODE */}
            <button
              onClick={() => onSetAiPersonality("strategist")}
              className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-start gap-3.5 group cursor-pointer ${
                activePersonality === "strategist" 
                  ? "bg-[#6D5EF8]/10 border-[#6D5EF8]/40" 
                  : "bg-[#050608] border-white/5 hover:border-white/10"
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-[#22D3EE]/10 text-[#22D3EE] flex items-center justify-center shrink-0 mt-0.5">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Tactical Strategist</span>
                <span className="text-[10px] text-[#94A3B8] leading-normal block mt-0.5">
                  Calculates hourly schedules mathematically, maximizes output.
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* HERO ANALYTICS QUICK STAT */}
        <div className="bg-[#0e111b] border border-white/5 rounded-[24px] p-5.5 space-y-4">
          <h4 className="font-display font-bold text-xs text-white uppercase tracking-wider">Workspace Sync Matrix</h4>
          
          <div className="space-y-3.5 text-xs text-[#94A3B8]">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span>Active Missions context</span>
              <span className="font-mono text-white font-bold">{tasks.filter(t => t.status !== "completed").length}</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span>Google Calendar status</span>
              <span className="font-mono text-[#22D3EE] font-bold">CONNECTED</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Conversation Turns</span>
              <span className="font-mono text-white font-bold">{messages.length}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
