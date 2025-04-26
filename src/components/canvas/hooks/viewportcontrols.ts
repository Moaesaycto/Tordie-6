import { useEffect, useRef } from 'react';
import { useStatus } from '@/components/status-provider';
import { Vector2 } from '@/types';

const useLatest = <T,>(value: T) => {
    const ref = useRef<T>(value);
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
    const lastCoords = useRef<Vector2 | null>(null);
    const ticking = useRef(false);

    const dragOffset = useRef<Vector2>({ x: offsetX, y: offsetY });

    const smooth = useRef({
        target: { x: offsetX, y: offsetY },
        current: { x: offsetX, y: offsetY },
    });

    useEffect(() => {
        if (!isDragging.current) {
            smooth.current.target = { x: offsetX, y: offsetY };
            smooth.current.current = { x: offsetX, y: offsetY };
        }
    }, [offsetX, offsetY]);

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
            if (e.button === 1 && isDragging.current) {
                isDragging.current = false;
                setOffsetX(dragOffset.current.x);
                setOffsetY(dragOffset.current.y);
            }
        };

        const onMove = (e: MouseEvent) => {
            if (ticking.current) return;
            ticking.current = true;
            requestAnimationFrame(() => {
                const { left, top } = rect();
                const coords = { x: e.clientX - left, y: e.clientY - top };

                if (!lastCoords.current || coords.x !== lastCoords.current.x || coords.y !== lastCoords.current.y) {
                    lastCoords.current = coords;
                    cursor.setViewportCursorCoords(coords);
                }

                if (isDragging.current && dragStart.current && offsetStart.current) {
                    const dx = e.clientX - dragStart.current.x;
                    const dy = e.clientY - dragStart.current.y;
                    const newPos = {
                        x: offsetStart.current.x + dx,
                        y: offsetStart.current.y + dy,
                    };

                    dragOffset.current = newPos;
                    smooth.current.target = newPos;
                    smooth.current.current = newPos;
                }

                ticking.current = false;
            });
        };

        const onWheel = (e: WheelEvent) => {
            if (!e.ctrlKey) return;
            e.preventDefault();
            setZoom(Math.max(zoomRef.current + (e.deltaY > 0 ? -0.1 : 0.1), 0.1));
        };

        el.addEventListener('mousedown', onDown);
        el.addEventListener('mousemove', onMove);
        el.addEventListener('wheel', onWheel, { passive: false });

        window.addEventListener('mouseup', onUp); // Global mouseup listener

        return () => {
            el.removeEventListener('mousedown', onDown);
            el.removeEventListener('mousemove', onMove);
            el.removeEventListener('wheel', onWheel);
            window.removeEventListener('mouseup', onUp);
        };
    }, [viewportRef, setZoom, cursor]);

    useEffect(() => {
        let frame: number;

        const animate = () => {
            if (isDragging.current) {
                setOffsetX(dragOffset.current.x);
                setOffsetY(dragOffset.current.y);

                frame = requestAnimationFrame(animate);
                return;
            }

            const { target, current } = smooth.current;
            const dx = target.x - current.x;
            const dy = target.y - current.y;

            if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
                current.x = target.x;
                current.y = target.y;
                setOffsetX(target.x);
                setOffsetY(target.y);
            } else {
                current.x += dx * 0.15;
                current.y += dy * 0.15;
                setOffsetX(current.x);
                setOffsetY(current.y);
            }

            frame = requestAnimationFrame(animate);
        };

        frame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frame);
    }, [setOffsetX, setOffsetY]);
};
