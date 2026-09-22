# FlightGuard AI — Testing Rules

1. Every vertical slice must include backend pytest suites and frontend build checks.
2. Test both happy path and edge/failure cases (invalid input, unauthenticated requests, unauthorized access).
3. Verify ML inference returns valid probability ranges (0.0 to 1.0) and non-negative predicted delay values.
4. Never disable or skip tests to mask failures.
