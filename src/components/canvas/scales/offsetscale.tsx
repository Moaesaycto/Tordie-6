import { useTheme } from "@/components/theme-provider";
import { useRef, useEffect } from "react";

type OffsetScaleProps = {
    orientation?: "horizontal" | "vertical",
}

const OffsetScale = ({ orientation = "vertical" }: OffsetScaleProps) => {
    const { resolvedTheme } = useTheme();
    const isVertical = orientation === "vertical";
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!scrollRef.current) return;
        const el = scrollRef.current;

        const thumb = resolvedTheme === "dark" ? "#737373" : "#a3a3a3";
        const track = resolvedTheme === "dark" ? "#262626" : "#f5f5f5";

        el.style.setProperty("--thumb-colour", thumb);
        el.style.setProperty("--track-colour", track);
    }, [resolvedTheme]);

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
