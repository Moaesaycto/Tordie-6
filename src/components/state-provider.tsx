import { createContext, useContext, useState, type Dispatch, type SetStateAction } from "react";
import { State } from "@/types/state";

type StateProviderState = {
  currentState: State;
  setCurrentState: Dispatch<SetStateAction<State>>;
};

const initialState: StateProviderState = {
  currentState: { panelState: "document", mode: "select" },
  setCurrentState: () => {},
};

const StateProviderContext = createContext<StateProviderState>(initialState);

export function StateProvider({ children }: { children: React.ReactNode }) {
  const [currentState, setCurrentState] = useState<State>(initialState.currentState);
  return (
    <StateProviderContext.Provider value={{ currentState, setCurrentState }}>
      {children}
    </StateProviderContext.Provider>
  );
}

export const useAppState = () => {
  const ctx = useContext(StateProviderContext);
  if (!ctx) throw new Error("useAppState must be used within a StateProvider");
  return ctx;
};
