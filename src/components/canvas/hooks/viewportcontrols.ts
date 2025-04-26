import { useEffect, useRef } from "react";
import { useStatus } from "@/components/status-provider";
import { Vector2 } from "@/types";

export const useCanvasViewportControls = (
  viewportRef: React.RefObject<HTMLDivElement | null>
) => {
  const { setOffsetX, setOffsetY, offsetX, offsetY, zoom, setZoom, cursor } =
    useStatus().canvas;

  // keep latest values in refs to avoid re-subscribing handlers
  const offsetXRef = useRef(offsetX);
  const offsetYRef = useRef(offsetY);
  const zoomRef = useRef(zoom);

  useEffect(() => { offsetXRef.current = offsetX; }, [offsetX]);
  useEffect(() => { offsetYRef.current = offsetY; }, [offsetY]);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);

  // drag state + throttling
  const isDragging = useRef(false);
  const dragStart = useRef<Vector2>(null);
  const offsetStart = useRef<Vector2>(null);
  const lastCoords = useRef<Vector2>(null);
  const ticking = useRef(false);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const onMouseEnter = () => {
      // nothing to do here – wheel only fires when pointer’s over this element
    };

    const onMouseLeave = () => {
      cursor.setViewportCursorCoords(null);
      isDragging.current = false;
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 1) return;
      e.preventDefault();
      isDragging.current = true;
      dragStart.current = { x: e.clientX, y: e.clientY };
      offsetStart.current = {
        x: offsetXRef.current,
        y: offsetYRef.current,
      };
    };

    const onMouseUp = (e: MouseEvent) => {
      if (e.button === 1) isDragging.current = false;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const coords = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };

        // only update if moved
        if (
          !lastCoords.current ||
          coords.x !== lastCoords.current.x ||
          coords.y !== lastCoords.current.y
        ) {
          lastCoords.current = coords;
          cursor.setViewportCursorCoords(coords);
        }

        // drag-pan
        if (isDragging.current && dragStart.current && offsetStart.current) {
          const dx = e.clientX - dragStart.current.x;
          const dy = e.clientY - dragStart.current.y;
          setOffsetX(offsetStart.current.x + dx);
          setOffsetY(offsetStart.current.y + dy);
        }

        ticking.current = false;
      });
    };

    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(Math.max(zoomRef.current + delta, 0.1));
    };

    el.addEventListener("mouseenter", onMouseEnter);
    el.addEventListener("mouseleave", onMouseLeave);
    el.addEventListener("mousedown", onMouseDown);
    el.addEventListener("mouseup", onMouseUp);
    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      el.removeEventListener("mouseenter", onMouseEnter);
      el.removeEventListener("mouseleave", onMouseLeave);
      el.removeEventListener("mousedown", onMouseDown);
      el.removeEventListener("mouseup", onMouseUp);
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("wheel", onWheel);
    };
  }, [viewportRef, cursor, setOffsetX, setOffsetY, setZoom]);

  // nothing to return – all wiring is internal
};
