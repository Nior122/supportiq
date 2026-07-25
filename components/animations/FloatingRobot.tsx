"use client";

import React, { useEffect, useRef } from "react";
import anime from "animejs";
import { Sparkles, Bot } from "lucide-react";

export function FloatingRobot() {
  const robotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!robotRef.current) return;

    // Floating animation
    const floatAnim = anime({
      targets: robotRef.current,
      translateY: [-10, 10],
      rotate: [-2, 2],
      duration: 4000,
      direction: "alternate",
      loop: true,
      easing: "easeInOutSine",
    });

    // Breathing light animation
    const glowAnim = anime({
      targets: ".robot-glow",
      opacity: [0.3, 0.7],
      scale: [0.95, 1.05],
      duration: 2000,
      direction: "alternate",
      loop: true,
      easing: "easeInOutQuad",
    });

    // Initial entrance
    anime({
      targets: robotRef.current,
      opacity: [0, 1],
      translateY: [40, 0],
      duration: 1500,
      easing: "easeOutExpo",
    });

    return () => {
      floatAnim.pause();
      glowAnim.pause();
    };
  }, []);

  return (
    <div className="relative flex items-center justify-center w-full h-full p-12 overflow-visible">
      {/* Background Atmosphere */}
      <div className="robot-glow absolute h-64 w-64 bg-primary/20 blur-[80px] rounded-full" />
      
      <div ref={robotRef} className="relative z-10 flex flex-col items-center">
        {/* The "Bot" Visual */}
        <div className="relative w-40 h-40 flex items-center justify-center">
          {/* Orbital Rings */}
          <div className="absolute inset-0 border border-primary/20 rounded-full animate-[spin_10s_linear_infinite]" />
          <div className="absolute inset-2 border border-secondary/10 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
          
          {/* Main Body Sphere */}
          <div className="relative w-28 h-28 rounded-[2rem] bg-ai-gradient shadow-glow-strong flex items-center justify-center border border-white/20 overflow-hidden group">
            <div className="absolute inset-0 bg-white/5 backdrop-blur-md" />
            <Bot className="relative z-10 h-14 w-14 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
            
            {/* Scanline Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(255,255,255,0.05)_50%,transparent_100%)] bg-[length:100%_4px] animate-[scanline_4s_linear_infinite]" />
          </div>

          {/* Sparkles / Particles */}
          <div className="absolute -top-4 -right-4">
             <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          </div>
        </div>

        {/* HUD label */}
        <div className="mt-8 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm shadow-sm">
           <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
              <span className="text-[10px] font-mono font-bold text-primary tracking-[0.2em] uppercase">
                 AI_CORE_ACTIVE
              </span>
           </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scanline {
          from { transform: translateY(-100%); }
          to { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
}
