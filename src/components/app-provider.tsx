import React, { createContext, useContext, useEffect, useState } from 'react';
import { Vector2, ValidOS } from '@/types';

type AppProviderProps = {
  children: React.ReactNode;
  defaultState?: { devMode: boolean };
};

type ViewportState = {
  viewportCursorCoords: Vector2 | null;
  setViewportCursorCoords: (coords: Vector2 | null) => void;
  viewportWidth: number;
  setViewportWidth: (width: number) => void;
  viewportHeight: number;
  setViewportHeight: (height: number) => void;
};

type AppContextValue = {
  devMode: boolean;
  setDevMode: (state: boolean) => void;
  os: ValidOS;
  setOs: (os: ValidOS) => void;
  viewport: ViewportState;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children, defaultState }: AppProviderProps) {
  const [devMode, setDevMode] = useState(defaultState?.devMode ?? true);
  const [os, setOs] = useState<ValidOS>(null);
  const [viewportCursorCoords, setViewportCursorCoords] = useState<Vector2 | null>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  // Detect OS
  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    let detected: ValidOS = null;
    if (ua.includes('mac')) detected = 'macos';
    else if (ua.includes('win')) detected = 'windows';
    else if (ua.includes('linux')) detected = 'linux';
    if (detected !== os) setOs(detected);
  }, [os]);

  const value: AppContextValue = {
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
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
