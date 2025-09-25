# Frontend Code Style & Conventions

This project uses ESLint + Prettier to enforce consistent React code style.

Highlights:
- Functional components with hooks only; no class components.
- Component names: PascalCase; files should match component name.
- Props/state: camelCase.
- Import order: React, external libs, absolute/internal modules, then relative imports.
- Avoid heavy `console.log` in production code (warnings/errors allowed).
- Hooks: list all dependencies unless intentionally omitted with a comment.
- Add PropTypes for every component.

Scripts:
- `npm run lint` – check lint errors
- `npm run lint:fix` – auto-fix
- `npm run format` – Prettier format
