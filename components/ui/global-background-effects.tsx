'use client'

import { Spotlight } from "./spotlight"

/**
 * Lightweight global background layer.
 * These effects remain visible on every page (Landing, Dashboard, Auth, etc.)
 */
export function GlobalBackgroundEffects() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-black pointer-events-none">
      {/* Spotlight effect follows cursor globally */}
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20 opacity-50"
        size={600}
      />
      
      {/* Global gradient and background styling */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />
      
      {/* Noise or subtle background grid could go here if needed */}
    </div>
  )
}
