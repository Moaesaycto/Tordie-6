export type Panel = 'document' | 'export' | 'diagram'

export type Mode = 'select';


export type State = {
    panelState: Panel,
    mode: Mode | null, 
}