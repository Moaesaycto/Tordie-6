import { useEffect, useRef } from "react";
import { useStatus } from "@/components/status-provider";
import { Vector2 } from "@/types";

export const useCanvasViewportControls = (
    viewportRef: React.RefObject<HTMLDivElement | null>,
    pageRef: React.RefObject<HTMLDivElement | null>
) => {
    const {
        canvas: { offsetX, offsetY, zoom, setOffsetX, setOffsetY, setZoom, cursor },
    } = useStatus();

    const isDragging = useRef(false);
    const dragStart = useRef<Vector2 | null>(null);
    const offsetStart = useRef<Vector2 | null>(null);
    const zoomRef = useRef(zoom);
    const liveOffset = useRef<Vector2>({ x: offsetX, y: offsetY });

    const frameRef = useRef<number | null>(null);

    useEffect(() => {
        zoomRef.current = zoom;
    }, [zoom]);

    useEffect(() => {
        const el = viewportRef.current;
        const page = pageRef.current;
        if (!el || !page) return;

        const cancelFrame = (frame: number | null) => {
            if (frame !== null) cancelAnimationFrame(frame);
        };

        const onDown = (e: MouseEvent) => {
            if (e.button !== 1) return;
            e.preventDefault();
            isDragging.current = true;
            dragStart.current = { x: e.clientX, y: e.clientY };
            offsetStart.current = { ...liveOffset.current };
        };

        const onMove = (e: MouseEvent) => {
            if (!viewportRef.current || !pageRef.current) return;

            cancelFrame(frameRef.current);
            frameRef.current = requestAnimationFrame(() => {
                if (isDragging.current && dragStart.current && offsetStart.current) {
                    const dx = (e.clientX - dragStart.current.x) / zoomRef.current;
                    const dy = (e.clientY - dragStart.current.y) / zoomRef.current;
                    const newX = offsetStart.current.x + dx;
                    const newY = offsetStart.current.y + dy;

                    liveOffset.current = { x: newX, y: newY };

                    page.style.transform = `
                translate(${newX}px, ${newY}px)
                scale(${zoomRef.current})
              `;
                    page.style.transformOrigin = "top left";

                    setOffsetX(newX);
                    setOffsetY(newY);
                } else {
                    const rect = viewportRef.current!.getBoundingClientRect();
                    cursor.setViewportCursorCoords({
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top,
                    });
                }
            });

        };

        const onUp = (e: MouseEvent) => {
            if (e.button === 1) {
                isDragging.current = false;
                setOffsetX(liveOffset.current.x);
                setOffsetY(liveOffset.current.y);
            }
        };

        const onWheel = (e: WheelEvent) => {
            if (!e.ctrlKey) return;
            e.preventDefault();
            const nextZoom = Math.max(zoomRef.current + (e.deltaY > 0 ? -0.1 : 0.1), 0.1);
            setZoom(nextZoom);
        };

        el.addEventListener("mousedown", onDown);
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
        el.addEventListener("wheel", onWheel, { passive: false });

        return () => {
            el.removeEventListener("mousedown", onDown);
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
            el.removeEventListener("wheel", onWheel);
            cancelFrame(frameRef.current);
        };
    }, [viewportRef, pageRef, setOffsetX, setOffsetY, setZoom, cursor]);
};
