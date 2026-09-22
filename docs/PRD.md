# FlightGuard AI — Product Requirements Document (PRD)

## 1. Executive Summary
FlightGuard AI is an enterprise-grade airline reservation and flight delay prediction platform designed for passengers, operations staff, and system administrators. The system blends real-time flight search and reservation workflows with machine-learning-driven delay risk scoring to minimize operational disruptions and enhance passenger experience.

---

## 2. Target Users & User Roles

### PASSENGER
- Search for scheduled flights across routes, dates, and airlines.
- View real-time probabilistic delay predictions for target flights.
- Book reservations and manage passenger itineraries.
- View and cancel active reservations with trusted server-side validation.

### OPERATIONS_AGENT
- Monitor operational flight status and delay risk across all active routes.
- Access high-risk flight alerts with estimated delay durations and contributing factors.
- View affected passenger reservations to proactively arrange mitigations.
- View real-time operational analytics and performance metrics.

### ADMIN
- Full administrative control over Users, Roles, Airlines, Airports, Aircraft, and Flights.
- Manage system configuration and inspect comprehensive security/audit logs.

---

## 3. Core Functional Requirements

### 3.1 Authentication & Authorization
- Secure user registration and login yielding JWT access tokens.
- Role-based access control (RBAC) enforced strictly on all backend routes.
- Generic failure messages to prevent user enumeration; rate limiting on sensitive endpoints.

### 3.2 Flight Search & Discovery
- Route search by origin airport, destination airport, departure date, and passenger count.
- Advanced filtering by airline, departure window, arrival window, price, duration, and delay risk level.
- Server-side pagination, sorting, and database index optimization.

### 3.3 Reservation Engine
- Transactional reservation creation with server-validated fare calculations.
- Automatic booking reference (PNR) generation.
- Passenger details recording and reservation status tracking (`CONFIRMED`, `CANCELLED`).

### 3.4 ML Delay Prediction Engine
- Real-time delay risk inference evaluating route, carrier, departure time, distance, and historical metrics.
- Probability estimation (0.0 to 1.0) and expected delay duration in minutes.
- Categorized risk levels: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.
- Transparent disclaimer: predictions are probabilistic estimates, not guaranteed outcomes.

### 3.5 Operations Dashboard
- Live operational KPI summary: Total Flights, On-Time, Delayed, High-Risk, Affected Reservations.
- Filterable High-Risk Flight table with quick access to prediction details and affected passenger manifests.

### 3.6 Administration & Audit
- CRUD operations on core domain reference tables (Airports, Airlines, Aircraft, Flights).
- User management and role assignment.
- Immutable audit logging of administrative and security events.

---

## 4. Non-Functional Requirements
- **Performance**: Sub-200ms REST API response latency for search and reservation queries.
- **Security**: Argon2/Bcrypt password hashing, JWT expiration, CORS domain restriction, IDOR protection.
- **Accessibility**: Compliance with WCAG 2.2 AA standards (semantic HTML, keyboard navigation, high contrast).
- **Design Integrity**: Enterprise Navy & Royal Blue UI design system, completely avoiding purple tones.
