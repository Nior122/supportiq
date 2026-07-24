'use client'

import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"

// Dynamic import with SSR disabled and deferred priority
const SplineScene = dynamic(
  () => import("./spline-scene").then((mod) => mod.SplineScene),
  { 
    ssr: false,
    loading: () => <div className="w-full h-full bg-black/10 animate-pulse" />
  }
)

/**
 * Homepage-exclusive background layer.
 * Optimized for interaction and deferral.
 */
export function HomeSplineBackground() {
  const [shouldLoad, setShouldLoad] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // 1. Defer loading until browser is idle to prioritize TTI
    const loadSpline = () => setShouldLoad(true)
    const idleCallback = window.requestIdleCallback 
      ? window.requestIdleCallback(loadSpline)
      : setTimeout(loadSpline, 2000)

    // 2. Mobile check
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(idleCallback)
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  if (!shouldLoad) return null

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0 z-0 flex items-center justify-center pointer-events-auto"
      >
        <div className={`w-full h-full transition-transform duration-1000 ${
          isMobile ? "scale-90" : "scale-100"
        } max-w-[1440px] max-h-[90vh]`}>
          <SplineScene 
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
