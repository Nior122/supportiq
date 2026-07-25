"use client";

import React, { useEffect, useRef } from "react";
import anime from "animejs";

interface FloatingCardProps {
  children: React.ReactNode;
  delay?: number;
}

export function FloatingCard({ children, delay = 0 }: FloatingCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;

    // Subtle floating animation
    const floatAnim = anime({
      targets: cardRef.current,
      translateY: [-5, 5],
      duration: 3000 + Math.random() * 2000,
      direction: "alternate",
      loop: true,
      easing: "easeInOutSine",
      delay: delay,
    });

    return () => floatAnim.pause();
  }, [delay]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 15;
    const rotateY = (centerX - x) / 15;

    anime({
      targets: cardRef.current,
      rotateX: rotateX,
      rotateY: rotateY,
      duration: 100,
      easing: "linear",
    });
  };

  const handleMouseLeave = () => {
    anime({
      targets: cardRef.current,
      rotateX: 0,
      rotateY: 0,
      duration: 500,
      easing: "easeOutElastic(1, .8)",
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="h-full perspective-1000"
    >
      <div className="h-full transform-style-3d">
        {children}
      </div>
      
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-3d {
          transform-style: preserve-3d;
        }
      `}</style>
    </div>
  );
}
