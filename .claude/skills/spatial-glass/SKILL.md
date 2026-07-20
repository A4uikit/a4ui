---
name: spatial-glass
description: Apply the A4ui "Spatial Glass" look when building or restyling a SolidJS page/UI with @a4ui/core. Use when building a site/page with @a4ui/core, or when asked to make something look like A4ui / glassy / "spatial glass" / give it the glass aesthetic. Encodes the recipe (Aurora backdrop, glass surfaces, cursor light, tasteful motion, Expandable) so the result looks like A4ui, not flat cards on a flat background.
---

# Spatial Glass — build the A4ui look

A4ui ships styled components, but the signature look comes from composing them a
specific way. Follow this when building or restyling a page with `@a4ui/core`.
Canonical reference: the repo's `SPATIAL-GLASS.md` and https://a4ui.pages.dev/#/guide-spatial-glass.

## The one rule

Glass only reads if there is **color behind it**. A frosted `Card` on a flat
`bg-background` looks opaque and dead. Put an `Aurora` behind it and it comes alive.

## Checklist (apply in order)

1. **Backdrop first.** Render `<Aurora/>` once at the top of the layout and make the
   page root transparent — remove `bg-background` from the root (Aurora paints the
   base itself). It tints to the theme automatically.
   - `<Aurora animated />` for a slow drift on marketing pages.
   - `pointerGlow` is on by default = a glow that follows the cursor across the
     backdrop (the "space theme" mouse light). Leave it on.
   - For multi-route apps, put `<Aurora/>` in the shared layout so it sits behind
     every route.

   ```tsx
   <div class="relative min-h-screen text-foreground">
     <Aurora animated />
     <YourPage />
   </div>
   ```

2. **Surfaces are glass.** Use `<Card glass>` (not opaque `bg-card` divs) for cards
   and panels so the Aurora reads through the frosted blur. `glow` is on by
   default. Add `spotlight` (inner cursor glow) and `tilt` to KEY cards only
   (hero, feature, product) — never all of them, or it gets noisy.

3. **Theme via tokens.** Override the 15 CSS tokens under `:root` (`--primary`,
   `--accent`, `--radius-xl`, …) for the palette; Aurora + glass recolor with it.
   Pick `data-theme="light"|"dark"` for the mood. Keep WCAG AA on solid surfaces.

4. **Motion — 4-6 tasteful touches, reduced-motion aware.** `ScrollProgress` (top
   of a single-page), `Parallax` on the hero, `TextReveal` on section headings
   (`onView`), `Magnetic` around the primary CTA, count-up `Stat`, `Carousel`
   swipe. Don't animate everything; keep it off the critical path.

5. **Expand, don't modal.** For galleries and any "click to see the full thing"
   (a photo → fullscreen, a service card → its details), use `Expandable`
   (shared-element FLIP), not a plain modal:
   ```tsx
   <Expandable size="dialog" maxWidth={880}
     trigger={<img src={thumb} class="cursor-zoom-in ... hover:scale-105" />}>
     <img src={full} class="max-h-[78vh] w-full object-contain" />
   </Expandable>
   ```

6. **Structure** with `<Section>` (centered max-width + rhythm) and full-bleed
   `bg-muted/30` bands.

7. **Ship-quality by default.** Lazy-load images (`Image blurUp` / `loading="lazy"`),
   interactive targets ≥ 24px, label every `Input`/`Select` (`for`/`id` or
   `aria-label`), add a `robots.txt`. Prefer A4ui `Select`/`Slider`/`NumberInput`
   over hand-rolled native inputs.

## Verify props before using a component

Every export has a JSDoc `@example` in `node_modules/@a4ui/core/dist/**/*.d.ts`.
Read the `.d.ts` for anything whose props you're unsure of instead of guessing.
Icons come from `lucide-solid` (no brand icons — no Instagram/Facebook logos).

## Common mistakes to avoid

- Flat background → glass looks opaque. Add `<Aurora/>`, drop `bg-background` from the root.
- Opaque `bg-card` divs where a surface should be → use `Card glass`.
- `spotlight`/`tilt` on every card → noisy. Reserve for key cards.
- Over-animating → 4-6 touches, respect reduced motion.
- Big hero images not lazy-loaded → tanks LCP.
