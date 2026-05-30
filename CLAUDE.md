# Japanese Immersion Tracker

A Next.js app for tracking Japanese immersion time and reading Japanese ebooks via a built-in EPUB reader.

## COMMANDS

- `npm run dev` - Start the development server.
- `npm run build` - Build the application for production.
- `npm run start` - Start the production server.

## KEY NOTES

- Japanese text must always use `lang="ja"` on relevant elements for correct font rendering
- The app uses next.js app router, so all pages are in the `app` directory. The `pages` directory is not used.
- Use Tailwind for all styling. If you need to add custom styles, add them to `globals.css` and use the appropriate class names in your components.
- The app is designed to be mobile-first, so ensure that all components are responsive and work
- Favour splitting logical groupings into components and files. Pages should act as orchestrators that build themselves using components.
