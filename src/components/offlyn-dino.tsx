import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

/*
 * offlyn.love's 3D dino: the logo's pixel grid extruded into voxels and drawn
 * with raw WebGL. Ported from the offlyn.love landing page (Matrix3D), with
 * David's approval to publish it here.
 *
 * Without `interactive` it swings through a half turn and back, for cards
 * that are themselves links. With it, it can be dragged around and springs
 * back to a gentle sway. Rendering pauses while off screen.
 */

// 0 = empty · 1 = body · 2 = outline and eye
const RAW = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0],
  [0, 2, 2, 1, 1, 1, 1, 1, 1, 2, 2, 0],
  [0, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 0],
  [0, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0],
  [0, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0],
  [0, 2, 1, 1, 1, 1, 2, 2, 2, 2, 2, 0],
  [0, 2, 1, 1, 1, 1, 1, 1, 2, 0, 0, 0],
  [0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
]
const BODY: [number, number, number] = [0, 0, 0]
const EYE: [number, number, number] = [1, 1, 1]

const VS = `
  attribute vec3 aPos;
  attribute vec3 aCol;
  uniform mat4 uMVP;
  varying vec3 vCol;
  void main() {
    gl_Position = uMVP * vec4(aPos, 1.0);
    vCol = aCol;
  }
`
const FS = `
  precision mediump float;
  varying vec3 vCol;
  void main() { gl_FragColor = vec4(vCol, 1.0); }
`

// Column-major mat4 helpers.
type M4 = Float32Array

function mul(a: M4, b: M4): M4 {
  const o = new Float32Array(16)
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++) for (let k = 0; k < 4; k++) o[i + j * 4] += a[i + k * 4] * b[k + j * 4]
  return o
}

function perspective(fovY: number, aspect: number, near: number, far: number): M4 {
  const f = 1 / Math.tan(fovY * 0.5)
  const nf = 1 / (near - far)
  return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0])
}

function rotX(a: number): M4 {
  const c = Math.cos(a)
  const s = Math.sin(a)
  return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1])
}

function rotY(a: number): M4 {
  const c = Math.cos(a)
  const s = Math.sin(a)
  return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1])
}

function translate(x: number, y: number, z: number): M4 {
  return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1])
}

function scale(s: number): M4 {
  return new Float32Array([s, 0, 0, 0, 0, s, 0, 0, 0, 0, s, 0, 0, 0, 0, 1])
}

// Cube faces: +X, -X, +Y, -Y, +Z, -Z, each wound counter-clockwise from outside.
const FACES: [number, number, number][][] = [
  [[1, -1, -1], [1, 1, -1], [1, 1, 1], [1, -1, 1]],
  [[-1, -1, 1], [-1, 1, 1], [-1, 1, -1], [-1, -1, -1]],
  [[-1, 1, 1], [1, 1, 1], [1, 1, -1], [-1, 1, -1]],
  [[-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1]],
  [[-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]],
  [[1, -1, -1], [-1, -1, -1], [-1, 1, -1], [1, 1, -1]],
]

function buildGeometry() {
  const rows = RAW.length
  const cols = RAW[0].length
  const ox = -(cols - 1) / 2
  const oy = (rows - 1) / 2
  const verts: number[] = []
  const idxs: number[] = []
  let base = 0
  RAW.forEach((row, r) =>
    row.forEach((v, c) => {
      if (!v) return
      const [cr, cg, cb] = v === 2 ? EYE : BODY
      for (const face of FACES) {
        for (const [fx, fy, fz] of face) verts.push(c + ox + fx * 0.5, -r + oy + fy * 0.5, fz * 0.5, cr, cg, cb)
        idxs.push(base, base + 1, base + 2, base, base + 2, base + 3)
        base += 4
      }
    }),
  )
  return { verts: new Float32Array(verts), idxs: new Uint16Array(idxs) }
}

const IDLE_X = -0.1
const IDLE_Y = 0.35

