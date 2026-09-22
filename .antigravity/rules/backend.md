# FlightGuard AI — Backend Development Rules

1. Use FastAPI + Pydantic v2 + SQLAlchemy 2.0 + Alembic + PostgreSQL.
2. Keep routers thin. Put business logic in service classes and data access in repository classes or models.
3. Validate all inputs using Pydantic schemas.
4. Enforce server-side role-based authorization (RBAC) on all protected routes.
5. All endpoints must return consistent, structured error schemas under `/api/v1`. Never leak internal tracebacks.
