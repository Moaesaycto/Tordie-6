import { useTheme } from "@/components/theme-provider";
import { useRef, useEffect, useLayoutEffect, useState } from "react";
import Config from "@/tordie.config.json";
import { useStatus } from "@/components/status-provider";

const OffsetScale = ({
    orientation = "vertical",
}: {
    orientation?: "horizontal" | "vertical";
}) => {
    const { resolvedTheme } = useTheme();
    const { paddingX, paddingY, defaultOffsetX, defaultOffsetY } =
        Config.canvas;
    const {
        documentHeight,
        documentWidth,
        setOffsetX,
        setOffsetY,
    } = useStatus().canvas;

    const scrollRef = useRef<HTMLDivElement>(null);
    const viewportRef = useRef<HTMLElement | null>(null);
    const vpSize = useRef({ width: 0, height: 0 });
    const [viewportReady, setViewportReady] = useState(false);
    const ticking = useRef(false);
    const isVertical = orientation === "vertical";

    // prevent native body scroll
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    // observe viewport size once, then mark ready
    useEffect(() => {
        viewportRef.current = document.getElementById("canvasViewport");
        if (!viewportRef.current) return;

        const ro = new ResizeObserver((entries) => {
            for (let { contentRect } of entries) {
                vpSize.current = {
                    width: contentRect.width,
                    height: contentRect.height,
                };
                setViewportReady(true);
            }
        });

        ro.observe(viewportRef.current);
        return () => ro.disconnect();
    }, []);

    // set initial scroll position once viewport is measured
    useLayoutEffect(() => {
        if (!viewportReady) return;
        const el = scrollRef.current;
        if (!el) return;

        const minO = isVertical ? paddingY : paddingX;
        const maxO = isVertical
            ? vpSize.current.height - paddingY - documentHeight
            : vpSize.current.width - paddingX - documentWidth;

        // avoid divide-by-zero
        const span = maxO - minO || 1;
        const def = isVertical ? defaultOffsetY : defaultOffsetX;
        const lambda = Math.min(Math.max((def - minO) / span, 0), 1);

        const maxScroll = isVertical
            ? el.scrollHeight - el.clientHeight
            : el.scrollWidth - el.clientWidth;

        if (maxScroll > 0) {
            const scrollVal = lambda * maxScroll;
            if (isVertical) el.scrollTop = scrollVal;
            else el.scrollLeft = scrollVal;
        }
    }, [
        viewportReady,
        paddingX,
        paddingY,
        documentHeight,
        documentWidth,
        defaultOffsetX,
        defaultOffsetY,
        isVertical,
    ]);

    // scroll handler with guards
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const onScroll = () => {
            if (ticking.current) return;
            ticking.current = true;

            requestAnimationFrame(() => {
                // skip until we have a valid viewport size
                if (vpSize.current.width === 0 || vpSize.current.height === 0) {
                    ticking.current = false;
                    return;
                }

                const scrollValue = isVertical ? el.scrollTop : el.scrollLeft;
                const maxScroll = isVertical
                    ? el.scrollHeight - el.clientHeight
                    : el.scrollWidth - el.clientWidth;

                if (maxScroll === 0) {
                    ticking.current = false;
                    return;
                }

                const minO = isVertical ? paddingY : paddingX;
                const maxO = isVertical
                    ? vpSize.current.height - paddingY - documentHeight
                    : vpSize.current.width - paddingX - documentWidth;

                const lambda = scrollValue / maxScroll;
                const offset = (1 - lambda) * minO + lambda * maxO;
                isVertical ? setOffsetY(offset) : setOffsetX(offset);

                ticking.current = false;
            });
        };

        el.addEventListener("scroll", onScroll, { passive: true });
        return () => el.removeEventListener("scroll", onScroll);
    }, [
        isVertical,
        paddingX,
        paddingY,
        documentHeight,
        documentWidth,
        setOffsetX,
        setOffsetY,
    ]);

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
                    height: isVertical ? "2000px" : "100%",
                    width: isVertical ? "100%" : "2000px",
                }}
            />
        </div>
    );
};

export default OffsetScale;
