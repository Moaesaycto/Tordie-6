import Ruler from "@/components/viewport/Ruler"
import Viewport from "@/components/viewport/Viewport"
import OffsetScale from "@/components/viewport/OffsetScale"
import ToOriginButton from "@/components/viewport/ToOriginButton"
import { useViewportSize } from "@/components/hooks/viewport/useViewportSize"
import { useRef } from "react"

const RULER_SIZE = 20
const SCROLL_SIZE = 17

const Canvas = () => {
  const corner = <div className="bg-neutral-500 border-3 border-neutral-600" />
  const viewportRef = useRef<HTMLDivElement>(null!)
  useViewportSize(viewportRef)

  return (
    <div className="h-full w-full" id="main-canvas">
      <div className="bg-muted h-full flex items-center justify-center">
        <div
          className="grid h-full w-full min-w-0"
          style={{
            gridTemplateColumns: `${RULER_SIZE}px minmax(0,1fr) ${SCROLL_SIZE}px`,
            gridTemplateRows: `${RULER_SIZE}px minmax(0,1fr) ${SCROLL_SIZE}px`,
          }}
        >
          <ToOriginButton />
          <Ruler orientation="horizontal" />
          {corner}
          <Ruler orientation="vertical" />
          <div
            className="relative h-full w-full"
            id="viewport-wrapper"
            ref={viewportRef}
          >
            <Viewport />
          </div>
          <OffsetScale />
          {corner}
          <OffsetScale orientation="horizontal" />
          {corner}
        </div>
      </div>
    </div>
  )
}

export default Canvas
