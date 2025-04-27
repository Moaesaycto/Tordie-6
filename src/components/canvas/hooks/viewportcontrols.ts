import { useEffect, useRef } from 'react';
import { useStatus } from '@/components/status-provider';
import { Vector2 } from '@/types';

const useLatest = <T,>(value: T) => {
    const ref = useRef(value);
    useEffect(() => { ref.current = value; }, [value]);
    return ref;
};

export const useCanvasViewportControls = (viewportRef: React.RefObject<HTMLDivElement | null>) => {
    const {
        canvas: { offsetX, offsetY, zoom, setOffsetX, setOffsetY, setZoom, cursor },
    } = useStatus();

    const offsetXRef = useLatest(offsetX);
    const offsetYRef = useLatest(offsetY);
    const zoomRef = useLatest(zoom);

    const isDragging = useRef(false);
    const dragStart = useRef<Vector2 | null>(null);
    const offsetStart = useRef<Vector2 | null>(null);

    useEffect(() => {
        const el = viewportRef.current;
        if (!el) return;

        const rect = () => el.getBoundingClientRect();

        const onDown = (e: MouseEvent) => {
            if (e.button !== 1) return;
            e.preventDefault();
            isDragging.current = true;
            dragStart.current = { x: e.clientX, y: e.clientY };
            offsetStart.current = { x: offsetXRef.current, y: offsetYRef.current };
        };

        const onUp = (e: MouseEvent) => {
            if (e.button !== 1) return;
            isDragging.current = false;
        };

        const onMove = (e: MouseEvent) => {
            const { left, top } = rect();
            const coords = { x: e.clientX - left, y: e.clientY - top };
            cursor.setViewportCursorCoords(coords);

            if (isDragging.current && dragStart.current && offsetStart.current) {
                const dx = e.clientX - dragStart.current.x;
                const dy = e.clientY - dragStart.current.y;
                setOffsetX(offsetStart.current.x + dx);
                setOffsetY(offsetStart.current.y + dy);
            }
        };

        const onWheel = (e: WheelEvent) => {
            if (!e.ctrlKey) return;
            e.preventDefault();
            setZoom(Math.max(zoomRef.current + (e.deltaY > 0 ? -0.1 : 0.1), 0.1));
        };

        el.addEventListener('mousedown', onDown);
        el.addEventListener('mousemove', onMove);
        el.addEventListener('wheel', onWheel, { passive: false });
        window.addEventListener('mouseup', onUp);

        return () => {
            el.removeEventListener('mousedown', onDown);
            el.removeEventListener('mousemove', onMove);
            el.removeEventListener('wheel', onWheel);
            window.removeEventListener('mouseup', onUp);
        };
    }, [viewportRef, setOffsetX, setOffsetY, setZoom, cursor]);
};
