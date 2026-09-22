# FlightGuard AI — Architecture

## 1. Purpose

FlightGuard AI is an airline reservation and flight-delay prediction platform.

The system combines:

- Passenger flight search and reservation
- Flight and airport management
- Role-based access control
- Machine-learning-based delay prediction
- Airline operations monitoring
- Operational analytics

The architecture is designed around **modularity, security, testability, observability, and incremental delivery**.

---

## 2. Architecture Principles

1. Prefer simple, maintainable solutions over unnecessary complexity.
2. Separate presentation, business logic, data access, and ML inference.
3. Keep domain rules in the backend; never trust the frontend for authorization.
4. Use PostgreSQL as the source of truth for transactional data.
5. Keep ML inference isolated from reservation logic.
6. Use typed contracts between frontend and backend.
7. Design APIs to be predictable, versionable, and observable.
8. Build features using vertical slices: UI → API → database → tests → documentation.
9. Do not introduce infrastructure that the current feature does not need.
10. Every production feature must include validation, error handling, loading/empty states, security checks, and tests.

---

## 3. High-Level Architecture

```text
                    ┌─────────────────────────┐
                    │      React Frontend     │
                    │ TypeScript + Tailwind   │
                    └────────────┬────────────┘
                                 │ HTTPS / JSON
                                 ▼
                    ┌─────────────────────────┐
                    │       FastAPI API       │
                    │ Auth / Domain / REST API │
                    └──────┬─────────┬────────┘
                           │         │
                 ┌─────────┘         └──────────┐
                 ▼                              ▼
       ┌──────────────────┐            ┌─────────────────┐
       │   PostgreSQL     │            │  ML Inference   │
       │ Transaction Data │            │ Scikit-learn /  │
       │ Users / Flights  │            │ XGBoost Model   │
       │ Bookings / Logs  │            └─────────────────┘
       └──────────────────┘
```

Optional infrastructure:

```text
React
  ↓
Reverse Proxy / CDN
  ↓
FastAPI
  ├── PostgreSQL
  ├── ML model
  └── Redis (only when justified)
```

---

## 4. Repository Structure

```text
FlightGuard-AI/
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── DESIGN.md
│   ├── API.md
│   ├── DATABASE.md
│   ├── ML_MODEL.md
│   ├── TEST_PLAN.md
│   ├── SECURITY.md
│   └── DECISIONS.md
│
├── .antigravity/
│   └── rules/
│       ├── general.md
│       ├── frontend.md
│       ├── backend.md
│       ├── security.md
│       └── testing.md
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── services/
│   │   └── types/
│   └── tests/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── repositories/
│   │   └── ml/
│   └── tests/
│
├── ml/
│   ├── data/
│   ├── training/
│   ├── evaluation/
│   └── models/
│
├── TASKS.md
├── README.md
├── .env.example
├── .gitignore
└── docker-compose.yml
```

---

## 5. Frontend Architecture

Use a feature-oriented structure.

```text
features/
├── auth/
├── flights/
├── reservations/
├── predictions/
├── operations/
└── admin/
```

Each feature should own its:

- Components
- Hooks
- API calls
- Types
- Validation
- Tests

Shared components belong in:

```text
components/
├── ui/
├── layout/
├── feedback/
└── data-display/
```

Do not place business-specific components in the shared UI directory.

---

## 6. Backend Architecture

Use layered architecture:

```text
API Router
   ↓
Schema Validation
   ↓
Application Service
   ↓
Repository
   ↓
PostgreSQL
```

Example:

```text
POST /reservations
       ↓
reservation_router.py
       ↓
reservation_service.py
       ↓
reservation_repository.py
       ↓
PostgreSQL
```

The router should remain thin.

Business rules belong in services.

Database queries belong in repositories.

Pydantic schemas define API contracts.

---

## 7. Authentication and Authorization

Use:

- JWT access tokens
- Secure password hashing
- Role-based authorization
- Server-side permission checks

Roles:

```text
PASSENGER
OPERATIONS_AGENT
ADMIN
```

