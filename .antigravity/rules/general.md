# FlightGuard AI — General Engineering Rules

1. Build production-ready, clean, typed code.
2. Follow Vertical Slice Development: build database -> backend -> frontend -> tests -> documentation per feature slice.
3. Treat existing project documentation in `docs/` as the single source of truth.
4. Keep functions small, single-purpose, and explicit.
5. Never commit secrets, passwords, or raw API keys.
6. Design UI according to `docs/DESIGN.md`, using Enterprise Navy & Royal Blue palette; do NOT use purple colors.
