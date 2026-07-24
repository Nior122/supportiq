'use client'

import React, { Suspense } from 'react'
import Spline from '@splinetool/react-spline'

interface SplineSceneProps {
  scene: string
  className?: string
}

/**
 * Low-level Spline player.
 * Wrapped in React.memo to ensure it only re-renders if scene URL or className changes.
 */
export const SplineScene = React.memo(function SplineScene({ scene, className }: SplineSceneProps) {
  return (
    <Suspense 
      fallback={
        <div className="w-full h-full flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        </div>
      }
    >
      <Spline
        scene={scene}
        className={className}
      />
    </Suspense>
  )
})
