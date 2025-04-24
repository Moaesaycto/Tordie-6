type TickLevel = 'major' | 'minor' | 'sub';
type Tick = { posPx: number; level: TickLevel; label?: string };

export function generateTicks({
  lengthPx,
  zoom,
  offset,
  getNiceStepSize,
  majorLength,
  minorLength,
  subLength,
  minorDivisions,
  subMinorDivisions,
  formatLabel
}: {
  lengthPx: number,
  zoom: number,
  offset: number,
  getNiceStepSize: (len: number, zoom: number) => number,
  majorLength: number,
  minorLength: number,
  subLength: number,
  minorDivisions: number,
  subMinorDivisions: number,
  formatLabel: (val: number) => string,
}): Tick[] {
  if (!lengthPx || zoom <= 0) return [];

  const majorInterval = getNiceStepSize(lengthPx, zoom);
  const viewStart = -offset / zoom;
  const viewEnd = (lengthPx - offset) / zoom;
  const startIdx = Math.floor(viewStart / majorInterval);
  const endIdx = Math.ceil(viewEnd / majorInterval);

  const ticks: Tick[] = [];

  for (let i = startIdx; i <= endIdx; i++) {
    const baseVal = i * majorInterval;
    const majorPos = baseVal * zoom + offset;
    if (majorPos < -majorLength || majorPos > lengthPx + majorLength) continue;

    ticks.push({ posPx: majorPos, level: 'major', label: formatLabel(baseVal) });

    for (let j = -minorDivisions; j < minorDivisions; j++) {
      const pos = (baseVal + (j * majorInterval) / minorDivisions) * zoom + offset;
      if (pos >= -minorLength && pos <= lengthPx + minorLength) {
        ticks.push({ posPx: pos, level: 'minor' });
      }
    }

    for (let j = -minorDivisions * subMinorDivisions; j < minorDivisions * subMinorDivisions; j++) {
      const pos = (baseVal + (j * majorInterval) / (minorDivisions * subMinorDivisions)) * zoom + offset;
      if (pos >= -subLength && pos <= lengthPx + subLength) {
        ticks.push({ posPx: pos, level: 'sub' });
      }
    }
  }

  return ticks;
}
