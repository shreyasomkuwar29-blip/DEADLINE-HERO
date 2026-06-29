import React, { useState } from "react";
import { motion } from "motion/react";
import { Zap, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import Logo from "./Logo";

interface WelcomeViewProps {
  onCompleteOnboarding: (name: string) => void;
}

export default function WelcomeView({ onCompleteOnboarding }: WelcomeViewProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please let us know your name so we can get started!");
      return;
    }
    onCompleteOnboarding(name.trim());
  };

  return (
    <div className="min-h-screen bg-[#050608] text-[#F8FAFC] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Dynamic Glowing Ambient Space Graphics */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#6D5EF8]/10 rounded-full blur-[140px] animate-pulse-glow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#22D3EE]/8 rounded-full blur-[140px] animate-pulse-glow" style={{ animationDelay: "2s" }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-lg bg-[#181C25]/80 border border-[#6D5EF8]/20 rounded-[32px] p-8 md:p-10 relative z-10 shadow-2xl backdrop-blur-xl text-center overflow-hidden"
      >
        {/* Subtle grid pattern background overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#22D3EE_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />

        {/* Brand Logo with rotating particle orbits */}
        <div className="flex flex-col items-center mb-6">
          <Logo size="lg" showText={true} />
        </div>

        {/* Welcome Message */}
        <p className="text-sm text-[#94A3B8] leading-relaxed max-w-sm mx-auto mb-8 font-medium">
          Welcome to your friendly productivity companion. Let's make planning simple, keep track of your goals, and beat every deadline stress-free together.
        </p>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-5 text-left max-w-sm mx-auto">
          <div>
            <label className="text-[10px] text-[#22D3EE] font-mono font-bold uppercase tracking-widest block mb-2 text-center sm:text-left">
              What should we call you?
            </label>
            <div className="relative group">
              <input 
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                placeholder="e.g. Shreya"
                className="w-full bg-[#050608] border border-[#6D5EF8]/20 focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE]/30 rounded-xl px-4 py-3.5 text-sm text-[#F8FAFC] placeholder-[#94A3B8]/30 focus:outline-none transition-all text-center font-semibold"
              />
              <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6D5EF8] group-focus-within:text-[#22D3EE] transition-colors pointer-events-none" />
            </div>
            {error && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[11px] text-red-400 mt-2 block text-center font-medium"
              >
                {error}
              </motion.span>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#6D5EF8] to-[#22D3EE] hover:brightness-110 active:scale-95 text-white py-3.5 rounded-xl text-xs font-black tracking-widest uppercase shadow-lg shadow-[#6D5EF8]/10 transition-all cursor-pointer border border-white/10 flex items-center justify-center gap-2"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-[10px] font-mono text-[#94A3B8]/50 uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5 text-[#22D3EE]" />
          Your deadlines are safe with us
        </div>

      </motion.div>
    </div>
  );
}
