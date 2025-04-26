import { useTheme } from "@/components/theme-provider";
import { useRef, useEffect, useLayoutEffect, useState } from "react";
import Config from "@/tordie.config.json";
import { useStatus } from "@/components/status-provider";

const OffsetScale = ({ orientation = "vertical" }: { orientation?: "horizontal" | "vertical" }) => {
    const { resolvedTheme } = useTheme();
    const { paddingX, paddingY, defaultOffsetX, defaultOffsetY } = Config.canvas;
    const { documentHeight, documentWidth, setOffsetX, setOffsetY, zoom } = useStatus().canvas;
    const { viewportWidth, viewportHeight } = useStatus().viewport;

    const scrollRef = useRef<HTMLDivElement>(null);
    const lastScroll = useRef(0);
    const isVertical = orientation === "vertical";

    const viewportSize = isVertical ? viewportHeight : viewportWidth;
    const documentSize = isVertical ? documentHeight : documentWidth;
    const padding = isVertical ? paddingY : paddingX;

    const fullCanvasSize = 2 * padding * zoom + documentSize * zoom;
    const scrollableDistance = Math.max(0, fullCanvasSize - viewportSize);
    const scrollPercent = scrollableDistance > 0 ? (100 + (scrollableDistance / viewportSize) * 100) : 100;

    const [smoothOffset, setSmoothOffset] = useState(isVertical ? defaultOffsetY : defaultOffsetX);

    useLayoutEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const def = isVertical ? defaultOffsetY : defaultOffsetX;
        const minO = zoom * padding;
        const maxO = Math.min(minO, viewportSize - zoom * (padding + documentSize));

        const lambda = (def - minO) / (maxO - minO || 1);
        const t = Math.min(Math.max(lambda, 0), 1);

        const maxScroll = isVertical ? el.scrollHeight - el.clientHeight : el.scrollWidth - el.clientWidth;
        const scrollVal = t * maxScroll;

        if (isVertical) el.scrollTop = scrollVal;
        else el.scrollLeft = scrollVal;
    }, [isVertical, zoom, viewportSize, documentHeight, documentWidth, paddingX, paddingY, defaultOffsetX, defaultOffsetY]);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        let frame: number;

        const readScroll = () => {
            const pos = isVertical ? el.scrollTop : el.scrollLeft;
            lastScroll.current = pos;
            frame = requestAnimationFrame(readScroll);
        };

        readScroll();

        return () => cancelAnimationFrame(frame);
    }, [isVertical]);

    useEffect(() => {
        let frame: number;

        const smooth = () => {
            const el = scrollRef.current;
            if (!el) return;
            const maxScroll = isVertical ? el.scrollHeight - el.clientHeight : el.scrollWidth - el.clientWidth;

            const lambda = lastScroll.current / (maxScroll || 1);

            const minO = zoom * padding;
            const maxO = Math.min(minO, viewportSize - zoom * (padding + documentSize));
            const targetOffset = (1 - lambda) * minO + lambda * maxO;

            setSmoothOffset(prev => {
                const delta = targetOffset - prev;
                const next = prev + delta * 0.15; // smoothing factor
                return Math.abs(delta) < 0.5 ? targetOffset : next;
            });

            frame = requestAnimationFrame(smooth);
        };

        smooth();

        return () => cancelAnimationFrame(frame);
    }, [isVertical, zoom, viewportSize, documentHeight, documentWidth, paddingX, paddingY]);

    useEffect(() => {
        if (isVertical) setOffsetY(smoothOffset);
        else setOffsetX(smoothOffset);
    }, [smoothOffset, isVertical, setOffsetX, setOffsetY]);

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
            <div
                style={{
                    height: isVertical ? `${scrollPercent}%` : "100%",
                    width: isVertical ? "100%" : `${scrollPercent}%`,
                }}
            />
        </div>
    );
};

export default OffsetScale;
