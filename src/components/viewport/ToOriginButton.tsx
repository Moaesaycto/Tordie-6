import { HomeIcon } from 'lucide-react'
import { state } from '@/components/canvas/CanvasState'
import Config from '@/tordie.config.json'

export const ToOrigin = () => {
  const { defaultOffsetX, defaultOffsetY, defaultZoom, defaultRotation } = Config.canvas

  state.pan.x = defaultOffsetX
  state.pan.y = defaultOffsetY
  state.zoom = defaultZoom
  state.rotation = defaultRotation
}

const ToOriginButton = () => {

  return (
    <button className="p-[3px]" onClick={ToOrigin}>
      <HomeIcon className="w-full h-full" />
    </button>
  )
}

export default ToOriginButton
