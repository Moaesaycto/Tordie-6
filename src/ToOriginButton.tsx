import { HomeIcon } from 'lucide-react'
import { state } from '@/CanvasState'
import Config from '@/tordie.config.json'

const ToOriginButton = () => {
  const { defaultOffsetX, defaultOffsetY, defaultZoom, defaultRotation } = Config.canvas

  const onClick = () => {
    state.pan.x = defaultOffsetX
    state.pan.y = defaultOffsetY
    state.zoom = defaultZoom
    state.rotation = defaultRotation
  }

  return (
    <button className="p-[3px]" onClick={onClick}>
      <HomeIcon className="w-full h-full" />
    </button>
  )
}

export default ToOriginButton
