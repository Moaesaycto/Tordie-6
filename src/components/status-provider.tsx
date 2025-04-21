import { ValidOS } from '@/types';
import React, { createContext, useContext, useEffect, useState } from 'react';
import Config from "@/tordie.config.json";

type StatusProviderProps = {
    children: React.ReactNode
    defaultState?: {
        devMode: boolean
    }
}

type CanvasStateProps = {
    documentWidth: number,
    documentHeight: number,
    offsetX: number,
    offsetY: number,
    rotation: number,
    zoom: number,
}

type StatusProviderState = {
    devMode: boolean
    setDevMode: (state: boolean) => void

    os: ValidOS
    setOs: (os: ValidOS) => void
    canvas: CanvasStateProps
}

const StatusProviderContext = createContext<StatusProviderState | undefined>(undefined);

export function StatusProvider({
    children,
    defaultState,
    ...props
}: StatusProviderProps) {
    const [devMode, setDevMode] = useState<boolean>(
        defaultState?.devMode ?? false
    );
    const [os, setOs] = useState<ValidOS>(null)

    useEffect(() => {
        const platform = navigator.userAgent.toLowerCase()

        if (platform.includes("mac")) {
            setOs("macos")
        } else if (platform.includes("win")) {
            setOs("windows")
        } else if (platform.includes("linux")) {
            setOs("linux")
        } else {
            setOs(null)
        }
    }, [])

    const defaultCanvas = {
        documentWidth: Config.canvas.defaultWidth,
        documentHeight: Config.canvas.defaultHeight,
        offsetX: Config.canvas.defaultOffsetX,
        offsetY: Config.canvas.defaultOffsetY,
        zoom: Config.canvas.defaultZoom,
        rotation: Config.canvas.defaultRotation,
    }

    const value = {
        devMode,
        setDevMode,
        os,
        setOs,
        canvas: defaultCanvas,
    }

    return (
        <StatusProviderContext.Provider {...props} value={value}>
            {children}
        </StatusProviderContext.Provider>
    )
}

export const useStatus = () => {
    const context = useContext(StatusProviderContext);
    if (!context) {
        throw new Error("useStatus must be used within a StatusProvider");
    }
    return context;
}