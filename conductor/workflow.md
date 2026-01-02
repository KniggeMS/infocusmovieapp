# Workflow: InFocus Development

## Development Principles
- **Conductor Pattern:** Strict separation of UI (Components) and Logic (Conductors).
- **Security First:** Never expose internal IDs; validate all inputs; ensure RLS is active.
- **TDD:** Write vitest unit tests for core logic before implementation.
- **Mobile-First:** Every feature must be verified on a mobile viewport (Z-Index, Touch areas).

## Task Lifecycle
1. **Plan:** Define changes in `PLAN.md`.
2. **Implement:** Atomic code changes with clear commit messages.
3. **Verify:** Run `npm run build` and tests.
4. **Sync:** Push to GitHub `main` branch.
