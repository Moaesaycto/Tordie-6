import { useRef, useLayoutEffect, useEffect } from 'react'
import { useSnapshot } from 'valtio'
import { state } from '@/components/canvas/CanvasState'
import { useTheme } from '@/components/theme-provider'
import Config from '@/tordie.config.json'

const OffsetScale = ({ orientation = 'vertical' }: { orientation?: 'horizontal' | 'vertical' }) => {
  const snap = useSnapshot(state)
  const vert = orientation === 'vertical'
  const { resolvedTheme } = useTheme()

  const scrollRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)
  const skip = useRef(false)
  const upper = useRef(0)

  const zoom = snap.zoom
  const pan = vert ? snap.pan.y : snap.pan.x
  const view = vert ? snap.viewport.height : snap.viewport.width
  const doc = vert ? snap.document?.height ?? 1000 : snap.document?.width ?? 1000 // fallback sizes
  const pad = vert ? Config.canvas.paddingY : Config.canvas.paddingX
  const offPx = pan

  useLayoutEffect(() => {
    const s = scrollRef.current
    const t = thumbRef.current
    if (!s || !t) return

    const pMin = zoom * pad
    const pMax = Math.min(pMin, view - zoom * (pad + doc))
    const low = Math.min(pMax, offPx)
    const hi = Math.max(pMin, offPx)
    upper.current = hi

    const size = view + Math.max(hi - low, 1)
    if (vert) t.style.height = `${size}px`
    else t.style.width = `${size}px`

    const want = hi - offPx
    if (Math.abs((vert ? s.scrollTop : s.scrollLeft) - want) > 0.1) {
      skip.current = true
      if (vert) s.scrollTop = want
      else s.scrollLeft = want
      requestAnimationFrame(() => (skip.current = false))
    }
  }, [vert, offPx, zoom, pad, view, doc])

  useEffect(() => {
    const s = scrollRef.current
    if (!s) return
    const onScroll = () => {
      if (skip.current) return
      const pos = vert ? s.scrollTop : s.scrollLeft
      const v = upper.current - pos
      if (vert) state.pan.y = v
      else state.pan.x = v
    }
    s.addEventListener('scroll', onScroll, { passive: true })
    return () => s.removeEventListener('scroll', onScroll)
  }, [vert, zoom])

  return (
    <div
      ref={scrollRef}
      className={`${
        vert ? 'overflow-y-scroll h-full w-4' : 'overflow-x-scroll w-full h-4'
      } scrollbar-thin ${resolvedTheme === 'dark' ? 'scrollbar-dark' : 'scrollbar-light'}`}
    >
      <div ref={thumbRef} />
    </div>
  )
}

export default OffsetScale
