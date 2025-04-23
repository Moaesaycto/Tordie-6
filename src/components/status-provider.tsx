import { ValidOS, Vector2 } from '@/types';
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

    cursor: CursorStateProps,
}

type CursorStateProps = {
    viewportCursorCoords: Vector2 | null,
    setViewportCursorCoords: (coords: Vector2 | null) => void,
    relativeViewportCursorCoords: Vector2 | null,
    setRelativeViewportCursorCoords: (coords: Vector2 | null) => void,
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
        defaultState?.devMode ?? true // TODO: CHANGE TO FALSE
    );
    const [os, setOs] = useState<ValidOS>(null)
    const [documentWidth, setDocumentWidth] = useState<number>(Config.canvas.defaultWidth);
    const [documentHeight, setDocumentHeight] = useState<number>(Config.canvas.defaultHeight);
    const [offsetX, setOffsetX] = useState<number>(Config.canvas.defaultOffsetX);
    const [offsetY, setOffsetY] = useState<number>(Config.canvas.defaultOffsetY);
    const [zoom, setZoom] = useState<number>(Config.canvas.defaultZoom);
    const [rotation, setRotation] = useState<number>(Config.canvas.defaultRotation);

    const [viewportCursorCoords, setViewportCursorCoords] = useState<Vector2 | null>(null);
    const [relativeViewportCursorCoords, setRelativeViewportCursorCoords] = useState<Vector2 | null>(null);

    useEffect(() => {
        const platform = navigator.userAgent.toLowerCase();

        let detectedOS: ValidOS = null;
        if (platform.includes("mac")) {
            detectedOS = "macos";
        } else if (platform.includes("win")) {
            detectedOS = "windows";
        } else if (platform.includes("linux")) {
            detectedOS = "linux";
        }

        if (detectedOS !== os) {
            setOs(detectedOS);
        }
    }, [os]);

    useEffect(() => {
        if (!viewportCursorCoords) {
            setRelativeViewportCursorCoords(null)
            return;
        }

        const transform = (coords: Vector2): Vector2 => {
            return {
                x: (coords.x - offsetX) / zoom,
                y: (coords.y - offsetY) / zoom,
            };
        }

        setRelativeViewportCursorCoords(transform(viewportCursorCoords))

    }, [viewportCursorCoords])


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
        cursor: {
            viewportCursorCoords,
            setViewportCursorCoords,
            relativeViewportCursorCoords,
            setRelativeViewportCursorCoords
        }
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