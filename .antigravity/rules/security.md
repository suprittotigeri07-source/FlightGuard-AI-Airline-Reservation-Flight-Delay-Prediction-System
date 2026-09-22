# FlightGuard AI — Security Rules

1. Never store or accept plaintext passwords. Use Argon2/Bcrypt hashing.
2. Enforce strict server-side authorization checks on every endpoint.
3. Protect against IDOR by verifying user ownership or role privileges before serving resource payloads.
4. Implement rate limiting on sensitive routes like `/auth/login`.
5. Sanitize all logging output to guarantee passwords, JWT tokens, and secrets are never logged.
