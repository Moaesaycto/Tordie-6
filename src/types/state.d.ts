export type Panel = 'document' | 'export' | 'scene'

export type Mode = 'select';


export type State = {
    panelState: Panel,
    mode: Mode | null, 
}