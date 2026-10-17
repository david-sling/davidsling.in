import { useEffect, useRef } from 'react'

/**
 * A live double pendulum in the spirit of Equanim's own example spec: the
 * state is integrated with RK4 every frame and the lower bob leaves a
 * fading trail. Runs only while on screen; reduced motion draws one still
 * frame of an already-traced path.
 */
const G = 9.81
type State = [number, number, number, number] // θ1, θ2, ω1, ω2

function derive([t1, t2, w1, w2]: State): State {
  const d = t1 - t2
  const den = 3 - Math.cos(2 * d)
  const a1 =
    (-G * 3 * Math.sin(t1) - G * Math.sin(t1 - 2 * t2) - 2 * Math.sin(d) * (w2 * w2 + w1 * w1 * Math.cos(d))) / den
  const a2 = (2 * Math.sin(d) * (w1 * w1 * 2 + G * 2 * Math.cos(t1) + w2 * w2 * Math.cos(d))) / den
  return [w1, w2, a1, a2]
}

function rk4(s: State, h: number): State {
  const add = (a: State, b: State, k: number) => a.map((v, i) => v + b[i] * k) as State
  const k1 = derive(s)
  const k2 = derive(add(s, k1, h / 2))
  const k3 = derive(add(s, k2, h / 2))
  const k4 = derive(add(s, k3, h))
  return s.map((v, i) => v + (h / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i])) as State
}

export function Pendulum({ className, active = true }: { className?: string; active?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const el = canvas.current
    const ctx = el?.getContext('2d')
    if (!el || !ctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let state: State = [2.2, 2.6, 0, 0]
    const trail: { x: number; y: number }[] = []
    let raf = 0
    let visible = false
    let w = 0
    let h = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = el.clientWidth
      h = el.clientHeight
      el.width = w * dpr
      el.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const ink = 'oklch(0.2 0.035 225)'
    const draw = () => {
      const L = Math.min(w, h) * 0.2
      const ox = w / 2
      const oy = h * 0.47
      const x1 = ox + L * Math.sin(state[0])
      const y1 = oy + L * Math.cos(state[0])
      const x2 = x1 + L * Math.sin(state[1])
      const y2 = y1 + L * Math.cos(state[1])
      trail.push({ x: x2, y: y2 })
      if (trail.length > 260) trail.shift()

      ctx.clearRect(0, 0, w, h)
      ctx.lineCap = 'round'
      for (let i = 1; i < trail.length; i++) {
        const a = i / trail.length
        ctx.strokeStyle = `oklch(0.2 0.035 225 / ${a * 0.55})`
        ctx.lineWidth = 1 + a * 2
        ctx.beginPath()
        ctx.moveTo(trail[i - 1].x, trail[i - 1].y)
        ctx.lineTo(trail[i].x, trail[i].y)
        ctx.stroke()
      }
      ctx.strokeStyle = ink
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(ox, oy)
      ctx.lineTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
      ctx.fillStyle = ink
      for (const [x, y, r] of [
        [ox, oy, 4],
        [x1, y1, 9],
        [x2, y2, 9],
      ]) {
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const step = () => {
      for (let i = 0; i < 4; i++) state = rk4(state, 1 / 240)
      draw()
      raf = requestAnimationFrame(step)
    }

    resize()
    if (reduce) {
      for (let i = 0; i < 1100; i++) {
        state = rk4(state, 1 / 240)
        if (i % 4 === 0) {
          draw()
        }
      }
    } else {
      draw()
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      cancelAnimationFrame(raf)
      if (visible && active && !reduce) raf = requestAnimationFrame(step)
    })
    io.observe(el)
    const ro = new ResizeObserver(() => {
      resize()
      draw()
    })
    ro.observe(el)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
    }
  }, [active])

  return <canvas ref={canvas} className={className} aria-hidden />
}
