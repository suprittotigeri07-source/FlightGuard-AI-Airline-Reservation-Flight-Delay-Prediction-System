# FlightGuard AI — Development Rules

These rules are the AI engineering rulebook for the project.

## 1. General

- Build production-quality code, not demo-quality code.
- Use TypeScript for frontend code.
- Use Python with type hints for backend code.
- Reuse existing components and utilities.
- Do not duplicate business logic.
- Keep functions small and focused.
- Follow single-responsibility principles.
- Prefer composition over unnecessary inheritance.
- Do not modify unrelated files.
- Do not introduce dependencies without justification.
- Keep naming explicit and domain-oriented.

---

## 2. Before Coding

Before implementing a feature:

1. Read the relevant documentation.
2. Read `ARCHITECTURE.md`.
3. Read `DESIGN.md`.
4. Read `SECURITY.md`.
5. Inspect the existing implementation.
6. Search for reusable components and utilities.
7. Check existing API and database patterns.
8. Identify security implications.
9. Make a short implementation plan for non-trivial changes.
10. Implement only the requested scope.

Never rewrite working code simply because another implementation looks cleaner.

---

## 3. Vertical Slice Rule

Build **one feature at a time**.

A feature is a vertical slice when it includes the required layers:

```text
Requirement
   ↓
UI
   ↓
API
   ↓
Business Logic
   ↓
Database
   ↓
Tests
   ↓
Documentation
```

Do not build:

```text
All frontend → all backend → all database → tests later
```

Prefer:

```text
Feature 1 → complete
Feature 2 → complete
Feature 3 → complete
```

---

## 4. Feature Completion

Before moving to the next feature:

- UI works
- API works
- Database behavior works
- Authorization works
- Validation works
- Loading state works
- Error state works
- Empty state works
- Tests pass
- Security review is complete
- Documentation is updated

---

## 5. Frontend

- Follow `DESIGN.md`.
- Use reusable UI components.
- Keep feature code inside feature directories.
- Avoid giant components.
- Keep components focused.
- Keep API logic outside presentational components.
- Use typed API responses.
- Handle loading, error, empty, and success states.
- Never trust frontend role checks for authorization.
- Use accessible semantic HTML.
- Support keyboard navigation.
- Do not use arbitrary colors outside design tokens.
- Do not introduce unnecessary animations.
- Keep responsive behavior intentional.

---

## 6. Backend

- Use FastAPI.
- Use Pydantic schemas for request/response validation.
- Use SQLAlchemy for database access.
- Keep routers thin.
- Put business logic in service layers.
- Keep database queries in repositories where the architecture calls for them.
- Use transactions for multi-step mutations.
- Validate all external input.
- Return consistent error responses.
- Do not leak internal implementation details.
- Use explicit HTTP status codes.
- Use API versioning under `/api/v1`.

---

## 7. Database

- Use PostgreSQL.
- Use migrations for schema changes.
- Never manually modify production schema without a migration.
- Add appropriate indexes based on query patterns.
- Use foreign keys for relational integrity.
- Use unique constraints where required.
- Avoid storing derived data unless there is a clear reason.
- Do not delete data silently when soft deletion is required by the domain.
- Use UTC timestamps internally.

---

## 8. Security

- Never commit API keys, passwords, tokens, or secrets.
- Never expose secrets to the frontend.
- Validate every user-controlled input.
- Verify authorization server-side.
- Apply least-privilege access.
- Hash passwords using a strong password-hashing algorithm.
- Use short-lived access tokens where appropriate.
- Never log passwords or authentication tokens.
- Protect sensitive endpoints with authorization checks.
- Use secure CORS configuration.
- Use rate limiting for sensitive endpoints.
- Avoid SQL injection through parameterized ORM/database operations.
- Prevent mass assignment by explicitly defining writable fields.
- Do not expose stack traces in production.
- Do not return sensitive information in error messages.
- Validate uploaded files if file uploads are introduced.
- Use secure HTTP headers in production.
- Keep dependencies patched.
- Review dependency vulnerabilities regularly.
- Never trust client-side prediction results, roles, prices, permissions, or booking state.

---

## 9. Authentication

- Authentication must be handled server-side.
- Passwords must never be stored in plaintext.
- Login failures should not reveal whether an account exists.
- Protect protected routes with authentication middleware/dependencies.
- Enforce role permissions on the backend.
- Revoke or expire credentials appropriately.
- Do not store sensitive tokens in unsafe browser storage without evaluating the threat model.

---

## 10. Reservation Security

Reservation creation must:

- Validate flight existence.
- Validate flight status.
- Validate passenger data.
- Validate availability.
- Calculate trusted server-side values.
- Never trust client-supplied price totals.
- Prevent duplicate booking where business rules prohibit it.
- Use a database transaction for critical state changes.

---

## 11. ML Security and Reliability

- Never accept arbitrary model paths from users.
- Never execute user-provided model code.
- Validate model input ranges.
- Validate categorical values.
- Pin model versions.
- Record model version with predictions.
- Never present predictions as guaranteed outcomes.
- Monitor model performance after deployment.
- Reject malformed inference requests safely.
- Keep training artifacts separate from application secrets.

---

## 12. API Rules

- Use RESTful conventions consistently.
- Version public API routes.
- Validate query parameters.
- Validate pagination limits.
- Apply authorization before sensitive database operations.
- Return predictable error schemas.
- Avoid returning unnecessary database fields.
- Never expose internal IDs when a domain-safe identifier is more appropriate without a reason.
- Add request IDs for production troubleshooting.

---

## 13. Error Handling

Every asynchronous operation should have an error path.

Frontend:

```text
Loading → Success
Loading → Error
Loading → Empty
```

Backend:

```text
Validation error
Authentication error
Authorization error
Not found
Conflict
Server error
```

Never silently swallow exceptions.

---

## 14. Testing

Required testing levels:

### Frontend

- Component tests
- Form validation tests
- Important user-flow tests

### Backend

- Unit tests
- API tests
- Authorization tests
- Validation tests
- Service tests

### ML

- Data validation
- Feature preprocessing tests
- Model inference tests
- Evaluation tests

Every important bug fix should add a regression test when practical.

---

## 15. Git

Use small, focused commits.

Good:

```text
feat: add flight search API
feat: add flight search results UI
test: add flight search validation tests
fix: prevent unauthorized reservation access
```

Bad:

```text
update
changes
final
new code
```

Do not mix unrelated features in one commit.

---

## 16. Documentation

Update documentation when architecture, API, security, database, or product behavior changes.

Important decisions must be recorded in `DECISIONS.md`.

---

## 17. AI Agent Behavior

The AI agent must:

- Inspect before editing.
- Prefer existing patterns.
- Explain significant architectural decisions.
- Avoid speculative features.
- Avoid unnecessary refactoring.
- Never delete functionality without explicit approval.
- Never weaken security to make a feature work.
- Never disable tests to hide failures.
- Never bypass type checking to silence errors.
- Never fabricate API behavior.
- Never fabricate database fields.
- Never invent credentials or secrets.
- Stop and report blockers when required information is missing.

---

## 18. Definition of Done

No task is complete until:

- Implementation is functional.
- Code follows project architecture.
- Design follows `DESIGN.md`.
- Security rules are satisfied.
- Tests pass.
- No unrelated files changed.
- Documentation is updated where required.
- The feature works as a complete vertical slice.
