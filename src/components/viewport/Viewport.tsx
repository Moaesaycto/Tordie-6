import React, { useRef, useEffect } from 'react'
import { state } from '@/CanvasState'
import { useSnapshot } from 'valtio'
import { useStatus } from '../status-provider'

const MIN_ZOOM = 0.05
const MAX_ZOOM = 50



export default function Viewport() {
  const snap = useSnapshot(state)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const {
    viewport: {
      setViewportCursorCoords,
      setZoom,
      setOffsetX,
      setOffsetY,
      setViewportWidth,
      setViewportHeight,
    }
  } = useStatus();

  useEffect(() => {
    setZoom(snap.zoom);
    setOffsetX(snap.pan.x);
    setOffsetY(snap.pan.y);
  }, [snap.zoom, snap.pan.x, snap.pan.y]);


  // Resize canvas to match container
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current
      const wrapper = wrapperRef.current
      if (!canvas || !wrapper) return

      const { width, height } = wrapper.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      setViewportWidth(width)
      setViewportHeight(height)
    }

    const observer = new ResizeObserver(resize)
    if (wrapperRef.current) observer.observe(wrapperRef.current)

    resize() // Initial sizing

    return () => observer.disconnect()
  }, [])

  // Drawing
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1

    const draw = () => {
      ctx.save()
      ctx.setTransform(1, 0, 0, 1, 0, 0) // reset
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      ctx.scale(dpr, dpr)
      ctx.setTransform(snap.zoom, 0, 0, snap.zoom, snap.pan.x, snap.pan.y)

      ctx.beginPath()
      ctx.arc(snap.circle.x, snap.circle.y, 20, 0, Math.PI * 2)
      ctx.fillStyle = 'tomato'
      ctx.fill()
      ctx.restore()

      requestAnimationFrame(draw)
    }

    draw()
  }, [snap])

  const getCanvasPoint = (e: React.MouseEvent) => {
    const bounds = canvasRef.current!.getBoundingClientRect()
    return {
      x: e.clientX - bounds.left,
      y: e.clientY - bounds.top,
    }
  }

  // We must use useEffect hook for sideways scrolling
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()

      if (Math.abs(e.deltaX) > 1) {
        state.pan.x -= e.deltaX
        return
      }

      const bounds = canvas.getBoundingClientRect()
      const x = e.clientX - bounds.left
      const y = e.clientY - bounds.top

      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
      const rawZoom = state.zoom * zoomFactor
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, rawZoom))

      state.pan.x = x - ((x - state.pan.x) / state.zoom) * newZoom
      state.pan.y = y - ((y - state.pan.y) / state.zoom) * newZoom
      state.zoom = newZoom
    }

    canvas.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      canvas.removeEventListener('wheel', handleWheel)
    }
  }, [])


  const onMouseDown = (e: React.MouseEvent) => {
    const { x, y } = getCanvasPoint(e)
    const wx = (x - state.pan.x) / state.zoom
    const wy = (y - state.pan.y) / state.zoom

    if (e.button === 1) {
      state.middlePanning = true
      state.lastMouse = { x: e.clientX, y: e.clientY }
      e.preventDefault()
      return
    }

    const dx = wx - state.circle.x
    const dy = wy - state.circle.y
    if (Math.hypot(dx, dy) < 20) {
      state.dragging = true
      state.dragOffset = { x: dx, y: dy }
    }
  }

  const onMouseMove = (e: React.MouseEvent) => {
    const { x, y } = getCanvasPoint(e);
    setViewportCursorCoords({ x, y });

    if (state.middlePanning) {
      const dx = e.clientX - state.lastMouse.x
      const dy = e.clientY - state.lastMouse.y
      state.pan.x += dx
      state.pan.y += dy
      state.lastMouse = { x: e.clientX, y: e.clientY }
      return
    }

    if (state.dragging) {
      const { x, y } = getCanvasPoint(e)
      const wx = (x - state.pan.x) / state.zoom
      const wy = (y - state.pan.y) / state.zoom
      state.circle = {
        x: wx - state.dragOffset.x,
        y: wy - state.dragOffset.y,
      }
    }
  }

  const onMouseUp = (e: React.MouseEvent) => {
    if (e.button === 1) state.middlePanning = false
    if (state.dragging) state.dragging = false
  }


  return (
    <div ref={wrapperRef} className="flex flex-col min-w-0 min-h-0 w-full h-full">
      <canvas
        ref={canvasRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={() => setViewportCursorCoords(null)}
        style={{
          display: 'block',
          background: '#f8f8f8',
          touchAction: 'none',
          cursor: snap.middlePanning ? 'grabbing' : 'default',
        }}
      />
    </div>
  )
}
