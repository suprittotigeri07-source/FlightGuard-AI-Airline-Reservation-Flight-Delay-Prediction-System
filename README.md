# ✈️ FlightGuard AI: Airline Reservation & Flight Delay Prediction System

[![Python](https://img.shields.io/badge/Python-3.11%2B-blue.svg?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg?logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1.svg?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Supported-2496ED.svg?logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**FlightGuard AI** is an enterprise-grade airline reservation system integrated with predictive machine learning models to forecast flight delays, evaluate risk factors in real time, and deliver a modern booking and operations monitoring experience.

---

## 📸 Platform Overview

![FlightGuard AI Dashboard](frontend/public/assets/mockup_landing.jpg)

The platform provides a dual-interface experience:
1. **Passenger Portal**: Interactive flight search, seat selection, booking management, and live delay notifications.
2. **Operations & Admin Dashboard**: Flight dispatch analytics, high-risk flight delay heatmaps, fleet oversight, and AI prediction breakdown.

---

## ✨ Key Features

- **🎫 Smart Airline Reservation Engine**: Search routes, filter by schedule and price, select seats, and manage bookings with instant PNR reference generation.
- **🔮 AI-Powered Delay Prediction**: Machine learning inference engine (XGBoost / Scikit-learn) trained on historical schedule, route, airport congestion, and meteorological data.
- **⚡ FlightAware AeroAPI Integration**: Fetch live flight tracking status, gate changes, and real-time telemetry for enhanced prediction accuracy.
- **📊 Operations & Analytics Dashboard**: Real-time risk assessment (LOW, MEDIUM, HIGH risk tiers) with delay probability scores and estimated delay durations.
- **🛡️ Role-Based Access Control (RBAC)**: Secure JWT authentication for `PASSENGER`, `OPERATIONS_AGENT`, and `ADMIN` user roles.
- **🐳 Containerized & Cloud-Ready**: Built for instant local orchestration via Docker Compose and seamless deployment on Render & Vercel.

---

## 🏗️ Architecture & Tech Stack

### High-Level Architecture

```mermaid
graph TD
    Client["💻 React Frontend (TypeScript + Tailwind CSS)"]
    API["⚡ FastAPI Backend (Python 3.11)"]
    DB[("🐘 PostgreSQL Database")]
    ML["🔮 Machine Learning Engine (Joblib / Scikit-learn)"]
    AeroAPI["✈️ FlightAware AeroAPI (v4 Live Data)"]

    Client -->|HTTPS / JSON REST API| API
    API -->|ORM / SQL queries| DB
    API -->|Inference Engine| ML
    API -->|Live Telemetry| AeroAPI
```

### Technology Breakdown

| Component | Technology Stack |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons |
| **Backend** | Python 3.11, FastAPI, Pydantic v2, SQLAlchemy / SQLModel |
| **Machine Learning** | Scikit-Learn, XGBoost, Pandas, NumPy, Joblib |
| **Database** | PostgreSQL 15, SQLite (Local Dev fallback) |
| **Containerization** | Docker, Docker Compose |
| **Cloud Hosting** | Render (API + Database), Vercel (Frontend SPA) |

---

## 📁 Repository Structure

```text
FlightGuard-AI/
├── backend/                  # FastAPI Application Source Code
│   ├── app/
│   │   ├── api/              # REST Endpoints & Routers
│   │   ├── core/             # Security, Auth, Configuration
│   │   ├── models/           # Database Models
│   │   ├── schemas/          # Pydantic Input/Output Schemas
│   │   ├── services/         # Business Logic & Reservation Engine
│   │   └── ml/               # Model Pipeline & Feature Vector Translators
│   ├── Dockerfile            # Production Docker configuration for Backend
│   ├── requirements.txt      # Python dependencies
│   └── seed_db.py            # Database initialization script
├── frontend/                 # React + TypeScript Frontend
│   ├── public/assets/        # UI Image assets & screenshots
│   ├── src/
│   │   ├── components/       # Reusable UI & Navigation components
│   │   ├── features/         # Feature modules (Auth, Flights, Bookings, Ops)
│   │   └── services/         # API Service client handlers
│   ├── Dockerfile            # Nginx static deployment Dockerfile
│   └── vercel.json           # Vercel deployment routing configuration
├── ml/                       # Machine Learning Training Pipelines
│   ├── data/                 # Raw and preprocessed flight datasets
│   ├── models/               # Serialized ML model artifacts (.joblib)
│   └── training/             # Training scripts and model evaluation notebooks
├── docs/                     # System Documentation
│   ├── ARCHITECTURE.md       # Architectural patterns & modular design
│   ├── API.md                # Full REST API specification
│   ├── DATABASE.md           # Entity relationship diagrams & schemas
│   ├── ML_MODEL.md           # Model performance metrics & feature engineering
│   └── SECURITY.md           # Security policies & JWT auth flows
├── docker-compose.yml        # Full-stack container orchestration
├── render.yaml               # Infrastructure-as-code for Render cloud hosting
└── README.md                 # Project README
```

---

## 🚀 Quick Start (Local Setup)

### Prerequisites

- **Docker & Docker Compose** (Recommended) *OR*
- **Python 3.11+** & **Node.js 18+** & **PostgreSQL 15**

---

### Option 1: Run with Docker Compose (Recommended)

Spin up the entire stack (PostgreSQL, Backend API, and Frontend web client) with a single command:

```bash
# 1. Clone the repository
git clone https://github.com/suprittotigeri07/FlightGuard-AI-Airline-Reservation-Flight-Delay-Prediction-System.git
cd FlightGuard-AI-Airline-Reservation-Flight-Delay-Prediction-System

# 2. Copy environment file
cp .env.example .env

# 3. Build and launch services
docker-compose up --build
```

Access the services once launched:
- 🌐 **Frontend Application**: `http://localhost:5173`
- ⚡ **FastAPI Swagger Documentation**: `http://localhost:8000/docs`
- 🐘 **PostgreSQL Database**: `localhost:5432`

---

### Option 2: Manual Local Development Setup

#### 1. Database Setup
Ensure PostgreSQL is running locally and create a database named `flightguard_db`.

#### 2. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp ../.env.example .env

# Seed initial database records (airports, demo flights, users)
python seed_db.py

# Run FastAPI development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

---

## 🌐 Cloud Deployment Guide

FlightGuard AI is optimized for cloud deployment using **Render** (for API & PostgreSQL) and **Vercel** (for Frontend static application).

### 1. Deploying Backend & Database to Render

The repository includes a production-ready `render.yaml` Blueprint file for zero-config deployment:

1. Push your code to GitHub / GitLab.
2. Log in to [Render](https://render.com/) and navigate to **Blueprints**.
3. Connect your repository — Render will automatically detect `render.yaml`.
4. Define your secret environment variables:
   - `JWT_SECRET`: A strong 32+ character random string.
   - `AEROAPI_KEY`: (Optional) Your FlightAware AeroAPI key.
5. Click **Apply**. Render will provision:
   - PostgreSQL Managed Database
   - FastAPI Web Service with Uvicorn worker process.

### 2. Deploying Frontend to Vercel

1. Log in to [Vercel](https://vercel.com/) and click **Add New Project**.
2. Select your repository and choose `frontend` as the **Root Directory**.
3. Set Environment Variable:
   ```env
   VITE_API_BASE_URL=https://your-render-backend-api.onrender.com/api/v1
   ```
4. Click **Deploy**. Vercel will automatically build and host the React application using `frontend/vercel.json` routing rules.

### 3. Deploying via Docker in Production

To build production container images manually:

```bash
# Build Backend Container Image
docker build -t flightguard-backend:latest ./backend

# Build Frontend Container Image (Nginx static bundle)
docker build -t flightguard-frontend:latest ./frontend
```

---

## 🔑 Environment Variables Reference

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `APP_ENV` | Application environment (`development` / `production`) | `development` |
| `DEBUG` | Enable verbose error output | `True` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://flightguard:pass@localhost:5432/flightguard_db` |
| `JWT_SECRET` | Secret key for signing authorization tokens | `min_32_chars_secret_key` |
| `JWT_ALGORITHM` | Algorithm used for JWT encoding | `HS256` |
| `CORS_ORIGINS` | Allowed cross-origin domains | `http://localhost:5173,http://localhost:3000` |
| `ML_MODEL_PATH` | Path to trained model artifact | `ml/models/delay_model_v1.joblib` |
| `AEROAPI_KEY` | FlightAware AeroAPI live flight telemetry key | `your_aeroapi_key` |

---

## 📖 API Documentation & Swagger UI

Once the backend is running, complete interactive API documentation and testing endpoints are available at:

- **Swagger UI**: [`http://localhost:8000/docs`](http://localhost:8000/docs)
- **ReDoc UI**: [`http://localhost:8000/redoc`](http://localhost:8000/redoc)

Detailed API endpoint schemas can also be found in [`docs/API.md`](docs/API.md).

---

## 🤝 Contributing

Contributions are welcome! Please review our guidelines in [`docs/RULES.md`](docs/RULES.md) before submitting a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
