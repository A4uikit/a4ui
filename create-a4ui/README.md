# create-a4ui

Scaffold a new [A4ui](https://github.com/A4uikit/a4ui) app — a Solid + Vite
project preconfigured with `@a4ui/core`, the Spatial Glass design system for
SolidJS.

## Usage

```sh
npm create a4ui@latest my-app
```

If you omit the directory name and are running in an interactive terminal,
you'll be prompted for it (defaults to `my-a4ui-app`).

## Flags

```sh
npm create a4ui@latest my-app --tailwind     # include Tailwind CSS (default)
npm create a4ui@latest my-app --no-tailwind  # skip Tailwind, use @a4ui/core/full.css
```

When flags are passed, or the terminal isn't interactive, prompts are
skipped and defaults are used.

Only the `solid-vite` template is available today. SolidStart and Astro
templates are planned for a future release.
