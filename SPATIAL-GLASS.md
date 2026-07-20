# The Spatial Glass look — a recipe

A4ui ships styled components, but the signature **"Spatial Glass"** feel — frosted
surfaces that read as real glass, an ambient color backdrop, a light that follows
the cursor, and restrained motion — comes from composing a handful of pieces the
right way. This is that recipe. Follow it and a page looks like A4ui; skip it and
you get flat cards on a flat background.

> **The one rule:** glass only reads if there's something colorful _behind_ it.
> A frosted card on a flat `bg-background` looks opaque and dead. Put an `Aurora`
> behind it and the same card comes alive.

## 1. Backdrop first — `<Aurora/>`

Render it once at the top of your layout and **keep the page root transparent**
(do NOT put `bg-background` on the root — Aurora paints the base itself).

```tsx
import { Aurora } from '@a4ui/core'

export function App() {
  return (
    <div class="relative min-h-screen text-foreground">
      <Aurora /> {/* animated + intensity + pointerGlow are optional */}
      <YourPage />
    </div>
  )
}
```

- Aurora is theme-tinted (uses `--primary` / `--accent`) — every theme colors it
  differently for free, so each page feels distinct.
- `animated` — a slow drift (reduced-motion aware). Nice on marketing pages.
- `intensity` (default `0.45`) — raise it if the color is too subtle.
- `pointerGlow` (default **on**) — a soft glow that follows the cursor across the
  backdrop (and lights up `.glow-edge` cards). This is the "space theme" mouse
  light; it makes surfaces feel like crystal as the cursor moves.

## 2. Surfaces are glass — `<Card glass>`

Use **glass** surfaces (not opaque) so the Aurora reads through the frosted blur.

```tsx
<Card glass>…</Card>                    {/* frosted; glow-edge on by default */}
<Card glass spotlight>…</Card>          {/* + a cursor-following glow inside the card */}
<Card glass tilt spotlight>…</Card>     {/* + 3D hover tilt — for hero/feature cards */}
```

- `glow` is **on by default** for glass cards (the cursor-following border glow —
  needs Aurora's `pointerGlow`, which is on by default).
- Add `spotlight` (inner cursor glow) and `tilt` to **key** cards (hero, feature,
  product) — not every card, or it gets noisy.
- Don't fight it with opaque panels: prefer `Card glass` over a plain
  `bg-card` div for anything that should feel like a surface.

## 3. Make it yours — theme tokens

Override the 15 CSS tokens for your palette; the whole system (including Aurora
and the glass tint) recolors. Scope to `:root` after importing the styles.

```css
@import '@a4ui/core/styles.css';
:root,
:root[data-theme='light'] {
  --primary: 344 52% 56%; /* HSL channels */
  --accent: 28 72% 64%;
  --radius-xl: 1.25rem;
}
```

Pick `data-theme="light"` or `"dark"` on `<html>` for the mood. (Light-theme glass
ships slightly transparent so the frost still reads over the Aurora.)

## 4. Motion — tasteful, not everywhere

4–6 touches per page, all reduced-motion aware. Reach for these; don't hand-roll:

- `ScrollProgress` at the top of a single-page site.
- `Parallax` on the hero backdrop and one or two image blocks.
- `TextReveal` on section headings (`onView`).
- `Magnetic` around the primary hero CTA.
- count-up `Stat` for a stats band; `Carousel` (swipe) for testimonials.
- `Badge pulse` for live states; `Image blurUp`; `List stagger`.

Keep animations off the critical path (the `motion` engine is lazy) so Lighthouse
performance stays high.

## 5. Expand, don't modal — `<Expandable>`

For image galleries and any "click to see the full thing" (a service card → its
details, a photo → fullscreen), use `Expandable` — a shared-element FLIP that
morphs the thumbnail into the panel. Much more alive than a plain modal.

```tsx
<Expandable
  size="dialog"
  maxWidth={880}
  trigger={<img src={thumb} class="cursor-zoom-in ... hover:scale-105" />}
>
  <img src={full} class="max-h-[78vh] w-full object-contain" />
</Expandable>
```

## 6. Structure — `<Section>` + full-bleed bands

```tsx
<Section id="services">…</Section>                 {/* centered, max-width, rhythm */}
<div class="bg-muted/30"><Section>…</Section></div> {/* a tinted full-bleed band */}
```

## 7. Ship-quality by default

- Lazy-load images (`Image blurUp` / `loading="lazy"`); reserve space (no CLS).
- Interactive targets ≥ 24px; label every `Input`/`Select` (`for`/`id` or `aria-label`).
- Add a `robots.txt`. Prefer A4ui's `Select`/`Slider`/`NumberInput` (they ship
  `@example`) over hand-rolled native inputs.

## Copy-paste starter

```tsx
import { Aurora, Section, Card, Button, GradientText, ScrollProgress } from '@a4ui/core'

export function App() {
  return (
    <div class="relative min-h-screen text-foreground">
      <ScrollProgress />
      <Aurora animated />
      <Section class="!py-28 text-center">
        <h1 class="text-5xl font-semibold">
          Tu marca, en{' '}
          <GradientText from="hsl(var(--primary))" to="hsl(var(--accent))">
            vidrio
          </GradientText>
        </h1>
        <Button ripple class="mt-8">
          Empezar
        </Button>
      </Section>
      <Section class="grid gap-5 sm:grid-cols-3">
        <Card glass tilt spotlight class="p-6">
          Superficie de vidrio sobre el aurora.
        </Card>
        {/* … */}
      </Section>
    </div>
  )
}
```

## Common mistakes

- **Flat background** → glass looks opaque. Add `<Aurora/>` and drop `bg-background` from the root.
- **Opaque cards** (`bg-card` divs) where a surface should be → use `Card glass`.
- **`spotlight`/`tilt` on every card** → noisy. Reserve for key cards.
- **Over-animating** → pick 4–6 touches; respect reduced motion.
- **Big hero images not lazy** → tanks LCP. Lazy-load + reserve space.
