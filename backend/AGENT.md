# Backend Agent — Dimeo Work Assistance

## Purpose

This layer provides all server-side business logic for the Dimeo Work Assistance platform. It is built as a set of Go microservices deployed as AWS Lambda functions, backed by a PostgreSQL database on AWS RDS.

---

## Tech Stack

| Concern | Technology |
|---|---|
| Language | Go 1.25.3 |
| Runtime | AWS Lambda (`provided.al2023`) |
| Database | PostgreSQL 16 (RDS in production, Docker locally) |
| Infrastructure | Terraform |
| DB Migrations | golang-migrate |
| Auth (planned) | AWS Cognito or JWT middleware |

---

## Project Structure

```
backend/
├── cmd/server/              # Local HTTP dev server (non-Lambda entry point)
├── lambda/                  # AWS Lambda entrypoints — one per domain
│   ├── site/main.go
│   ├── employee/main.go
│   ├── attendance/main.go
│   └── location-ingest/main.go
├── internal/                # Domain packages (model / repository / service / handler)
│   ├── site/
│   ├── employee/
│   ├── attendance/
│   └── location/
├── pkg/                     # Shared utilities
│   ├── database/postgres.go # PostgreSQL connection pool
│   ├── geo/distance.go      # Haversine formula for GPS proximity
│   └── response/response.go # API Gateway JSON response helpers
├── migrations/              # SQL up/down migration files
├── infrastructure/terraform/ # Full AWS infrastructure definition
├── docker-compose.yml       # Local PostgreSQL 16 + pgAdmin
├── Makefile                 # Dev workflow targets
└── API_SAMPLES.md           # Full REST API documentation with cURL examples
```

---

## Domain Services

| Domain | Responsibility |
|---|---|
| `site` | Create / list / get / delete cleaning sites with GPS coordinates and proximity radius |
| `employee` | Create / list / get employees; assign/unassign employees to sites |
| `attendance` | Sign-in and sign-out with GPS proximity enforcement |
| `location` | Ingest periodic GPS pings during active sessions; query by session or employee |

Each domain follows a consistent four-layer pattern:
- `model.go` — data structures
- `repository.go` — raw SQL queries against PostgreSQL
- `service.go` — business logic and validation
- `handler.go` — HTTP/Lambda request parsing and response formatting

---

## Key Business Rules

- **Proximity enforcement**: sign-in and sign-out both check that the employee is within `proximity_radius_m` of the site (default 100 m), computed via the Haversine formula in `pkg/geo/distance.go`.
- **Configurable radius**: stored per site in the database; no code deploy required to change it.
- **Location tracking**: periodic GPS pings are stored in `location_tracks` for later analytics and auditing.
- **Role separation**: managers manage sites and employees; employees can only sign in/out and send location pings. Auth not yet implemented.

---

## Database Schema

| Table | Purpose |
|---|---|
| `sites` | Cleaning site registry with GPS coordinates and proximity radius |
| `employees` | Staff records (name, contact, etc.) |
| `site_assignments` | Many-to-many employee ↔ site with `is_active` flag |
| `attendance_logs` | Sign-in/out records with GPS snapshot and timestamps |
| `location_tracks` | High-frequency GPS pings during active work sessions |

---

## Local Development

```bash
# Start PostgreSQL and pgAdmin locally
make db/start

# Run all pending migrations
make migrate/up

# Start local HTTP dev server (non-Lambda)
make local

# Build and zip all Lambda binaries for deployment
make build
```

Environment variables required (set in shell or `.env`):
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`

---

## Infrastructure (Terraform)

Located in `infrastructure/terraform/`. Provisions:
- VPC with public + private subnets across 2 AZs
- NAT Gateway for Lambda outbound access
- RDS PostgreSQL 16 in private subnets (encrypted, backups enabled)
- 4 Lambda functions (one per domain)
- Shared IAM execution role with VPC network access
- API Gateway HTTP API fronting the Lambdas (pending Terraform wiring)

---

## Outstanding Work

- [ ] Wire API Gateway v2 (HTTP API) in Terraform to front all Lambda functions
- [ ] Add Cognito or JWT-based auth middleware (manager vs employee roles)
- [ ] Write unit tests for `pkg/geo/distance.go` and all service layers
- [ ] Set up CI/CD pipeline to build, test, and deploy Lambda zips on merge
- [ ] Validate migrations run cleanly against RDS on first deploy

---

## Coding Conventions

- Keep Lambda entrypoints thin — all logic lives in `internal/` packages.
- All database access goes through the repository layer; no raw SQL in service or handler files.
- Use `pkg/response` helpers for all API Gateway JSON responses to keep error formatting consistent.
- All new domains must follow the `model / repository / service / handler` structure.
- Go module path: `dimeo/work-assistance`
