import React from 'react'

type RulerProps = {
  start: number
  end: number
  orientation?: 'horizontal' | 'vertical'
  lengthPx?: number        // total length in pixels
  thicknessPx?: number     // thickness of the ruler in pixels
  paddingPx?: number       // padding at both ends in pixels
  majorTickStep?: number   // value‑step between long ticks
  minorTicksPerMajor?: number    // number of minor ticks between each major tick
  subMinorTicksPerMinor?: number // number of sub‑minor ticks between each minor tick interval
  showMinorLabels?: boolean        // if true, label the minor ticks as well
}

const Ruler: React.FC<RulerProps> = ({
  start,
  end,
  orientation = 'horizontal',
  lengthPx = 600,
  thicknessPx = 30,
  paddingPx = 10,
  majorTickStep = 1,
  minorTicksPerMajor = 10,
  subMinorTicksPerMinor = 10,
  showMinorLabels = true,
}) => {
  const range = end - start
  const usablePx = lengthPx - 2 * paddingPx
  const pixelsPerUnit = usablePx / range
  const majorCount = Math.floor(range / majorTickStep)

  type Tick = { pos: number; type: 'major' | 'minor' | 'subMinor'; value: number | null }
  const ticks: Tick[] = []

  // Loop through each major interval and generate ticks
  for (let i = 0; i < majorCount; i++) {
    const rawMajorValue = start + i * majorTickStep
    const majorValue = parseFloat(rawMajorValue.toFixed(3))
    const majorPos = paddingPx + (rawMajorValue - start) * pixelsPerUnit
    ticks.push({ pos: majorPos, type: 'major', value: majorValue })

    // Subdivide between this major and the next
    const intervalStart = rawMajorValue
    const minorStep = majorTickStep / minorTicksPerMajor

    // Generate minor ticks and their sub-minors
    for (let m = 1; m <= minorTicksPerMajor; m++) {
      const rawMinorValue = intervalStart + m * minorStep
      const minorValue = parseFloat(rawMinorValue.toFixed(3))
      const minorPos = paddingPx + (rawMinorValue - start) * pixelsPerUnit
      ticks.push({ pos: minorPos, type: 'minor', value: minorValue })

      // Sub-minors between this and the previous tick
      if (subMinorTicksPerMinor > 0) {
        const subIntervalStart = intervalStart + (m - 1) * minorStep
        const subStep = minorStep / (subMinorTicksPerMinor + 1)
        for (let k = 1; k <= subMinorTicksPerMinor; k++) {
          const rawSubValue = subIntervalStart + k * subStep
          const subPos = paddingPx + (rawSubValue - start) * pixelsPerUnit
          ticks.push({ pos: subPos, type: 'subMinor', value: null })
        }
      }
    }
  }

  // Push final major tick at end
  const rawFinalMajor = start + majorCount * majorTickStep
  const finalMajorValue = parseFloat(rawFinalMajor.toFixed(3))
  const finalMajorPos = paddingPx + (rawFinalMajor - start) * pixelsPerUnit
  ticks.push({ pos: finalMajorPos, type: 'major', value: finalMajorValue })

  // SVG dimensions
  const svgWidth = orientation === 'horizontal' ? lengthPx : thicknessPx
  const svgHeight = orientation === 'horizontal' ? thicknessPx : lengthPx

  const lineProps = (pos: number, len: number) =>
    orientation === 'horizontal'
      ? { x1: pos, y1: svgHeight - 1, x2: pos, y2: svgHeight - 1 - len }
      : { x1: 0, y1: pos, x2: len, y2: pos }

  const textProps = (pos: number, len: number, fontSize: number) =>
    orientation === 'horizontal'
      ? { x: pos, y: svgHeight - len - 2, textAnchor: 'middle' as const }
      : { x: len + 2, y: pos + fontSize / 3, textAnchor: 'start' as const }

  return (
    <svg width={svgWidth} height={svgHeight} className="block">
      {/* baseline */}
      {orientation === 'horizontal' ? (
        <line
          x1={paddingPx}
          y1={svgHeight - 1}
          x2={lengthPx - paddingPx}
          y2={svgHeight - 1}
          stroke="currentColor"
        />
      ) : (
        <line
          x1={0}
          y1={paddingPx}
          x2={0}
          y2={lengthPx - paddingPx}
          stroke="currentColor"
        />
      )}

      {ticks.map((tick, i) => {
        const tickLen =
          tick.type === 'major'
            ? thicknessPx * 0.6
            : tick.type === 'minor'
            ? thicknessPx * 0.4
            : thicknessPx * 0.2
        const fontSize = thicknessPx * 0.4

        // compute text attributes and optional rotation
        const { x: textX, y: textY, textAnchor } = textProps(tick.pos, tickLen, fontSize)
        const transform =
          orientation === 'vertical'
            ? `rotate(-90 ${textX} ${textY})`
            : undefined

        return (
          <g key={i}>
            <line {...lineProps(tick.pos, tickLen)} stroke="currentColor" />
            {(tick.type === 'major' || (tick.type === 'minor' && showMinorLabels)) && tick.value != null && (
              <text
                x={textX}
                y={textY}
                textAnchor={textAnchor}
                transform={transform}
                fontSize={fontSize}
                fill="currentColor"
              >
                {tick.value}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export default Ruler
