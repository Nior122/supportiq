'use client'

import { usePathname } from "next/navigation"
import { GlobalBackgroundEffects } from "./global-background-effects"
import { HomeSplineBackground } from "./home-spline-background"
import { useEffect, useState } from "react"

/**
 * Orchestrator for site-wide background logic.
 * Decides when to load the heavy Spline robot vs. lightweight effects.
 */
export function GlobalSplineBackground() {
  const pathname = usePathname()
  const isHomePage = pathname === "/"
  
  // Performance: Don't even evaluate the Spline import logic until we are on the homepage
  // and we've confirmed the environment is client-side.
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <div className="fixed inset-0 bg-black -z-10" />

  return (
    <>
      {/* 1. Global Lightweight Layer (Always mounted) */}
      <GlobalBackgroundEffects />

      {/* 2. Page-Specific Heavy Layer (Homepage only) */}
      {isHomePage && <HomeSplineBackground />}
    </>
  )
}
