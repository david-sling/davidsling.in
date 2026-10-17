import { useCallback, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'

/**
 * Spell UI's Tilt Card, tuned down for content: a few degrees of tilt
 * toward the pointer and a soft spotlight. Only fine pointers tilt; touch
 * and reduced motion get a flat card.
 */
export function TiltCard({
  tiltLimit = 4,
  scale = 1.012,
  perspective = 1400,
  className,
  children,
}: {
  tiltLimit?: number
  scale?: number
  perspective?: number
  className?: string
  children?: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const rest = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)`
  const [transform, setTransform] = useState(rest)
  const [spot, setSpot] = useState({ x: 50, y: 50, on: false })

  const onMove = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType !== 'mouse' || !ref.current) return
      const r = ref.current.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width
      const py = (e.clientY - r.top) / r.height
      setSpot({ x: px * 100, y: py * 100, on: true })
      if (reduce) return
      const rx = (0.5 - py) * tiltLimit * 2
      const ry = (px - 0.5) * tiltLimit * 2
      setTransform(
        `perspective(${perspective}px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(${scale},${scale},${scale})`,
      )
    },
    [perspective, reduce, scale, tiltLimit],
  )

  const onLeave = useCallback(() => {
    setTransform(rest)
    setSpot((s) => ({ ...s, on: false }))
  }, [rest])

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cn('relative overflow-hidden will-change-transform', className)}
      style={{ transform, transition: 'transform 0.35s var(--ease-out)' }}
    >
      {children}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
        style={{
          opacity: spot.on ? 1 : 0,
          background: `radial-gradient(circle at ${spot.x}% ${spot.y}%, oklch(1 0 0 / 0.22), transparent 45%)`,
        }}
      />
    </div>
  )
}
