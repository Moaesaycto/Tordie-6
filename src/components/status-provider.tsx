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
    relativeViewportCursorCoords: Vector2 | null
    setRelativeViewportCursorCoords: (coords: Vector2 | null) => void
    offsetX: number
    setOffsetX: (x: number) => void
    offsetY: number
    setOffsetY: (y: number) => void
    zoom: number
    setZoom: (z: number) => void
    viewportWidth: number;
    viewportHeight: number;
    setViewportWidth: (width: number) => void;
    setViewportHeight: (height: number) => void;
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
    const [devMode, setDevMode] = useState(defaultState?.devMode ?? true) // TODO: Change!
    const [os, setOs] = useState<ValidOS>(null)

    const [viewportWidth, setViewportWidth] = useState(0);
    const [viewportHeight, setViewportHeight] = useState(0);

    const [viewportCursorCoords, setViewportCursorCoords] = useState<Vector2 | null>(null)
    const [relativeViewportCursorCoords, setRelativeViewportCursorCoords] = useState<Vector2 | null>(null)

    const [offsetX, setOffsetX] = useState(0)
    const [offsetY, setOffsetY] = useState(0)
    const [zoom, setZoom] = useState(1)

    // Detect OS
    useEffect(() => {
        const ua = navigator.userAgent.toLowerCase()
        let detected: ValidOS = null
        if (ua.includes('mac')) detected = 'macos'
        else if (ua.includes('win')) detected = 'windows'
        else if (ua.includes('linux')) detected = 'linux'
        if (detected !== os) setOs(detected)
    }, [os])

    // Update relative coords
    useEffect(() => {
        if (!viewportCursorCoords) {
            setRelativeViewportCursorCoords(null)
            return
        }

        const transformed = {
            x: (viewportCursorCoords.x - offsetX) / zoom,
            y: (viewportCursorCoords.y - offsetY) / zoom,
        }

        setRelativeViewportCursorCoords(transformed)
    }, [viewportCursorCoords, offsetX, offsetY, zoom])


    const value: StatusContext = {
        devMode,
        setDevMode,
        os,
        setOs,
        viewport: {
            viewportCursorCoords,
            setViewportCursorCoords,
            relativeViewportCursorCoords,
            setRelativeViewportCursorCoords,
            offsetX,
            setOffsetX,
            offsetY,
            setOffsetY,
            zoom,
            setZoom,
            viewportWidth,
            viewportHeight,
            setViewportWidth,
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
