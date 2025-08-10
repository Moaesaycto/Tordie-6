import { useEffect, useRef } from 'react'

export function useThrottledSync<T>(
  value: T,
  set: (v: T) => void,
  compare: (a: T, b: T) => boolean = (a, b) => a !== b
) {
  const last = useRef<T>(value)
  const raf = useRef<number | null>(null)

  useEffect(() => {
    if (compare(last.current, value)) {
      if (raf.current) cancelAnimationFrame(raf.current)
      raf.current = requestAnimationFrame(() => {
        set(value)
        last.current = value
      })
    }
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [value])
}
