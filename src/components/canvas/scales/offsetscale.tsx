import { useTheme } from "@/components/theme-provider";
import { useRef, useLayoutEffect, useEffect } from "react";
import Config from "@/tordie.config.json";
import { useStatus } from "@/components/status-provider";

const OffsetScale = ({
    orientation = "vertical",
}: {
    orientation?: "horizontal" | "vertical";
}) => {
    const isVertical = orientation === "vertical";
    const { resolvedTheme } = useTheme();
    const { paddingX, paddingY } = Config.canvas;
    const {
        documentWidth,
        documentHeight,
        offsetX,
        offsetY,
        setOffsetX,
        setOffsetY,
        zoom,
    } = useStatus().canvas;
    const { viewportWidth, viewportHeight } = useStatus().viewport;

    const scrollRef = useRef<HTMLDivElement>(null);

    const lowerBoundRef = useRef(0);
    const upperBoundRef = useRef(0);
    const rangeRef = useRef(1);

    const viewSize = isVertical ? viewportHeight : viewportWidth;
    const docSize = isVertical ? documentHeight : documentWidth;
    const pad = isVertical ? paddingY : paddingX;
    const offset = isVertical ? offsetY : offsetX;

    useLayoutEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const padMin = zoom * pad;
        const padMax = Math.min(padMin, viewSize - zoom * (pad + docSize));

        const lower = Math.min(padMax, offset);
        const upper = Math.max(padMin, offset);

        lowerBoundRef.current = lower;
        upperBoundRef.current = upper;
        rangeRef.current = Math.max(upper - lower, 1);

        const thumb = el.firstElementChild as HTMLDivElement | null;
        if (thumb) {
            const thumbPercent = 100 + (rangeRef.current / viewSize) * 100;
            if (isVertical) thumb.style.height = `${thumbPercent}%`;
            else thumb.style.width = `${thumbPercent}%`;
        }

        // Inverted scroll position
        const scrollPos = upper - offset;
        if (isVertical) el.scrollTop = scrollPos;
        else el.scrollLeft = scrollPos;
    }, [
        isVertical,
        zoom,
        viewSize,
        docSize,
        pad,
        offset,
    ]);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        let ticking = false;

        const onScroll = () => {
            if (ticking) return;
            ticking = true;

            requestAnimationFrame(() => {
                const pos = isVertical ? el.scrollTop : el.scrollLeft;
                const newOffset = upperBoundRef.current - pos;
                if (isVertical) setOffsetY(newOffset);
                else setOffsetX(newOffset);
                ticking = false;
            });
        };

        el.addEventListener("scroll", onScroll, { passive: true });
        return () => el.removeEventListener("scroll", onScroll);
    }, [isVertical, setOffsetX, setOffsetY]);

    return (
        <div
            id="offsetScale"
            ref={scrollRef}
            className={`
        ${isVertical ? "overflow-y-scroll h-full w-4" : "overflow-x-scroll w-full h-4"}
        scrollbar-thin
        ${resolvedTheme === "dark" ? "scrollbar-dark" : "scrollbar-light"}
      `}
            style={{ WebkitOverflowScrolling: "touch" }}
        >
            <div />
        </div>
    );
};

export default OffsetScale;
