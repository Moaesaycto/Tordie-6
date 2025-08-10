import React, { createContext, useContext, useEffect, useState } from 'react'
import { Vector2, ValidOS } from '@/types'

type StatusProviderProps = {
  children: React.ReactNode
  defaultState?: {
    devMode: boolean
  }
}

type ViewportState = {
  viewportCursorCoords: Vector2 | null
  setViewportCursorCoords: (coords: Vector2 | null) => void

  viewportWidth: number
  setViewportWidth: (width: number) => void

  viewportHeight: number
  setViewportHeight: (height: number) => void
}

type StatusContext = {
  devMode: boolean
  setDevMode: (state: boolean) => void

  os: ValidOS
  setOs: (os: ValidOS) => void

  viewport: ViewportState
}

const StatusProviderContext = createContext<StatusContext | undefined>(undefined)

export function StatusProvider({ children, defaultState }: StatusProviderProps) {
  const [devMode, setDevMode] = useState(defaultState?.devMode ?? true)
  const [os, setOs] = useState<ValidOS>(null)

  const [viewportCursorCoords, setViewportCursorCoords] = useState<Vector2 | null>(null)
  const [viewportWidth, setViewportWidth] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(0)

  // Detect OS
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase()
    let detected: ValidOS = null
    if (ua.includes('mac')) detected = 'macos'
    else if (ua.includes('win')) detected = 'windows'
    else if (ua.includes('linux')) detected = 'linux'
    if (detected !== os) setOs(detected)
  }, [os])

  const value: StatusContext = {
    devMode,
    setDevMode,
    os,
    setOs,
    viewport: {
      viewportCursorCoords,
      setViewportCursorCoords,
      viewportWidth,
      setViewportWidth,
      viewportHeight,
      setViewportHeight,
    },
  }

  return (
    <StatusProviderContext.Provider value={value}>
      {children}
    </StatusProviderContext.Provider>
  )
}

export function useStatus() {
  const context = useContext(StatusProviderContext)
  if (!context) throw new Error('useStatus must be used within a StatusProvider')
  return context
}
