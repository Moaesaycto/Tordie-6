import React, { useRef, useEffect } from 'react'
import { state } from '@/CanvasState'
import { useSnapshot } from 'valtio'

export default function CanvasRenderer() {
  const snap = useSnapshot(state)
  const svgRef = useRef<SVGSVGElement>(null)
  const transformRef = useRef<SVGGElement>(null)

  // Observe canvas resize
  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        state.viewport.width = width
        state.viewport.height = height
      }
    })
    if (svgRef.current) observer.observe(svgRef.current)
    return () => observer.disconnect()
  }, [])

  // Imperative pan/zoom update
  useEffect(() => {
    let frame: number
    const update = () => {
      transformRef.current?.setAttribute(
        'transform',
        `translate(${state.pan.x}, ${state.pan.y}) scale(${state.zoom})`
      )
      frame = requestAnimationFrame(update)
    }
    frame = requestAnimationFrame(update)
    return () => cancelAnimationFrame(frame)
  }, [])

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const bounds = svgRef.current?.getBoundingClientRect()
    const { left, top } = bounds!
    const cursorX = e.clientX - left
    const cursorY = e.clientY - top

    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
    const newZoom = state.zoom * zoomFactor

    state.pan.x = cursorX - ((cursorX - state.pan.x) / state.zoom) * newZoom
    state.pan.y = cursorY - ((cursorY - state.pan.y) / state.zoom) * newZoom
    state.zoom = newZoom
  }

  const onMouseDown = (e: React.MouseEvent) => {
    const bounds = svgRef.current?.getBoundingClientRect()
    const x = (e.clientX - bounds!.left - state.pan.x) / state.zoom
    const y = (e.clientY - bounds!.top - state.pan.y) / state.zoom

    if (e.button === 1) {
      state.middlePanning = true
      state.lastMouse = { x: e.clientX, y: e.clientY }
      e.preventDefault()
      return
    }

    const dx = x - state.circle.x
    const dy = y - state.circle.y
    if (Math.hypot(dx, dy) < 20) {
      state.dragging = true
      state.dragOffset = { x: dx, y: dy }
    }
  }

  const onMouseMove = (e: React.MouseEvent) => {
    const bounds = svgRef.current?.getBoundingClientRect()
    if (state.middlePanning) {
      const dx = e.clientX - state.lastMouse.x
      const dy = e.clientY - state.lastMouse.y
      state.pan.x += dx
      state.pan.y += dy
      state.lastMouse = { x: e.clientX, y: e.clientY }
      return
    }

    if (state.dragging) {
      const x = (e.clientX - bounds!.left - state.pan.x) / state.zoom
      const y = (e.clientY - bounds!.top - state.pan.y) / state.zoom
      state.circle = {
        x: x - state.dragOffset.x,
        y: y - state.dragOffset.y,
      }
    }
  }

  const onMouseUp = (e: React.MouseEvent) => {
    if (e.button === 1) state.middlePanning = false
    if (state.dragging) state.dragging = false
  }

  return (
    <svg
      ref={svgRef}
      width="99%"
      height="100%"
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      style={{
        background: '#f8f8f8',
        touchAction: 'none',
        cursor: snap.middlePanning ? 'grabbing' : 'default',
        overflow: 'hidden', // Stops default scrolling, hopefully
      }}
    >
      <g ref={transformRef}>
        <circle cx={snap.circle.x} cy={snap.circle.y} r={20} fill="tomato" />
      </g>
    </svg>
  )
}
