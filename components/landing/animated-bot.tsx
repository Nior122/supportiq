"use client";

import React, { useEffect, useRef } from "react";
import anime from "animejs";
import { Sparkles } from "lucide-react";

export function AnimatedBot() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Animation for the core floating
    anime({
      targets: ".bot-core",
      translateY: [-15, 15],
      duration: 3000,
      direction: "alternate",
      loop: true,
      easing: "easeInOutQuad",
    });

    // Rotation for the rings
    anime({
      targets: ".bot-ring-1",
      rotateZ: 360,
      duration: 8000,
      loop: true,
      easing: "linear",
    });

    anime({
      targets: ".bot-ring-2",
      rotateZ: -360,
      duration: 12000,
      loop: true,
      easing: "linear",
    });

    // Pulsing particles
    anime({
      targets: ".bot-particle",
      opacity: [0.2, 1],
      scale: [0.5, 1.2],
      delay: anime.stagger(200),
      duration: 2000,
      direction: "alternate",
      loop: true,
      easing: "easeInOutSine",
    });
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="relative flex items-center justify-center w-full h-full perspective-1000"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full animate-pulse" />

      {/* Main Bot Assembly */}
      <div className="bot-core relative z-10 w-64 h-64 flex items-center justify-center">
        
        {/* Core Sphere */}
        <div className="relative w-32 h-32 rounded-full bg-ai-gradient shadow-glow-strong flex items-center justify-center overflow-hidden border border-white/20">
           <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
           <Sparkles className="relative z-10 h-12 w-12 text-white animate-pulse" />
           
           {/* Inner scanline effect */}
           <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(255,255,255,0.05)_50%,transparent_100%)] bg-[length:100%_4px] animate-scanline" />
        </div>

        {/* Orbital Ring 1 */}
        <div className="bot-ring-1 absolute w-56 h-56 border-2 border-dashed border-primary/40 rounded-full" />
        
        {/* Orbital Ring 2 */}
        <div className="bot-ring-2 absolute w-48 h-48 border border-secondary/30 rounded-full" style={{ transform: 'rotateX(60deg)' }} />

        {/* Decorative Particles / Nodes */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bot-particle absolute w-2 h-2 rounded-full bg-primary shadow-glow"
            style={{
              transform: `rotate(${i * 60}deg) translateY(-100px)`,
            }}
          />
        ))}

        {/* Technological HUD Elements */}
        <div className="absolute -bottom-8 flex flex-col items-center gap-1">
           <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
           <span className="text-[10px] font-mono font-bold text-primary/60 uppercase tracking-[0.3em] animate-pulse">
             Neural_Sync_Active
           </span>
        </div>
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        @keyframes scanline {
          from { transform: translateY(-100%); }
          to { transform: translateY(100%); }
        }
        .animate-scanline {
          animation: scanline 4s linear infinite;
        }
      `}</style>
    </div>
  );
}
