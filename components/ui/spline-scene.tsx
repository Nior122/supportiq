'use client'

import React, { Suspense, lazy, useMemo } from 'react'
const Spline = lazy(() => import('@splinetool/react-spline'))

interface SplineSceneProps {
  scene: string
  className?: string
}

export const SplineScene = React.memo(function SplineScene({ scene, className }: SplineSceneProps) {
  const splineElement = useMemo(() => (
    <Spline
      scene={scene}
      className={className}
    />
  ), [scene, className])

  return (
    <Suspense 
      fallback={
        <div className="w-full h-full flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        </div>
      }
    >
      {splineElement}
    </Suspense>
  )
})

