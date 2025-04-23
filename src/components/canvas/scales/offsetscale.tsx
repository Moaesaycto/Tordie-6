import { useTheme } from "@/components/theme-provider";
import { useRef, useEffect } from "react";
import Congif from "@/tordie.config.json";
import { useStatus } from "@/components/status-provider";

type OffsetScaleProps = {
    orientation?: "horizontal" | "vertical",
}

const OffsetScale = ({ orientation = "vertical" }: OffsetScaleProps) => {
    const { resolvedTheme } = useTheme();
    const isVertical = orientation === "vertical";
    const scrollRef = useRef<HTMLDivElement>(null);

    const { paddingX, paddingY } = Congif.canvas;
    const { documentHeight, documentWidth, setOffsetX, setOffsetY, rotation, zoom } = useStatus().canvas;

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const thumb = resolvedTheme === "dark" ? "#737373" : "#a3a3a3";
        const track = resolvedTheme === "dark" ? "#262626" : "#f5f5f5";
        el.style.setProperty("--thumb-colour", thumb);
        el.style.setProperty("--track-colour", track);

        const viewport = document.getElementById("canvasPage")?.getBoundingClientRect();
        const viewportHeight = viewport?.height;
        const viewportWidth = viewport?.width;
        const minOffset = isVertical ? paddingY : paddingX;
        const maxOffset = isVertical
            ? Math.max(0, (viewportHeight ?? 0 - documentHeight) / 2) - paddingY
            : Math.max(0, (viewportWidth ?? 0 - documentWidth) / 2) - paddingX;

        const handleScroll = () => {
            const scrollValue = isVertical ? el.scrollTop : el.scrollLeft;
            const maxScroll = isVertical
                ? el.scrollHeight - el.clientHeight
                : el.scrollWidth - el.clientWidth;


            const lambda = scrollValue / maxScroll;
            const settingOffset = (1 - lambda) * minOffset + lambda * maxOffset;

            console.log(settingOffset);
            if (isVertical) {
                setOffsetY(settingOffset);
            } else {
                setOffsetX(settingOffset);
            }
        };

        el.addEventListener("scroll", handleScroll);
        return () => el.removeEventListener("scroll", handleScroll);
    }, [resolvedTheme, isVertical]);


    return (
        <div
            ref={scrollRef}
            className={`
        ${isVertical ? "overflow-y-scroll h-full w-4" : "overflow-x-scroll w-full h-4"}
        scrollbar-thin
      `}
            style={{
                scrollbarColor: "var(--thumb-colour) var(--track-colour)",
                WebkitOverflowScrolling: "touch",
            }}
        >
            <div
                style={{
                    height: isVertical ? "2000px" : "100%",
                    width: isVertical ? "100%" : "2000px",
                }}
            />
            <style>{`
                div::-webkit-scrollbar {
                    ${isVertical ? "width" : "height"}: 4px;
                }
                div::-webkit-scrollbar-track {
                    background: var(--track-colour);
                }
                div::-webkit-scrollbar-thumb {
                    background: var(--thumb-colour);
                    border-radius: 2px;
                }
            `}</style>
        </div>
    );
};

export default OffsetScale;