Authorization must be enforced on every protected backend operation.

The frontend may hide unavailable actions for UX, but the backend must independently reject unauthorized requests.

---

## 8. Reservation Flow

```text
Passenger
   ↓
Search flights
   ↓
Select flight
   ↓
Validate availability
   ↓
Create reservation transaction
   ↓
Generate booking reference
   ↓
Persist reservation
   ↓
Return booking confirmation
```

Reservation creation must be transactional.

The system must prevent invalid or duplicate seat allocation when seat inventory is introduced.

---

## 9. Delay Prediction Flow

```text
Flight data
    ↓
Feature validation
    ↓
Feature preprocessing
    ↓
ML model
    ↓
Probability + predicted delay
    ↓
Risk classification
    ↓
Store prediction metadata
    ↓
Operations dashboard
```

Example output:

```json
{
  "flight_id": 245,
  "delay_probability": 0.82,
  "predicted_delay_minutes": 74,
  "risk_level": "HIGH",
  "model_version": "v1.0.0"
}
```

The application must never allow arbitrary client-supplied prediction values to be treated as trusted model output.

---

## 10. Data Ownership

### PostgreSQL

Source of truth for:

- Users
- Airports
- Airlines
- Aircraft
- Flights
- Reservations
- Passengers
- Prediction records
- Audit records

### ML model artifacts

Source of truth for:

- Trained model
- Preprocessing pipeline
- Model version metadata
- Evaluation metrics

Never store trained model binaries directly inside business tables.

---

## 11. API Design

Base path:

```text
/api/v1
```

Example endpoints:

```text
POST   /auth/register
POST   /auth/login
GET    /flights
GET    /flights/{id}
POST   /flights
PATCH  /flights/{id}

POST   /reservations
GET    /reservations
GET    /reservations/{pnr}
POST   /reservations/{id}/cancel

POST   /predictions/delay
GET    /predictions/{flight_id}

GET    /operations/summary
GET    /operations/high-risk-flights
```

Use consistent response and error structures.

---

## 12. Error Handling

All API errors should return safe, structured responses.

Example:

```json
{
  "error": {
    "code": "FLIGHT_NOT_FOUND",
    "message": "The requested flight was not found.",
    "request_id": "..."
  }
}
```

Do not expose:

- Stack traces
- SQL queries
- Secrets
- Internal file paths
- Sensitive debugging information

---

## 13. Observability

Production-ready logging should capture:

- Request ID
- HTTP method
- Route
- Status code
- Duration
- User/role where appropriate
- Error category

Do not log:

- Passwords
- Access tokens
- Refresh tokens
- Payment credentials
- Sensitive passenger information

---

## 14. Scalability Strategy

Start as a modular monolith.

Do not split into microservices prematurely.

The codebase should have clear boundaries so services can be extracted later if scale requires it.

Potential future boundaries:

```text
Auth Service
Reservation Service
Flight Service
Prediction Service
Notification Service
```

---

## 15. Deployment

Recommended production path:

```text
Internet
   ↓
CDN / Reverse Proxy
   ↓
React Frontend
   ↓ HTTPS
FastAPI Backend
   ├── PostgreSQL
   ├── ML Model
   └── Redis (optional)
```

Containerize application components with Docker.

Use environment variables for deployment configuration.

---

## 16. Vertical Slice Delivery

Every feature must be developed end-to-end.

Example:

### Reservation Feature

```text
1. Define requirement
2. Design UI
3. Define database changes
4. Implement API
5. Implement service logic
6. Implement React screens
7. Connect API
8. Add loading/error/empty states
9. Add unit/integration tests
10. Perform security review
11. Update documentation
12. Mark task complete
```

Do not build the entire frontend first and backend later.

---

## 17. Definition of Done

A feature is complete only when:

- Functional requirement works
- API is validated
- Authorization is enforced
- Database behavior is correct
- UI is responsive
- Loading state exists
- Empty state exists
- Error state exists
- Tests pass
- Security checks pass
- Documentation is updated
- No unrelated files were modified
