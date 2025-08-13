declare module 'react-konva-to-svg' {
  import type Konva from 'konva';
  export function exportStageSVG(stage: Konva.Stage, blob?: boolean, options?: any): Promise<string|Blob>;
}
