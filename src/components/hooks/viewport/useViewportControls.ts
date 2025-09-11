import { useEffect, useRef } from "react";
import Konva from "konva";
import { state } from "@/components/canvas/CanvasState";
import { Vector2 } from "@/types";

export function useViewportControls(
  stageRef: React.RefObject<Konva.Stage | null>,
  setViewportCursorCoords: (coords: Vector2 | null) => void
) {
  const activeRef = useRef(false);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const container = stage.container();

    const getCanvasPoint = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onMouseDown = (e: MouseEvent) => {
      activeRef.current = true;

      const { x, y } = getCanvasPoint(e);
      const wx = (x - state.pan.x) / state.zoom;
      const wy = (y - state.pan.y) / state.zoom;

      if (e.button === 1) {
        state.middlePanning = true;
        state.lastMouse = { x: e.clientX, y: e.clientY };
        e.preventDefault();
        return;
      }

      const dx = wx - state.circle.x;
      const dy = wy - state.circle.y;
      if (Math.hypot(dx, dy) < 20) {
        state.dragging = true;
        state.dragOffset = { x: dx, y: dy };
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      // always update cursor coords in screen space
      const { x, y } = getCanvasPoint(e);
      setViewportCursorCoords({ x, y });

      // only run interaction logic when dragging or panning
      if (!activeRef.current && !state.middlePanning && !state.dragging) return;

      if (state.middlePanning) {
        const dx = e.clientX - state.lastMouse.x;
        const dy = e.clientY - state.lastMouse.y;
        state.pan.x += dx;
        state.pan.y += dy;
        state.lastMouse = { x: e.clientX, y: e.clientY };
        return;
      }

      if (state.dragging) {
        const wx = (x - state.pan.x) / state.zoom;
        const wy = (y - state.pan.y) / state.zoom;
        state.circle = { x: wx - state.dragOffset.x, y: wy - state.dragOffset.y };
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      state.middlePanning = e.button === 1 ? false : state.middlePanning;
      state.dragging = false;
      activeRef.current = false;
    };

    const onMouseLeave = () => setViewportCursorCoords(null);

    const onWheel = (e: WheelEvent) => {
      if (e.target && !container.contains(e.target as Node)) return;
      e.preventDefault();

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const rawZoom = state.zoom * zoomFactor;
      const newZoom = Math.max(0.05, Math.min(50, rawZoom));

      state.pan.x = x - ((x - state.pan.x) / state.zoom) * newZoom;
      state.pan.y = y - ((y - state.pan.y) / state.zoom) * newZoom;
      state.zoom = newZoom;
    };

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove); // always fires
    window.addEventListener("mouseup", onMouseUp);
    container.addEventListener("mouseleave", onMouseLeave);
    container.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("mouseleave", onMouseLeave);
      container.removeEventListener("wheel", onWheel as any);
    };
  }, [stageRef, setViewportCursorCoords]);
}
