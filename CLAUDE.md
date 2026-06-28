# Japanese Immersion Tracker

A Next.js app for tracking Japanese immersion time and reading Japanese ebooks via a built-in EPUB reader.

## COMMANDS

- `npm run dev` - Start the development server.
- `npm run build` - Build the application for production.
- `npm run start` - Start the production server.

## KEY NOTES

- Japanese text must always use `lang="ja"` on relevant elements for correct font rendering.
- App Router only — all routes live in `app/`; the `pages/` directory is unused.
- Mobile-first: every component must be responsive.
- Pages orchestrate; split logical groupings into their own components and files.
- Avoid ternary operators outside of HTML/markup.

## STYLING

- **Tokens are global, component styles are scoped.** `globals.css` holds the global layer only: the `:root` design tokens, the `[data-mode]` accent overrides, base element resets, and the few page-wide primitives shared by multiple components. Global classes keep the `sa-` prefix (`sa-root`, `sa-card`, `sa-serif/-mono/-pad/-stack`). `.sa-root` must stay global — it owns the inline-size container and the responsive layout tokens (`--pad/--gap/--radius`) every component reads.
- A component's own styles go in a co-located `Component.module.css`, imported as `import styles from "./Component.module.css"` and used as `styles.foo`. Modules auto-scope class names, so drop the `sa-` prefix (`.hero`, `.statNum`, modifiers like `.on`/`.accent`).
- Reference tokens with `var(--accent)`, `var(--fs-base)`, etc. Custom properties cascade at runtime, so tokens (and `[data-mode]` overrides) defined in `globals.css` are visible inside every module automatically. Mix a global primitive with scoped classes when useful: `` className={`sa-card ${styles.sessCard}`} ``.