import React from "react";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function Logo({ className = "", showText = false, size = "md" }: LogoProps) {
  const sizeMap = {
    sm: { box: "w-8 h-8", textTitle: "text-base", textSubtitle: "text-[8px]" },
    md: { box: "w-10 h-10", textTitle: "text-lg", textSubtitle: "text-[10px]" },
    lg: { box: "w-16 h-16", textTitle: "text-2xl", textSubtitle: "text-[12px]" },
  };

  const currentSize = sizeMap[size];

  // The custom stylized "D" with lightning bolt & clock checkmark SVG
  const logoSvg = (
    <svg
      viewBox="0 0 200 200"
      className="w-full h-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Main purple to orange gradient */}
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" /> {/* Indigo / Purple */}
          <stop offset="50%" stopColor="#EC4899" /> {/* Pink / Fuchsia */}
          <stop offset="100%" stopColor="#F97316" /> {/* Orange */}
        </linearGradient>
      </defs>

      {/* Stylized outer 'D' with custom stroke path, including the lightning bolt shape on the left */}
      <path
        d="M 50,40 
           H 120 
           A 60,60 0 0,1 180,100 
           A 60,60 0 0,1 120,160 
           H 70
           A 20,20 0 0,1 50,140
           V 115 
           L 95,115 
           L 60,75 
           H 90
           L 50,40 Z"
        fill="url(#logoGrad)"
        fillRule="evenodd"
      />

      {/* Clock ticks / indicators */}
      {/* 12 o'clock */}
      <rect x="117" y="65" width="6" height="14" rx="3" fill="#F97316" opacity="0.9" />
      {/* 3 o'clock */}
      <rect x="151" y="97" width="14" height="6" rx="3" fill="#F97316" opacity="0.9" />
      {/* 6 o'clock */}
      <rect x="117" y="121" width="6" height="14" rx="3" fill="#EC4899" opacity="0.9" />

      {/* Inner checkmark clock hands */}
      <path
        d="M 97,105 
           L 115,123 
           L 155,83"
        stroke="#EC4899"
        strokeWidth="15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  if (!showText) {
    return (
      <div className={`${currentSize.box} ${className} flex items-center justify-center relative shrink-0`}>
        {logoSvg}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${currentSize.box} flex items-center justify-center relative shrink-0`}>
        {logoSvg}
      </div>
      <div>
        <h1 className={`font-display font-black tracking-wider leading-none text-white ${currentSize.textTitle} flex items-center gap-1`}>
          DEADLINE
          <span className="bg-gradient-to-r from-[#EC4899] to-[#F97316] bg-clip-text text-transparent">
            HERO
          </span>
        </h1>
        <p className={`font-sans font-semibold tracking-[0.1em] text-[#94A3B8] uppercase mt-1 leading-none ${currentSize.textSubtitle}`}>
          Never Miss What Matters.
        </p>
      </div>
    </div>
  );
}
