import React from 'react'
import { useSnapshot } from 'valtio'
import { state } from '@/CanvasState'
import { generateTicks } from '@/lib/ticks'
import { useTheme } from '@/components/theme-provider'

const RULER_THICKNESS = 20
const MAJOR_LENGTH = 10
const MINOR_LENGTH = 6
const SUB_LENGTH = 3
const MINOR_DIVISIONS = 5
const SUB_DIVISIONS = 2

const colourSchemes = {
  dark: { background: '#262626', overlap: '#404040', text: 'white' },
  light: { background: '#dbdbdb', overlap: '#bababa', text: 'black' },
}

const formatLabel = (val: number) => val.toFixed(0)
const getNiceStepSize = (len: number, zoom: number) => {
  const pixelsPerUnit = zoom
  const minSpacing = 50
  const rawStep = minSpacing / pixelsPerUnit
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)))
  const niceSteps = [1, 2, 5, 10]
  const step = niceSteps.find(s => rawStep <= s * magnitude) || 10
  return step * magnitude
}

type RulerProps = { orientation: 'horizontal' | 'vertical' }

const Ruler: React.FC<RulerProps> = ({ orientation }) => {
  const snap = useSnapshot(state)
  const { resolvedTheme } = useTheme()
  const colours = colourSchemes[resolvedTheme as 'dark' | 'light'] ?? colourSchemes.light

  const isVertical = orientation === 'vertical'
  const zoom = snap.zoom
  const offset = isVertical ? snap.pan.y : snap.pan.x
  const lengthPx = isVertical ? snap.viewport.height : snap.viewport.width
  const documentLength = isVertical ? snap.document?.height ?? 1000 : snap.document?.width ?? 1000

  const svgW = isVertical ? RULER_THICKNESS : lengthPx
  const svgH = isVertical ? lengthPx : RULER_THICKNESS

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

  const docStartPx = offset + 0 * zoom
  const docLengthPx = documentLength * zoom

  return (
    <svg width={svgW} height={svgH}>
      {/* Background */}
      <rect width="100%" height="100%" fill={colours.background} />

      {/* Document region highlight */}
      <rect
        x={!isVertical ? docStartPx : 0}
        y={isVertical ? docStartPx : 0}
        width={!isVertical ? docLengthPx : RULER_THICKNESS}
        height={isVertical ? docLengthPx : RULER_THICKNESS}
        fill={colours.overlap}
      />

      {/* Ticks */}
      {ticks.map((t, i) => {
        const len =
          t.level === 'major' ? MAJOR_LENGTH : t.level === 'minor' ? MINOR_LENGTH : SUB_LENGTH

        return (
          <g key={i}>
            <line
              x1={isVertical ? 0 : t.posPx}
              y1={isVertical ? t.posPx : 0}
              x2={isVertical ? len : t.posPx}
              y2={isVertical ? t.posPx : len}
              stroke={colours.text}
              strokeWidth={1}
            />
            {t.level === 'major' && (
              <text
                x={isVertical ? 2 : t.posPx}
                y={isVertical ? t.posPx : 10}
                fontSize={8}
                fill={colours.text}
                textAnchor={isVertical ? 'start' : 'middle'}
                dominantBaseline="middle"
                transform={isVertical ? `rotate(-90, 2, ${t.posPx})` : undefined}
              >
                {t.label}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export default React.memo(Ruler)
