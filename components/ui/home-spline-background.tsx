'use client'

import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"

// Heavy Spline runtime is dynamically imported with SSR disabled
const SplineScene = dynamic(
  () => import("./spline-scene").then((mod) => mod.SplineScene),
  { 
    ssr: false,
    loading: () => <div className="w-full h-full bg-black/20 animate-pulse" />
  }
)

/**
 * Heavy Spline robot background.
 * Mounted ONLY on the landing page (/).
 */
export function HomeSplineBackground() {
  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 z-0 flex items-center justify-center pointer-events-auto"
      >
        <div className="w-full h-full max-w-[1440px] max-h-[90vh]">
          <SplineScene 
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
