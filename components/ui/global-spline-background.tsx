'use client'

import { SplineScene } from "./spline-scene"
import { Spotlight } from "./spotlight"

export function GlobalSplineBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-black pointer-events-auto">
      {/* 1. Spline Scene Layer (Interactive) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-full max-w-[1440px] max-h-[90vh]">
          <SplineScene 
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>
      </div>

      {/* 2. Spotlight Layer (Visual effect on top of Spline) */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          size={600}
        />
        {/* Subtle gradient to ensure content legibility while keeping robot visible */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
      </div>
    </div>
  )
}
