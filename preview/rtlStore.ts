// Docs-wide "preview in RTL" switch. Shared by the docs page (which wraps each
// demo in a DirectionProvider) and the app root (so the Toaster, which lives
// outside the docs page, follows the same direction).
import { createSignal } from 'solid-js'

export const [docsRtl, setDocsRtl] = createSignal(false)
