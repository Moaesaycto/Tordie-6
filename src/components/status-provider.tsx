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
    setDocumentWidth: (width: number) => void,
    documentHeight: number,
    setDocumentHeight: (height: number) => void,
    offsetX: number,
    setOffsetX: (offset: number) => void,
    offsetY: number,
    setOffsetY: (offset: number) => void,
    rotation: number,
    setRotation: (rotation: number) => void,
    zoom: number,
    setZoom: (zoom: number) => void,
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

    const [documentWidth, setDocumentWidth] = useState<number>(Config.canvas.defaultWidth);
    const [documentHeight, setDocumentHeight] = useState<number>(Config.canvas.defaultHeight);
    const [offsetX, setOffsetX] = useState<number>(Config.canvas.defaultOffsetX);
    const [offsetY, setOffsetY] = useState<number>(Config.canvas.defaultOffsetY);
    const [zoom, setZoom] = useState<number>(Config.canvas.defaultZoom);
    const [rotation, setRotation] = useState<number>(Config.canvas.defaultRotation);

    const defaultCanvas = {
        documentWidth,
        setDocumentWidth,
        documentHeight,
        setDocumentHeight,
        offsetX,
        setOffsetX,
        offsetY,
        setOffsetY,
        zoom,
        setZoom,
        rotation,
        setRotation,
    };

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