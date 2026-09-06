# MistriKhoj Project Context

- "MistriKhoj" refers to this entire repository and its current codebase, not only the currently open file.
- When the user says "MistriKhoj", treat the repository at this project root as the source of truth and inspect current files before making assumptions, because the code may have changed since a previous session.
- The main application currently lives in `frontend/` and is a React 19, TypeScript, Vite, and Tailwind CSS 4 single-page application.
- `frontend/src/MainApp.tsx` owns the main view, technician directory filters, in-memory technician data, and modal state.
- `frontend/src/context/LanguageContext.tsx` and `frontend/src/data/translations.ts` provide multilingual UI support.
- `frontend/src/components/` contains navigation, home sections, the technician directory/profile modal, SOS flow, registration flow, and advertising flow.
- Static domain data is stored in `frontend/src/data/`, with shared models in `frontend/src/types.ts`.
- Preserve the existing MistriKhoj visual identity: black, white/off-white, and mustard yellow (`#FFB800`), with a direct, trustworthy Indian local-services marketplace tone.
- Before completing frontend changes, run `npm run lint` from `frontend/` and, when appropriate, verify a production build.
