"use client";

import React, { useEffect, useRef } from "react";
import anime from "animejs";
import { MessageSquare, Bot, Database, CheckCircle2, ArrowRight } from "lucide-react";

export function WorkflowAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Timeline for the workflow steps
    const tl = anime.timeline({
      easing: 'easeInOutQuad',
      duration: 1000,
      loop: true
    });

    tl
    .add({
      targets: '.step-1',
      scale: [1, 1.1, 1],
      opacity: [0.5, 1, 0.5],
      delay: 500
    })
    .add({
      targets: '.particle-1',
      translateX: [0, 150],
      opacity: [0, 1, 0],
      duration: 1500,
    })
    .add({
      targets: '.step-2',
      scale: [1, 1.1, 1],
      opacity: [0.5, 1, 0.5],
    }, '-=500')
    .add({
      targets: '.particle-2',
      translateX: [0, 150],
      opacity: [0, 1, 0],
      duration: 1500,
    })
    .add({
      targets: '.step-3',
      scale: [1, 1.1, 1],
      opacity: [0.5, 1, 0.5],
    }, '-=500')
    .add({
      targets: '.particle-3',
      translateX: [0, 150],
      opacity: [0, 1, 0],
      duration: 1500,
    })
    .add({
      targets: '.step-4',
      scale: [1, 1.1, 1],
      opacity: [0.5, 1, 0.5],
    }, '-=500');

    return () => tl.pause();
  }, []);

  const Step = ({ icon: Icon, label, className }: { icon: any, label: string, className: string }) => (
    <div className={className + " flex flex-col items-center gap-4 transition-all"}>
      <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-glow-sm group-hover:border-primary/40">
        <Icon className="h-8 w-8 text-primary" />
      </div>
      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
        {label}
      </span>
    </div>
  );

  return (
    <div ref={containerRef} className="w-full flex items-center justify-between px-8 max-w-4xl mx-auto py-20 relative">
      {/* Background Flow Lines */}
      <div className="absolute inset-0 flex items-center justify-around px-24 pointer-events-none opacity-20">
         <div className="h-[1px] w-full bg-gradient-to-r from-primary/0 via-primary to-primary/0" />
      </div>

      <Step icon={MessageSquare} label="Input" className="step-1" />
      <div className="relative h-1 w-24">
         <div className="particle-1 absolute h-1.5 w-1.5 rounded-full bg-primary shadow-glow top-1/2 -translate-y-1/2 opacity-0" />
      </div>

      <Step icon={Bot} label="AI_Agent" className="step-2" />
      <div className="relative h-1 w-24">
         <div className="particle-2 absolute h-1.5 w-1.5 rounded-full bg-primary shadow-glow top-1/2 -translate-y-1/2 opacity-0" />
      </div>

      <Step icon={Database} label="Vector_DB" className="step-3" />
      <div className="relative h-1 w-24">
         <div className="particle-3 absolute h-1.5 w-1.5 rounded-full bg-primary shadow-glow top-1/2 -translate-y-1/2 opacity-0" />
      </div>

      <Step icon={CheckCircle2} label="Resolution" className="step-4" />
    </div>
  );
}
