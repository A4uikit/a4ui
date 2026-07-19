import '@a4ui/core/elements' // registers <a4-button>, <a4-badge>, … (side effect)
import '@a4ui/core/elements.css' // precompiled styles (no Tailwind needed)

import { StrictMode, useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'

function Toolbar() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    const onChange = (e: Event) => console.log('rating', (e as CustomEvent).detail)
    el?.addEventListener('change', onChange)
    return () => el?.removeEventListener('change', onChange)
  }, [])

  return (
    <div>
      {/* @ts-expect-error — custom element */}
      <a4-button variant="primary" label="Save" />
      {/* @ts-expect-error — custom element */}
      <a4-badge ref={ref}>New</a4-badge>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Toolbar />
  </StrictMode>,
)
