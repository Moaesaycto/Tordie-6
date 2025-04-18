import React, { createContext, useContext, useState } from 'react';

type StatusProviderProps = {
    children: React.ReactNode
    defaultState?: {
        devMode: boolean
    }
}

type StatusProviderState = {
    devMode: boolean
    setDevMode: (state: boolean) => void
}

const StatusProviderContext = createContext<StatusProviderState | undefined>(undefined);

export function StatusProvider({
    children,
    defaultState,
    ...props
}: StatusProviderProps) {
    const [devMode, setDevMode] = useState<boolean>(defaultState?.devMode ?? false);

    const value = {
        devMode,
        setDevMode
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