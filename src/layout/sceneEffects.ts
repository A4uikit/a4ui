// Shared, theme-agnostic pointer effects used by every backdrop (SpaceBackground
// and ThemedScenery) so the whole UI feels alive on every theme, not just space:
//   • cursor glow — the `#cursorGlow` element inside `root` follows the pointer
//   • magnetic buttons — `.magnetic` elements lean toward the cursor
//   • card edge-glow — `.glow-edge` cards track the pointer via `--mx`/`--my`
// Returns a cleanup that unbinds every listener. Call only when motion is allowed.

export function bindPointerFx(root: HTMLElement): () => void {
  const glow = root.querySelector<HTMLElement>('#cursorGlow')

  // The glow is moved with `transform` only (compositor-friendly: no layout, and
  // no repaint of backdrop-filter surfaces in front of it). It is pinned at 0,0
  // once; pointermoves are coalesced to one write per animation frame.
  let frame = 0
  let gx = 0
  let gy = 0
  if (glow) {
    glow.style.left = '0px'
    glow.style.top = '0px'
    glow.style.willChange = 'transform'
  }
  const paintGlow = (): void => {
    frame = 0
    if (!glow) return
    glow.style.transform = `translate3d(${gx}px, ${gy}px, 0) translate(-50%, -50%)`
  }

  const onMove = (e: PointerEvent): void => {
    if (glow) {
      gx = e.clientX
      gy = e.clientY
      if (glow.style.opacity !== '1') glow.style.opacity = '1'
      if (!frame) frame = requestAnimationFrame(paintGlow)
    }
    const el = e.target as Element | null
    const magnetic = el?.closest?.('.magnetic') as HTMLElement | null
    if (magnetic) {
      const r = magnetic.getBoundingClientRect()
      const mx = (e.clientX - (r.left + r.width / 2)) / r.width
      const my = (e.clientY - (r.top + r.height / 2)) / r.height
      magnetic.style.transform = `translate(${(mx * 7).toFixed(1)}px, ${(my * 7).toFixed(1)}px)`
    }
    const card = el?.closest?.('.glow-edge') as HTMLElement | null
    if (card) {
      const r = card.getBoundingClientRect()
      card.style.setProperty('--mx', `${e.clientX - r.left}px`)
      card.style.setProperty('--my', `${e.clientY - r.top}px`)
    }
  }
  const onLeave = (): void => {
    if (glow) glow.style.opacity = '0'
  }
  const onOut = (e: PointerEvent): void => {
    const magnetic = (e.target as Element | null)?.closest?.('.magnetic') as HTMLElement | null
    if (magnetic) magnetic.style.transform = ''
  }

  document.addEventListener('pointermove', onMove as EventListener)
  window.addEventListener('pointerleave', onLeave)
  document.addEventListener('pointerout', onOut as EventListener)

  return () => {
    if (frame) cancelAnimationFrame(frame)
    document.removeEventListener('pointermove', onMove as EventListener)
    window.removeEventListener('pointerleave', onLeave)
    document.removeEventListener('pointerout', onOut as EventListener)
  }
}
