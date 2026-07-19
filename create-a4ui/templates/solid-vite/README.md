# A4ui Starter

A minimal Solid + Vite + Tailwind app preconfigured with
[`@a4ui/core`](https://github.com/A4uikit/a4ui), the Spatial Glass design
system for SolidJS.

Scaffolded via:

```sh
npm create a4ui@latest my-app
```

## Usage

```sh
npm install
npm run dev
```

Then open the printed local URL. `npm run build` produces a production
bundle in `dist/`, and `npm run preview` serves it locally.

## No Tailwind?

If you don't want the Tailwind setup, drop `tailwind.config.js`,
`postcss.config.js`, and the `@tailwind` directives from `src/app.css`, then
import the prebuilt stylesheet instead:

```ts
import '@a4ui/core/full.css'
```
