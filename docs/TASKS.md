# FlightGuard AI — Tasks

## Delivery Strategy

Build **one feature at a time using vertical slices**.

Priority:

```text
P0 = Required for MVP
P1 = Important
P2 = Future enhancement
```

Status:

```text
[ ] Not started
[-] In progress
[x] Complete
```

---

# Phase 0 — Foundation

## P0 Project Setup

- [x] Create repository structure
- [x] Configure frontend TypeScript
- [x] Configure FastAPI backend
- [x] Configure PostgreSQL
- [x] Configure environment variables
- [x] Configure linting/formatting
- [x] Configure testing
- [x] Configure Docker
- [x] Create initial README
- [x] Create CI pipeline

Definition of done:
- Frontend runs
- Backend runs
- Database connects
- Tests execute
- CI passes

---

# Phase 1 — Authentication Vertical Slice

## P0 Authentication

### Backend

- [x] User model
- [x] Password hashing
- [x] Registration endpoint
- [x] Login endpoint
- [x] JWT authentication
- [x] Role model
- [x] Authorization dependency
- [x] Authentication tests

### Frontend

- [x] Login page
- [x] Registration page
- [x] Auth state
- [x] Protected routes
- [x] Form validation
- [x] Loading states
- [x] Error states

### Security

- [x] Brute-force protection/rate limiting
- [x] No sensitive logging
- [x] Server-side role checks

### Documentation

- [x] Update API documentation
- [x] Update security documentation

---

# Phase 2 — Flight Search Vertical Slice

## P0 Flight Search

### Database

- [x] Airline table
- [x] Airport table
- [x] Aircraft table
- [x] Flight table
- [x] Required indexes
- [x] Seed development dataset

### Backend

- [x] Flight search API
- [x] Flight detail API
- [x] Filtering
- [x] Pagination
- [x] Validation
- [x] API tests

### Frontend

- [x] Search form
- [x] Search results
- [x] Flight details
- [x] Filters
- [x] Empty state
- [x] Loading state
- [x] Error state
- [x] Responsive layout

### Documentation

- [x] Update database documentation
- [x] Update API documentation

---

# Phase 3 — Reservation Vertical Slice

## P0 Reservations

### Backend

- [x] Reservation model
- [x] Passenger model
- [x] Create reservation API
- [x] Get reservation API
- [x] Cancel reservation API
- [x] Booking reference generation
- [x] Transaction handling
- [x] Authorization
- [x] Reservation tests

### Frontend

- [x] Passenger details form
- [x] Reservation confirmation
- [x] Booking reference display
- [x] My reservations
- [x] Reservation details
- [x] Cancellation confirmation
- [x] Success/error states

### Security

- [x] Prevent unauthorized reservation access
- [x] Validate server-side totals
- [x] Validate flight availability

---

# Phase 4 — Delay Prediction Vertical Slice

## P0 ML Prediction

### Data

- [x] Identify dataset
- [x] Data quality checks
- [x] Feature engineering
- [x] Train/validation/test split

### Modeling

- [x] Baseline model
- [x] Classification model
- [x] Regression model
- [x] Compare metrics
- [x] Select production model
- [x] Export preprocessing pipeline
- [x] Version model

### Backend

- [x] Prediction schema
- [x] Prediction service
- [x] Inference endpoint
- [x] Model version tracking
- [x] Input validation
- [x] Prediction tests

### Frontend

- [x] Delay risk badge
- [x] Prediction details
- [x] Probability display
- [x] Predicted delay display
- [x] Explanation/contributing factors UI
- [x] Prediction disclaimer

### Documentation

- [x] Create ML_MODEL.md
- [x] Record evaluation metrics
- [x] Record model decision

---

# Phase 5 — Operations Dashboard Vertical Slice

## P0 Operations

### Backend

- [x] Operations summary endpoint
- [x] High-risk flights endpoint
- [x] Delay statistics endpoint
- [x] Affected reservations endpoint
- [x] Operations authorization

### Frontend

- [x] Operations dashboard
- [x] KPI cards
- [x] High-risk flights table
- [x] Delay chart
- [x] Flight detail view
- [x] Affected reservation view
- [x] Filters
- [x] Responsive dashboard

### UX

- [x] Loading states
- [x] Empty states
- [x] Error states
- [x] Accessible status indicators

---

# Phase 6 — Admin Vertical Slice

## P1 Administration

- [x] User management
- [x] Airline management
- [x] Airport management
- [x] Aircraft management
- [x] Flight management
- [x] Role management
- [x] Audit log viewer
- [x] Admin authorization tests

---

# Phase 7 — Quality and Production Hardening

## P0 Security

- [ ] Security review
- [ ] Dependency audit
- [ ] CORS review
- [ ] Rate limiting
- [ ] Security headers
- [ ] IDOR testing
- [ ] Authentication abuse testing
- [ ] Input validation review
- [ ] Secrets review

## P0 Testing

- [ ] Backend unit tests
- [ ] API integration tests
- [ ] Frontend component tests
- [ ] Critical user-flow tests
- [ ] ML inference tests
- [ ] Regression tests

## P0 Observability

- [ ] Structured logging
- [ ] Request IDs
- [ ] Error monitoring
- [ ] Health endpoint
- [ ] Database health check

---

# Phase 8 — Deployment

## P1 Deployment

- [ ] Production Docker configuration
- [ ] Production environment variables
- [ ] PostgreSQL production setup
- [ ] HTTPS
- [ ] Reverse proxy
- [ ] Frontend deployment
- [ ] Backend deployment
- [ ] Database backup strategy
- [ ] CI/CD deployment pipeline

---

# Future Roadmap

## P2

- [ ] Weather API
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Payment sandbox
- [ ] Real-time flight status integration
- [ ] GDS/API integration
- [ ] Automated rebooking recommendations
- [ ] Connection-risk prediction
- [ ] Advanced disruption management
- [ ] AI operations assistant

---

# Vertical Slice Rule

Do not start the next major feature until the current feature has:

- [ ] Working UI
- [ ] Working API
- [ ] Working database behavior
- [ ] Authorization
- [ ] Validation
- [ ] Loading state
- [ ] Empty state
- [ ] Error state
- [ ] Tests
- [ ] Security review
- [ ] Documentation update
