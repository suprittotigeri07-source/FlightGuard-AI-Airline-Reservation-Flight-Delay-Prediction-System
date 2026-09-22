# FlightGuard AI — Security

## 1. Security Objectives

FlightGuard AI handles:

- User accounts
- Authentication data
- Passenger information
- Reservations
- Flight information
- Operational information
- ML predictions

Security goals:

1. Protect confidentiality.
2. Protect data integrity.
3. Maintain availability.
4. Prevent unauthorized access.
5. Provide auditable operational actions.

---

## 2. Threat Model

Primary threats:

- Credential theft
- Broken authentication
- Broken authorization / IDOR
- SQL injection
- XSS
- CSRF where applicable
- CORS misconfiguration
- Brute-force login attempts
- API abuse
- Sensitive data leakage
- Insecure logging
- Dependency vulnerabilities
- Malicious file uploads if introduced
- Model tampering
- Data poisoning
- Prompt injection if an AI assistant is added later

---

## 3. Authentication

Use:

- Strong password hashing
- JWT-based authentication
- Short-lived access tokens
- Secure token handling
- Authentication middleware/dependencies
- Account-level authorization

Never:

- Store plaintext passwords
- Return passwords in API responses
- Log passwords
- Store secrets in source code

---

## 4. Authorization

Roles:

```text
PASSENGER
OPERATIONS_AGENT
ADMIN
```

Authorization matrix:

| Resource | Passenger | Operations Agent | Admin |
|---|---:|---:|---:|
| Search Flights | Yes | Yes | Yes |
| Create Reservation | Yes | Optional | Yes |
| View Own Reservations | Yes | No | Yes |
| View Operational Data | No | Yes | Yes |
| Manage Flights | No | Limited | Yes |
| Manage Users | No | No | Yes |
| View Audit Logs | No | Limited | Yes |

The backend must enforce these permissions.

---

## 5. IDOR Prevention

Never assume that knowing an ID grants access.

For example:

```text
GET /reservations/123
```

must verify that:

- The authenticated user owns the reservation, or
- The user has an authorized operational/admin role.

---

## 6. Input Validation

Validate:

- Strings
- Emails
- Dates
- Airport codes
- Flight IDs
- Passenger information
- Pagination
- Filters
- Sort fields

Use allowlists where practical.

Never pass raw user input into:

- SQL
- Shell commands
- File paths
- Dynamic code execution

---

## 7. API Security

Production APIs should use:

- HTTPS
- Secure CORS configuration
- Rate limiting
- Request validation
- Authentication
- Authorization
- Structured errors
- Request IDs

Sensitive endpoints such as login should receive stronger abuse protection.

---

## 8. Database Security

- Use least-privilege database credentials.
- Keep database credentials in environment variables.
- Use parameterized queries/ORM operations.
- Apply migrations.
- Encrypt database connections in production.
- Restrict public database access.
- Back up production data.
- Test restoration procedures.

---

## 9. Secrets Management

`.env` is for local development only.

Example:

```text
DATABASE_URL=
JWT_SECRET=
CORS_ORIGINS=
```

Never commit:

```text
.env
*.pem
*.key
credentials.json
service-account.json
```

Use a proper secret manager in production.

---

## 10. Sensitive Data

Minimize collection of passenger information.

Do not collect sensitive information unless required.

Never expose:

- Password hashes
- Tokens
- Internal secrets
- Database credentials
- Private infrastructure details

Mask sensitive values in logs and debugging output.

---

## 11. Logging and Auditing

Audit important actions:

- Login
- Logout where useful
- Failed authentication attempts
- Reservation creation
- Reservation cancellation
- Flight modifications
- User-role changes
- Administrative actions

Audit records should include:

```text
actor
action
resource
resource_id
timestamp
request_id
result
```

Never include credentials or tokens.

---

## 12. ML Security

ML model security requirements:

- Version model artifacts.
- Validate model files before deployment.
- Do not load arbitrary model paths from requests.
- Restrict access to training pipelines.
- Validate inference input.
- Record model version.
- Monitor prediction quality.
- Protect training data.
- Review suspicious changes in model artifacts.

---

## 13. Security Headers

Production deployment should consider:

- Content-Security-Policy
- X-Content-Type-Options
- Referrer-Policy
- Strict-Transport-Security
- Permissions-Policy
- Frame protection

Configure these at the appropriate application/reverse-proxy layer.

---

## 14. Dependency Security

Regularly review:

- Python dependencies
- npm dependencies
- Docker base images

Use automated dependency scanning where available.

Do not blindly upgrade production dependencies without testing.

---

## 15. Incident Response

If a security issue is discovered:

1. Stop further exposure.
2. Identify affected resources.
3. Rotate compromised credentials.
4. Preserve relevant logs.
5. Patch the vulnerability.
6. Add a regression/security test.
7. Document the incident and decision.

---

## 16. Security Checklist

Before release:

- [ ] No secrets in Git
- [ ] Authentication implemented
- [ ] Authorization verified server-side
- [ ] Input validation implemented
- [ ] Rate limiting considered
- [ ] CORS restricted
- [ ] HTTPS configured
- [ ] Secure headers configured
- [ ] Passwords hashed
- [ ] Sensitive logs removed
- [ ] SQL injection protections verified
- [ ] IDOR checks tested
- [ ] Dependencies scanned
- [ ] Database backups configured
- [ ] Security tests passing
