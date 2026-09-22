# FlightGuard AI — Quality Assurance & Testing Plan

## 1. Testing Strategy Overview

The testing strategy ensures comprehensive coverage across unit, integration, API contract, end-to-end (E2E), and machine learning validation layers.

```text
       ┌───────────────────────────┐
       │         E2E Tests         │  (Critical User Flows)
       ├───────────────────────────┤
       │     API / Auth Tests      │  (FastAPI + HTTPX)
       ├───────────────────────────┤
       │   Unit & Service Tests    │  (pytest + Vitest)
       └───────────────────────────┘
```

---

## 2. Backend Testing (`backend/tests/`)

- **Framework**: Pytest + HTTPX TestClient
- **Test Database**: SQLite in-memory or isolated PostgreSQL test database with transaction rollback per test.

### Test Suites
1. **Unit Tests**: Test password hashing (`security.py`), JWT token creation/decoding, and schema validations.
2. **API Integration Tests**: Test authentication endpoints (`/auth/register`, `/auth/login`, `/auth/me`), flight search filtering, reservation creation/cancellation, and prediction inference.
3. **Authorization & IDOR Tests**: Verify that Passengers cannot access Ops/Admin routes, and Passengers cannot read/cancel other users' reservations.

---

## 3. Frontend Testing (`frontend/src/`)

- **Framework**: Vitest + React Testing Library
- **Key Focus Areas**:
  - `FlightSearchForm`: Input validation, airport selection, date picking.
  - `ReservationForm`: Passenger details validation, client-side error states.
  - `RiskBadge` / `PredictionCard`: Accessible color contrast, textual risk indicators.
  - Protected Route Navigation: Redirects unauthenticated users to `/login`.

---

## 4. ML Validation (`ml/tests/` & `backend/tests/test_ml.py`)

- Verify preprocessing handles edge cases (e.g. invalid departure hours, unexpected airport codes).
- Verify inference pipeline returns bounded probabilities (0.0 to 1.0) and valid non-negative delay minute estimates.
- Verify model artifact loading and version tag integrity.

---

## 5. Execution Commands

```bash
# Backend Tests
cd backend && pytest -v

# Frontend Type Check & Tests
cd frontend && npm run build
```
