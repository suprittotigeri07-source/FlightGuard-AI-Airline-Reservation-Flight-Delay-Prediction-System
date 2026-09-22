# FlightGuard AI — Database Schema & Data Architecture

Database: **PostgreSQL 15+**  
ORM: **SQLAlchemy 2.0**  
Migration Tool: **Alembic**

---

## 1. Entity Relationship Diagram (ERD) Overview

```text
  users ────────< reservations ───────< passengers
    │                 │
  roles               │
                      ▼
 airlines ───────< flights ───────> aircraft
                      │   │
  airports (origin) ──┘   └── airports (destination)
                      │
                      ▼
              delay_predictions
```

---

## 2. Table Definitions

### 2.1 `roles`
- `id` (VARCHAR(36), PK): Primary Key
- `name` (VARCHAR(50), UNIQUE, NOT NULL): `PASSENGER`, `OPERATIONS_AGENT`, `ADMIN`
- `description` (TEXT)

### 2.2 `users`
- `id` (VARCHAR(36), PK)
- `email` (VARCHAR(255), UNIQUE, NOT NULL, INDEX)
- `hashed_password` (VARCHAR(255), NOT NULL)
- `first_name` (VARCHAR(100), NOT NULL)
- `last_name` (VARCHAR(100), NOT NULL)
- `role_id` (VARCHAR(36), FK -> roles.id, NOT NULL)
- `is_active` (BOOLEAN, DEFAULT TRUE)
- `created_at` (TIMESTAMPTZ, NOT NULL)
- `updated_at` (TIMESTAMPTZ, NOT NULL)

### 2.3 `airlines`
- `id` (VARCHAR(36), PK)
- `code` (VARCHAR(10), UNIQUE, NOT NULL, INDEX) -- e.g., 'AI', '6E'
- `name` (VARCHAR(100), NOT NULL)
- `country` (VARCHAR(100))

### 2.4 `airports`
- `id` (VARCHAR(36), PK)
- `code` (VARCHAR(10), UNIQUE, NOT NULL, INDEX) -- IATA e.g., 'BLR', 'DEL'
- `name` (VARCHAR(150), NOT NULL)
- `city` (VARCHAR(100), NOT NULL)
- `country` (VARCHAR(100), NOT NULL)
- `timezone` (VARCHAR(50), NOT NULL, DEFAULT 'UTC')

### 2.5 `aircraft`
- `id` (VARCHAR(36), PK)
- `tail_number` (VARCHAR(20), UNIQUE, NOT NULL)
- `model` (VARCHAR(50), NOT NULL) -- e.g., 'A320neo', 'B787-8'
- `total_capacity` (INTEGER, NOT NULL)
- `airline_id` (VARCHAR(36), FK -> airlines.id, NOT NULL)

### 2.6 `flights`
- `id` (VARCHAR(36), PK)
- `flight_number` (VARCHAR(20), NOT NULL, INDEX)
- `airline_id` (VARCHAR(36), FK -> airlines.id, NOT NULL)
- `aircraft_id` (VARCHAR(36), FK -> aircraft.id, NOT NULL)
- `origin_airport_id` (VARCHAR(36), FK -> airports.id, NOT NULL, INDEX)
- `destination_airport_id` (VARCHAR(36), FK -> airports.id, NOT NULL, INDEX)
- `scheduled_departure` (TIMESTAMPTZ, NOT NULL, INDEX)
- `scheduled_arrival` (TIMESTAMPTZ, NOT NULL)
- `actual_departure` (TIMESTAMPTZ)
- `actual_arrival` (TIMESTAMPTZ)
- `status` (VARCHAR(30), NOT NULL, DEFAULT 'SCHEDULED') -- 'SCHEDULED', 'BOARDING', 'DEPARTED', 'ARRIVED', 'CANCELLED', 'DELAYED'
- `base_price` (DECIMAL(10,2), NOT NULL)
- `available_seats` (INTEGER, NOT NULL)
- `created_at` (TIMESTAMPTZ, NOT NULL)

### 2.7 `reservations`
- `id` (VARCHAR(36), PK)
- `pnr` (VARCHAR(10), UNIQUE, NOT NULL, INDEX) -- 6-char alphanumeric booking reference
- `user_id` (VARCHAR(36), FK -> users.id, NOT NULL, INDEX)
- `flight_id` (VARCHAR(36), FK -> flights.id, NOT NULL, INDEX)
- `total_amount` (DECIMAL(10,2), NOT NULL)
- `status` (VARCHAR(30), NOT NULL, DEFAULT 'CONFIRMED') -- 'CONFIRMED', 'CANCELLED'
- `created_at` (TIMESTAMPTZ, NOT NULL)
- `updated_at` (TIMESTAMPTZ, NOT NULL)

### 2.8 `passengers`
- `id` (VARCHAR(36), PK)
- `reservation_id` (VARCHAR(36), FK -> reservations.id, NOT NULL, INDEX)
- `first_name` (VARCHAR(100), NOT NULL)
- `last_name` (VARCHAR(100), NOT NULL)
- `gender` (VARCHAR(10))
- `seat_number` (VARCHAR(10))

### 2.9 `delay_predictions`
- `id` (VARCHAR(36), PK)
- `flight_id` (VARCHAR(36), FK -> flights.id, NOT NULL, INDEX)
- `delay_probability` (FLOAT, NOT NULL) -- 0.0 to 1.0
- `predicted_delay_minutes` (INTEGER, NOT NULL)
- `risk_level` (VARCHAR(20), NOT NULL) -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
- `contributing_factors_json` (TEXT)
- `model_version` (VARCHAR(30), NOT NULL)
- `created_at` (TIMESTAMPTZ, NOT NULL)

### 2.10 `audit_logs`
- `id` (VARCHAR(36), PK)
- `actor_id` (VARCHAR(36), INDEX)
- `action` (VARCHAR(100), NOT NULL)
- `resource_type` (VARCHAR(50), NOT NULL)
- `resource_id` (VARCHAR(36))
- `details_json` (TEXT)
- `timestamp` (TIMESTAMPTZ, NOT NULL)
