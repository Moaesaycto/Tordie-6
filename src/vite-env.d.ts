/// <reference types="vite/client" />

declare module '*.svg' {
    import * as React from 'react';
    const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
    export { ReactComponent };
    const src: string;
    export default src;
}

// vite-env.d.ts or globals.d.ts
declare module '*.svg?react' {
    import * as React from 'react';
    const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
    export default ReactComponent;
  }
  