import React, { useEffect, useRef } from 'react'
import { useSnapshot } from 'valtio'
import { state } from '@/components/canvas/CanvasState'
import { generateTicks } from '@/lib/ticks'
import { useTheme } from '@/components/theme-provider'
import { useApp } from '@/components/app-provider'

const RULER_THICKNESS = 20
const MAJOR_LENGTH = 10
const MINOR_LENGTH = 6
const SUB_LENGTH = 3
const MINOR_DIVISIONS = 5
const SUB_DIVISIONS = 2
const MARKER_SIZE = 7

const formatLabel = (val: number) => val.toFixed(0)
const getNiceStepSize = (len: number, zoom: number) => {
  void len
  const pixelsPerUnit = zoom
  const minSpacing = 50
  const rawStep = minSpacing / pixelsPerUnit
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)))
  const niceSteps = [1, 2, 5, 10]
  const step = niceSteps.find(s => rawStep <= s * magnitude) || 10
  return step * magnitude
}

const colourSchemes = {
  dark: { background: '#262626', overlap: '#404040', text: 'white', markerFill: 'white' },
  light: { background: '#dbdbdb', overlap: '#bababa', text: 'black', markerFill: 'black' },
}

type RulerProps = { orientation: 'horizontal' | 'vertical' }

const CanvasRuler: React.FC<RulerProps> = ({ orientation }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const snap = useSnapshot(state)
  const { resolvedTheme } = useTheme()
  const { viewport } = useApp()
  const cursor = viewport.viewportCursorCoords

  const colours = colourSchemes[resolvedTheme as 'dark' | 'light'] ?? colourSchemes.light
  const isVertical = orientation === 'vertical'
  const zoom = snap.zoom
  const offset = isVertical ? snap.pan.y : snap.pan.x
  const lengthPx = isVertical ? snap.viewport.height : snap.viewport.width
  const documentLength = isVertical ? snap.document?.height ?? 1000 : snap.document?.width ?? 1000

  const ticks = generateTicks({
    lengthPx,
    zoom,
    offset,
    getNiceStepSize,
    majorLength: MAJOR_LENGTH,
    minorLength: MINOR_LENGTH,
    subLength: SUB_LENGTH,
    minorDivisions: MINOR_DIVISIONS,
    subMinorDivisions: SUB_DIVISIONS,
    formatLabel,
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = isVertical ? RULER_THICKNESS : lengthPx
    const h = isVertical ? lengthPx : RULER_THICKNESS
    canvas.width = w * window.devicePixelRatio
    canvas.height = h * window.devicePixelRatio
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0)

    ctx.fillStyle = colours.background
    ctx.fillRect(0, 0, w, h)

    const docStartPx = offset
    const docLengthPx = documentLength * zoom
    ctx.fillStyle = colours.overlap
    if (isVertical) ctx.fillRect(0, docStartPx, RULER_THICKNESS, docLengthPx)
    else ctx.fillRect(docStartPx, 0, docLengthPx, RULER_THICKNESS)

    ctx.strokeStyle = colours.text
    ctx.fillStyle = colours.text
    ctx.font = '8px sans-serif'
    ctx.textBaseline = 'middle'

    for (const t of ticks) {
      const len = t.level === 'major' ? MAJOR_LENGTH : t.level === 'minor' ? MINOR_LENGTH : SUB_LENGTH
      if (isVertical) {
        ctx.beginPath()
        ctx.moveTo(0, t.posPx)
        ctx.lineTo(len, t.posPx)
        ctx.stroke()
        if (t.level === 'major') {
          ctx.save()
          ctx.textAlign = 'center'
          ctx.translate(MAJOR_LENGTH + 5, t.posPx)
          ctx.rotate(-Math.PI / 2)
          ctx.fillText(t.label ?? '', 0, 0)
          ctx.restore()
        }
      } else {
        ctx.beginPath()
        ctx.moveTo(t.posPx, 0)
        ctx.lineTo(t.posPx, len)
        ctx.stroke()
        if (t.level === 'major') {
          ctx.textAlign = 'center'
          ctx.fillText(t.label ?? '', t.posPx, MAJOR_LENGTH + 5)
        }
      }
    }

    if (cursor) {
      const cursorPosPxRaw = isVertical ? cursor.y : cursor.x
      const posPx = Math.max(0, Math.min(lengthPx, cursorPosPxRaw))
      
      ctx.fillStyle = colours.markerFill
      ctx.strokeStyle = colours.markerFill
      ctx.beginPath()
      if (isVertical) {
        const y = posPx
        ctx.moveTo(RULER_THICKNESS, y)
        ctx.lineTo(RULER_THICKNESS - MARKER_SIZE, y - MARKER_SIZE)
        ctx.lineTo(RULER_THICKNESS - MARKER_SIZE, y + MARKER_SIZE)
        ctx.closePath()
      } else {
        const x = posPx
        ctx.moveTo(x, RULER_THICKNESS)
        ctx.lineTo(x - MARKER_SIZE, RULER_THICKNESS - MARKER_SIZE)
        ctx.lineTo(x + MARKER_SIZE, RULER_THICKNESS - MARKER_SIZE)
        ctx.closePath()
      }
      ctx.fill()

      // If you want text over the ruler (unused but useful)
      /* const value = (posPx - offset) / zoom
      const label = formatLabel(value)
      ctx.fillStyle = colours.text
      ctx.font = '10px sans-serif'
      ctx.textBaseline = 'middle'
      if (isVertical) {
        ctx.textAlign = 'left'
        ctx.fillText(label, MARKER_SIZE + 2, Math.round(posPx))
      } else {
        ctx.textAlign = 'center'
        ctx.fillText(label, Math.round(posPx), RULER_THICKNESS - MARKER_SIZE - 8)
      } */
    }
  }, [
    isVertical,
    zoom,
    offset,
    lengthPx,
    documentLength,
    ticks,
    colours,
    cursor?.x,
    cursor?.y,
  ])

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', background: colours.background, pointerEvents: 'none' }}
    />
  )
}

export default React.memo(CanvasRuler)
