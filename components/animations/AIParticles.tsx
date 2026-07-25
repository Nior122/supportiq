"use client";

import React, { useEffect, useRef } from "react";
import anime from "animejs";

export function AIParticles() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const animation = anime({
      targets: ".particle",
      translateX: () => anime.random(-20, 20),
      translateY: () => anime.random(-20, 20),
      opacity: [0.2, 0.8],
      scale: () => anime.random(0.5, 1.5),
      duration: () => anime.random(3000, 5000),
      delay: anime.stagger(100),
      direction: "alternate",
      loop: true,
      easing: "easeInOutQuad",
    });

    return () => animation.pause();
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="particle absolute w-1 h-1 rounded-full bg-primary/40"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            boxShadow: "0 0 10px var(--primary)",
          }}
        />
      ))}
    </div>
  );
}
