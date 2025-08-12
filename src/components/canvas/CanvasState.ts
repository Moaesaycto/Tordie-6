import { proxy } from 'valtio'

export const state = proxy({
  zoom: 1,
  rotation: 0,
  pan: { x: 0, y: 0 },
  circle: { x: 100, y: 100 },
  dragging: false,
  dragOffset: { x: 0, y: 0 },
  middlePanning: false,
  lastMouse: { x: 0, y: 0 },
  viewport: { width: 0, height: 0 },
  document: {
    width: 1000,
    height: 1000
  }
})