export function OfflynDino({
  interactive = false,
  size = 0.9,
  className,
}: {
  interactive?: boolean
  /** Uniform scale of the model. */
  size?: number
  className?: string
}) {
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = box.current
    if (!container) return

    const canvas = document.createElement('canvas')
    canvas.style.cssText = 'width:100%;height:100%;display:block;'
    container.appendChild(canvas)
    const gl = canvas.getContext('webgl', { alpha: true, antialias: true })
    if (!gl) {
      container.removeChild(canvas)
      return
    }

    gl.enable(gl.DEPTH_TEST)
    gl.enable(gl.CULL_FACE)
    gl.clearColor(0, 0, 0, 0)

    const shader = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }
    const vs = shader(gl.VERTEX_SHADER, VS)
    const fs = shader(gl.FRAGMENT_SHADER, FS)
    const prog = gl.createProgram()!
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    gl.useProgram(prog)

    const { verts, idxs } = buildGeometry()
    const vbo = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW)
    const ibo = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idxs, gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(prog, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 24, 0)
    const aCol = gl.getAttribLocation(prog, 'aCol')
    gl.enableVertexAttribArray(aCol)
    gl.vertexAttribPointer(aCol, 3, gl.FLOAT, false, 24, 12)
    const uMVP = gl.getUniformLocation(prog, 'uMVP')

    let projView: M4 = new Float32Array(16)
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2)
      canvas.width = Math.max(1, container.clientWidth * dpr)
      canvas.height = Math.max(1, container.clientHeight * dpr)
      gl.viewport(0, 0, canvas.width, canvas.height)
      projView = mul(perspective((38 * Math.PI) / 180, canvas.width / canvas.height, 0.1, 200), translate(0, 0, -16))
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(container)

    // Reduced motion keeps the same shapes of motion, smaller and slower.
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const amp = calm ? 0.3 : 1
    const speed = calm ? 0.5 : 1

    let rx = IDLE_X
    let ry = IDLE_Y
    let dragging = false
    let returning = false
    let px = 0
    let py = 0

    const onDown = (e: PointerEvent) => {
      dragging = true
      returning = false
      px = e.clientX
      py = e.clientY
      container.setPointerCapture(e.pointerId)
      container.style.cursor = 'grabbing'
    }
    const onMove = (e: PointerEvent) => {
      if (!dragging) return
      ry += (e.clientX - px) * 0.009
      rx = Math.max(-1.2, Math.min(1.2, rx + (e.clientY - py) * 0.009))
      px = e.clientX
      py = e.clientY
    }
    const onUp = () => {
      if (!dragging) return
      dragging = false
      returning = true
      container.style.cursor = 'grab'
    }
    if (interactive) {
      container.style.cursor = 'grab'
      container.style.touchAction = 'none'
      container.addEventListener('pointerdown', onDown)
      container.addEventListener('pointermove', onMove)
      container.addEventListener('pointerup', onUp)
      container.addEventListener('pointercancel', onUp)
    }

    let raf = 0
    let visible = false
    const t0 = performance.now()
    const draw = () => {
      raf = requestAnimationFrame(draw)
      const t = ((performance.now() - t0) / 1000) * speed
      if (dragging) {
        // Pointer drives the rotation.
      } else if (returning) {
        // Spring back toward where the sway currently is, then hand over.
        const tx = IDLE_X + Math.sin(t * 0.4) * 0.07 * amp
        const ty = IDLE_Y + Math.sin(t * 0.6) * 0.22 * amp
        rx += (tx - rx) * 0.06
        ry += (ty - ry) * 0.06
        if (Math.abs(rx - tx) < 0.002 && Math.abs(ry - ty) < 0.002) returning = false
      } else if (interactive) {
        rx = IDLE_X + Math.sin(t * 0.4) * 0.07 * amp
        ry = IDLE_Y + Math.sin(t * 0.6) * 0.22 * amp
      } else {
        // A half turn and back: ±90° around the front.
        rx = IDLE_X + Math.sin(t * 0.4) * 0.07 * amp
        ry = Math.sin(t * 0.7) * (Math.PI / 2) * amp
      }
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      gl.uniformMatrix4fv(uMVP, false, mul(projView, mul(scale(size), mul(rotY(ry), rotX(rx)))))
      gl.drawElements(gl.TRIANGLES, idxs.length, gl.UNSIGNED_SHORT, 0)
    }
    const io = new IntersectionObserver(([entry]) => {
      const now = entry.isIntersecting
      if (now && !visible) draw()
      if (!now) cancelAnimationFrame(raf)
      visible = now
    })
    io.observe(container)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      container.removeEventListener('pointerdown', onDown)
      container.removeEventListener('pointermove', onMove)
      container.removeEventListener('pointerup', onUp)
      container.removeEventListener('pointercancel', onUp)
      gl.deleteProgram(prog)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteBuffer(vbo)
      gl.deleteBuffer(ibo)
      if (container.contains(canvas)) container.removeChild(canvas)
    }
  }, [interactive, size])

  return (
    <div
      ref={box}
      role="img"
      aria-label={interactive ? 'The offlyn.love dino in 3D. Drag to turn it.' : 'The offlyn.love dino in 3D'}
      className={cn('size-full select-none', className)}
    />
  )
}
