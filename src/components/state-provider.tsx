import { State } from "@/types/state";
import { createContext, useContext, useState } from "react";

type StateProviderProps = {
    children: React.ReactNode;
}

type StateProviderState = {
    currentState: State;
    setCurrentState: (state: State) => void;
}

const initialState: StateProviderState = {
    currentState: {
        panelState: 'document'
    },
    setCurrentState: () => { },
}

const StateProviderContext = createContext<StateProviderState>(initialState);

export function StateProvider({
    children
}: StateProviderProps) {
    const [currentState, setCurrentState] = useState<State>(initialState.currentState);

    const value = {
        currentState,
        setCurrentState,
    }

    return (
        <StateProviderContext.Provider value={value}>
            {children}
        </StateProviderContext.Provider>
    )
}

export const useAppState = () => {
    const context = useContext(StateProviderContext)

    if (context == undefined)
        throw new Error("useAppState must be used within a StateProvider")

    return context;
}