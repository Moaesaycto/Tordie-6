export type Action = {
    do(): void;
    undo(): void;
    label: string;
}

export type Tx = {
    actions: Action[];
    label?: string;
}

const undoStack: Tx[] = [];
const redoStack: Tx[] = [];
const currentTx: Tx | null = null;

export const canUndo = (): boolean => !!undoStack;
export const canRedo = (): boolean => !!redoStack;