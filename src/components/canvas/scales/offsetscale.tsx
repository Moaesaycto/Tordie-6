import { useRef, useLayoutEffect, useEffect } from "react";
import { useTheme } from "@/components/theme-provider";
import { useStatus } from "@/components/status-provider";
import Config from "@/tordie.config.json";

const OffsetScale = ({ orientation = "vertical" }: { orientation?: "horizontal" | "vertical" }) => {
  const vert = orientation === "vertical";
  const { resolvedTheme } = useTheme();
  const {
    canvas: { documentWidth, documentHeight, offsetX, offsetY, setOffsetX, setOffsetY, zoom },
    viewport: { viewportWidth, viewportHeight },
  } = useStatus();

  const scrollRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const skip = useRef(false);
  const upper = useRef(0);

  const view = vert ? viewportHeight : viewportWidth;
  const doc = vert ? documentHeight : documentWidth;
  const pad = vert ? Config.canvas.paddingY : Config.canvas.paddingX;
  const offPx = (vert ? offsetY : offsetX) * zoom;

  useLayoutEffect(() => {
    const s = scrollRef.current;
    const t = thumbRef.current;
    if (!s || !t) return;

    const pMin = zoom * pad;
    const pMax = Math.min(pMin, view - zoom * (pad + doc));
    const low = Math.min(pMax, offPx);
    const hi = Math.max(pMin, offPx);
    upper.current = hi;

    const size = view + Math.max(hi - low, 1);
    if (vert) t.style.height = `${size}px`;
    else t.style.width = `${size}px`;

    const want = hi - offPx;
    if (Math.abs((vert ? s.scrollTop : s.scrollLeft) - want) > 0.1) {
      skip.current = true;
      if (vert) s.scrollTop = want;
      else s.scrollLeft = want;
      requestAnimationFrame(() => (skip.current = false));
    }
  }, [vert, offPx, zoom, pad, view, doc]);

  useEffect(() => {
    const s = scrollRef.current;
    if (!s) return;
    const onScroll = () => {
      if (skip.current) return;
      const pos = vert ? s.scrollTop : s.scrollLeft;
      const v = (upper.current - pos) / zoom;
      if (vert) setOffsetY(v);
      else setOffsetX(v);
    };
    s.addEventListener("scroll", onScroll, { passive: true });
    return () => s.removeEventListener("scroll", onScroll);
  }, [vert, setOffsetX, setOffsetY, zoom]);

  return (
    <div
      ref={scrollRef}
      className={`${vert ? "overflow-y-scroll h-full w-4" : "overflow-x-scroll w-full h-4"} scrollbar-thin ${resolvedTheme === "dark" ? "scrollbar-dark" : "scrollbar-light"
        }`}
    >
      <div ref={thumbRef} />
    </div>
  );
};

export default OffsetScale;
