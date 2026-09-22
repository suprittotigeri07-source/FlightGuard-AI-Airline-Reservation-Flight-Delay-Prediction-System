# FlightGuard AI — Architecture Decision Records

This file records important technical and product decisions.

---

## ADR-001 — Use a Modular Monolith for MVP

**Status:** Accepted

### Decision

Build FlightGuard AI as a modular monolith rather than microservices.

### Why

The MVP has a limited team and manageable domain complexity. A modular monolith reduces:

- Deployment complexity
- Network failure points
- Infrastructure cost
- Development overhead

Clear module boundaries will allow future extraction if scale requires it.

---

## ADR-002 — Use React + TypeScript

**Status:** Accepted

### Decision

Use React with TypeScript for the frontend.

### Why

- Strong ecosystem
- Component-based architecture
- Type safety
- Maintainability
- Good support for enterprise dashboards
- Strong testing ecosystem

---

## ADR-003 — Use FastAPI

**Status:** Accepted

### Decision

Use FastAPI for backend APIs.

### Why

- Python ecosystem integrates naturally with ML
- Automatic OpenAPI documentation
- Pydantic validation
- Strong async support
- Good developer productivity

---

## ADR-004 — Use PostgreSQL

**Status:** Accepted

### Decision

Use PostgreSQL as the primary transactional database.

### Why

FlightGuard AI has strongly relational data:

```text
Users
Airlines
Airports
Aircraft
Flights
Reservations
Passengers
Predictions
Audit Logs
```

PostgreSQL provides:

- ACID transactions
- Foreign keys
- Constraints
- Indexing
- Mature tooling

---

## ADR-005 — Use REST APIs

**Status:** Accepted

### Decision

Use versioned REST APIs under `/api/v1`.

### Why

The application has clear resource-oriented entities and does not currently require the complexity of GraphQL.

---

## ADR-006 — Use JWT Authentication

**Status:** Accepted

### Decision

Use JWT-based authentication with server-side authorization.

### Why

JWT works well for a stateless API architecture.

Important security controls remain mandatory:

- Token expiration
- Secure handling
- Role authorization
- Rate limiting
- No sensitive token logging

---

## ADR-007 — Use Scikit-learn for ML

**Status:** Accepted

### Decision

Use Scikit-learn for the initial ML pipeline, with XGBoost as an optional production candidate.

### Why

The project needs:

- Preprocessing
- Classification
- Regression
- Model evaluation
- Reproducible pipelines

Scikit-learn provides a consistent framework for these requirements.

---

## ADR-008 — Delay Prediction Is Probabilistic

**Status:** Accepted

### Decision

The UI will communicate delay prediction as a probability/risk estimate rather than a guaranteed result.

### Why

ML predictions are uncertain.

Example:

```text
82% delay probability
Estimated delay: 74 minutes
Risk: HIGH
```

This is more responsible than claiming:

```text
Flight will be delayed by 74 minutes.
```

---

## ADR-009 — Build Vertical Slices

**Status:** Accepted

### Decision

Features are delivered end-to-end.

### Why

Vertical slices expose integration problems early and ensure every completed feature is usable.

Preferred:

```text
Authentication → complete
Flight Search → complete
Reservation → complete
Prediction → complete
Operations → complete
```

Not:

```text
Frontend first
Backend later
Testing last
```

---

## ADR-010 — Design for Accessibility

**Status:** Accepted

### Decision

Target WCAG 2.2 AA.

### Why

Accessibility is part of production-quality software and improves usability for all users.

---

## ADR-011 — Avoid Premature External Airline Integrations

**Status:** Accepted

### Decision

The MVP will use controlled/internal flight data rather than depending on commercial GDS APIs.

### Why

External integrations introduce:

- Credentials
- Cost
- Rate limits
- Vendor-specific behavior
- Integration complexity

The architecture will leave clear extension points for future airline/GDS integrations.

---

## ADR-012 — No Real Payment Processing in MVP

**Status:** Accepted

### Decision

Use a mock reservation/payment state for the first version.

### Why

The project's primary value is reservation workflow + predictive airline operations, not payment infrastructure.

Real payment integration can be added later with a compliant provider.

---

## ADR-013 — Keep ML Inference Inside the Backend Initially

**Status:** Accepted

### Decision

Run the trained model through the FastAPI backend for the MVP.

### Why

This minimizes infrastructure complexity while keeping a clean future path toward a separate prediction service.

---

## ADR-014 — Use Semantic Design Tokens

**Status:** Accepted

### Decision

All UI colors and design primitives should be represented through semantic tokens.

### Why

This improves:

- Consistency
- Accessibility
- Theming
- Maintainability
- AI-assisted development

---

## ADR-015 — Security Is a Feature Requirement

**Status:** Accepted

### Decision

Security requirements are part of feature acceptance criteria rather than a final-stage activity.

### Why

Authentication, authorization, input validation, logging, and data protection must be designed alongside functionality.

---

## ADR Template

Future decisions should use:

```text
## ADR-XXX — Title

Status: Proposed | Accepted | Deprecated

### Context

What problem are we solving?

### Decision

What did we choose?

### Alternatives

What else was considered?

### Why

Why is this option preferred?

### Consequences

What are the benefits and trade-offs?
```
