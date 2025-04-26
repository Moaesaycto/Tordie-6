import { RefObject } from 'react';
import { Vector2 } from '@/types';

interface Smooth {
    target: Vector2;
    current: Vector2;
}

interface AnimateOptions {
    isDragging: RefObject<boolean>;
    dragOffset: RefObject<Vector2>;
    smooth: RefObject<Smooth>;
    setOffsetX: (x: number) => void;
    setOffsetY: (y: number) => void;
}

export const animate = ({ isDragging, dragOffset, smooth, setOffsetX, setOffsetY }: AnimateOptions) => {
    if (isDragging.current) {
        setOffsetX(dragOffset.current.x);
        setOffsetY(dragOffset.current.y);
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
};
