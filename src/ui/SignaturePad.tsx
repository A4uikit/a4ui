// Canvas-based signature capture. DPR-aware sizing (crisp strokes on retina),
// pointer events (mouse + touch + pen in one listener set), and a stroke stack
// so Undo can redraw from scratch instead of trying to "erase" a curve.
import { Eraser, Undo2 } from 'lucide-solid'
import { createSignal, onCleanup, onMount, type JSX } from 'solid-js'

import { cn } from '../lib/cn'

interface Point {
  x: number
  y: number
}

type Stroke = Point[]

export interface SignaturePadProps {
  /** Called with a PNG data URL after each completed stroke, or `null` once the pad is empty (cleared/undone to nothing). */
  onChange?: (dataUrl: string | null) => void
  /** Canvas height in CSS pixels. @default 200 */
  height?: number
  class?: string
}

/**
 * A signature capture pad: draw with mouse, pen, or touch on a DPR-aware
 * `<canvas>`, with Clear and Undo controls. Strokes are kept as point lists so
 * Undo can fully redraw the remaining ones rather than trying to erase pixels.
 *
 * @example
 * ```tsx
 * <SignaturePad height={220} onChange={(dataUrl) => setSignature(dataUrl)} />
 * ```
 */
export function SignaturePad(props: SignaturePadProps): JSX.Element {
  let canvas!: HTMLCanvasElement
  let container!: HTMLDivElement
  let ctx: CanvasRenderingContext2D | null = null

  const strokes: Stroke[] = []
  let current: Stroke | null = null
  let drawing = false

  const [hasInk, setHasInk] = createSignal(false)

  const height = () => props.height ?? 200

  const resize = (): void => {
    if (!canvas || !container) return
    const dpr = window.devicePixelRatio || 1
    const width = container.clientWidth
    const h = height()
    canvas.width = Math.max(1, Math.round(width * dpr))
    canvas.height = Math.max(1, Math.round(h * dpr))
    canvas.style.width = `${width}px`
    canvas.style.height = `${h}px`
    ctx = canvas.getContext('2d')
    if (ctx) ctx.scale(dpr, dpr)
    redraw()
  }

  const strokeColor = (): string => {
    // Resolved at draw time so it stays correct across theme/light-dark toggles.
    const root = getComputedStyle(document.documentElement)
    const hsl = root.getPropertyValue('--foreground').trim()
    return hsl ? `hsl(${hsl})` : '#000'
  }

  const drawStroke = (context: CanvasRenderingContext2D, stroke: Stroke): void => {
    if (stroke.length < 2) {
      // A single tap/click: draw a dot so it's not silently lost.
      if (stroke.length === 1) {
        context.beginPath()
        context.arc(stroke[0].x, stroke[0].y, 1.25, 0, Math.PI * 2)
        context.fillStyle = strokeColor()
        context.fill()
      }
      return
    }
    context.lineJoin = 'round'
    context.lineCap = 'round'
    context.lineWidth = 2.25
    context.strokeStyle = strokeColor()
    context.beginPath()
    context.moveTo(stroke[0].x, stroke[0].y)
    for (let i = 1; i < stroke.length; i++) context.lineTo(stroke[i].x, stroke[i].y)
    context.stroke()
  }

  const clearCanvas = (context: CanvasRenderingContext2D): void => {
    const dpr = window.devicePixelRatio || 1
    context.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr)
  }

  const redraw = (): void => {
    if (!ctx) return
    clearCanvas(ctx)
    for (const stroke of strokes) drawStroke(ctx, stroke)
    setHasInk(strokes.length > 0)
  }

  const emitChange = (): void => {
    props.onChange?.(strokes.length > 0 ? canvas.toDataURL('image/png') : null)
  }

  const pointFromEvent = (event: PointerEvent): Point => {
    const rect = canvas.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  const onPointerDown = (event: PointerEvent): void => {
    if (!ctx) return
    event.preventDefault()
    drawing = true
    current = [pointFromEvent(event)]
    canvas.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: PointerEvent): void => {
    if (!drawing || !current || !ctx) return
    const point = pointFromEvent(event)
    const prev = current[current.length - 1]
    current.push(point)
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.lineWidth = 2.25
    ctx.strokeStyle = strokeColor()
    ctx.beginPath()
    ctx.moveTo(prev.x, prev.y)
    ctx.lineTo(point.x, point.y)
    ctx.stroke()
  }

  const endStroke = (): void => {
    if (!drawing) return
    drawing = false
    if (current && current.length > 0) {
      strokes.push(current)
      setHasInk(true)
      emitChange()
    }
    current = null
  }

  const onPointerUp = (event: PointerEvent): void => {
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId)
    endStroke()
  }

  const handleClear = (): void => {
    strokes.length = 0
    current = null
    drawing = false
    redraw()
    emitChange()
  }

  const handleUndo = (): void => {
    strokes.pop()
    redraw()
    emitChange()
  }

  onMount(() => {
    resize()
    window.addEventListener('resize', resize)
    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('pointercancel', onPointerUp)
  })

  onCleanup(() => {
    window.removeEventListener('resize', resize)
    canvas.removeEventListener('pointerdown', onPointerDown)
    canvas.removeEventListener('pointermove', onPointerMove)
    canvas.removeEventListener('pointerup', onPointerUp)
    canvas.removeEventListener('pointercancel', onPointerUp)
  })

  return (
    <div class={cn('flex flex-col gap-2', props.class)} role="group" aria-label="Signature pad">
      <div
        ref={container}
        class="relative w-full touch-none overflow-hidden rounded-md border border-input bg-background"
        style={{ height: `${height()}px` }}
      >
        <canvas
          ref={canvas}
          class="block h-full w-full cursor-crosshair touch-none"
          aria-label="Draw your signature here"
        />
        {!hasInk() && (
          <div class="pointer-events-none absolute inset-x-4 bottom-6 flex flex-col items-center gap-1">
            <span class="w-full border-b border-dashed border-border" />
            <span class="text-xs text-muted-foreground">Sign here</span>
          </div>
        )}
      </div>
      <div class="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={handleUndo}
          disabled={strokes.length === 0}
          class="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          <Undo2 class="h-3.5 w-3.5" />
          Undo
        </button>
        <button
          type="button"
          onClick={handleClear}
          disabled={!hasInk()}
          class="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          <Eraser class="h-3.5 w-3.5" />
          Clear
        </button>
      </div>
    </div>
  )
}
