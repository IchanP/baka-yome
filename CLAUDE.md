# Japanese Immersion Tracker

A Next.js app for tracking Japanese immersion time and reading Japanese ebooks via a built-in EPUB reader.

## COMMANDS

- `npm run dev` - Start the development server.
- `npm run build` - Build the application for production.
- `npm run start` - Start the production server.

## KEY NOTES

- Japanese text must always use `lang="ja"` on relevant elements for correct font rendering
- The app uses next.js app router, so all pages are in the `app` directory. The `pages` directory is not used.
- Styling uses Tailwind utilities plus a hand-built design system. Reach for Tailwind utilities first; for anything more structural, write component CSS.
- **Design tokens are global, component CSS is modular.** Keep tokens and anything page-wide in `globals.css`: the `@import "tailwindcss"`, the `:root` token block, the `[data-mode]` accent overrides, the `@theme inline` bridge, and base element resets. These must stay global.
- Put a component's own styles in a co-located `Component.module.css` (CSS Module). Modules auto-scope class names, so no manual prefix is needed. Reference tokens with `var(--accent)`, `var(--fs-base)`, etc. — CSS custom properties cascade at runtime and stay visible across every module, so tokens defined in `globals.css` (and `[data-mode]` overrides) work everywhere automatically.
- Gotcha: `@theme`, `@apply`, and `theme()` are build-time Tailwind features and do **not** work inside a `.module.css` unless the file starts with `@reference "../globals.css"`. Plain `var(--token)` needs no reference — prefer it in component CSS.
- The app is designed to be mobile-first, so ensure that all components are responsive and work
- Favour splitting logical groupings into components and files. Pages should act as orchestrators that build themselves using components.
- Avoid ternerary operators outside of HTML/markup.