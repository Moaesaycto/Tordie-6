import { useEffect } from 'react'
import { state } from '@/CanvasState'

export function useViewportSize(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      state.viewport.width = width;
      state.viewport.height = height;
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
}
