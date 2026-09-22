# FlightGuard AI — API Specification

Base URL: `/api/v1`

All requests and responses use `application/json` format unless noted otherwise.

---

## Standard Error Schema

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested flight was not found.",
    "request_id": "req_9f8b2c1a"
  }
}
```

---

## 1. Authentication Endpoints (`/auth`)

### `POST /auth/register`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "passenger@example.com",
    "password": "StrongPassword123!",
    "first_name": "Jane",
    "last_name": "Doe",
    "role": "PASSENGER"
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "id": "usr_123",
    "email": "passenger@example.com",
    "first_name": "Jane",
    "last_name": "Doe",
    "role": "PASSENGER",
    "created_at": "2026-09-21T10:00:00Z"
  }
  ```

### `POST /auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "passenger@example.com",
    "password": "StrongPassword123!"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "expires_in": 1800,
    "user": {
      "id": "usr_123",
      "email": "passenger@example.com",
      "first_name": "Jane",
      "last_name": "Doe",
      "role": "PASSENGER"
    }
  }
  ```

### `GET /auth/me`
- **Access**: Authenticated
- **Response** (200 OK): User details object.

---

## 2. Flight Endpoints (`/flights`)

### `GET /flights`
- **Access**: Public / Authenticated
- **Query Params**: `origin`, `destination`, `departure_date`, `airline_code`, `min_price`, `max_price`, `risk_level`, `page`, `limit`
- **Response** (200 OK):
  ```json
  {
    "items": [
      {
        "id": "flt_245",
        "flight_number": "AI245",
        "airline": { "code": "AI", "name": "Air India" },
        "origin": { "code": "BLR", "name": "Kempegowda International Airport", "city": "Bengaluru" },
        "destination": { "code": "DEL", "name": "Indira Gandhi International Airport", "city": "Delhi" },
        "scheduled_departure": "2026-09-25T06:30:00Z",
        "scheduled_arrival": "2026-09-25T09:15:00Z",
        "price": 4500.00,
        "available_seats": 42,
        "delay_prediction": {
          "delay_probability": 0.82,
          "predicted_delay_minutes": 74,
          "risk_level": "HIGH"
        }
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20
  }
  ```

### `GET /flights/{id}`
- **Access**: Public / Authenticated
- **Response** (200 OK): Single Flight detail payload.

---

## 3. Reservation Endpoints (`/reservations`)

### `POST /reservations`
- **Access**: Authenticated (`PASSENGER`, `ADMIN`)
- **Request Body**:
  ```json
  {
    "flight_id": "flt_245",
    "passengers": [
      {
        "first_name": "Jane",
        "last_name": "Doe",
        "gender": "F",
        "seat_preference": "WINDOW"
      }
    ]
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "id": "res_881",
    "pnr": "FG78A9",
    "status": "CONFIRMED",
    "flight_id": "flt_245",
    "total_amount": 4500.00,
    "passengers": [...],
    "created_at": "2026-09-21T10:15:00Z"
  }
  ```

### `GET /reservations`
- **Access**: Authenticated (Returns user's own reservations; Admins get all)

### `GET /reservations/{pnr}`
- **Access**: Authenticated (Owner or Ops/Admin)

### `POST /reservations/{id}/cancel`
- **Access**: Authenticated (Owner or Admin)

---

## 4. Delay Prediction Endpoints (`/predictions`)

### `POST /predictions/delay`
- **Access**: Authenticated (`OPERATIONS_AGENT`, `ADMIN`)
- **Request Body**:
  ```json
  {
    "flight_id": "flt_245"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "flight_id": "flt_245",
    "delay_probability": 0.82,
    "predicted_delay_minutes": 74,
    "risk_level": "HIGH",
    "contributing_factors": [
      { "factor": "Previous Aircraft Delay", "impact": "High" },
      { "factor": "Origin Airport Congestion", "impact": "Medium" }
    ],
    "model_version": "v1.0.0",
    "evaluated_at": "2026-09-21T10:20:00Z"
  }
  ```

---

## 5. Operations & Admin Endpoints

### `GET /operations/summary`
- **Access**: `OPERATIONS_AGENT`, `ADMIN`

### `GET /operations/high-risk-flights`
- **Access**: `OPERATIONS_AGENT`, `ADMIN`

### `GET /admin/audit-logs`
- **Access**: `ADMIN`
