# Backend – Progress Tracker

## Status: In Progress

---

## ✅ Completed

### 1. Go Module Initialised
- Module: `dimeo/work-assistance`
- Go version: `1.25.3`

---

### 2. Project Structure

```
backend/
├── go.mod
├── docker-compose.yml
├── PROGRESS.md
│
├── lambda/                        # AWS Lambda entrypoints
│   ├── site/main.go
│   ├── employee/main.go
│   ├── attendance/main.go
│   └── location-ingest/main.go
│
├── internal/                      # Domain services (model / repository / service / handler)
│   ├── site/
│   │   ├── model.go
│   │   ├── repository.go
│   │   ├── service.go
│   │   └── handler.go
│   ├── employee/
│   │   ├── model.go
│   │   ├── repository.go
│   │   ├── service.go
│   │   └── handler.go
│   ├── attendance/
│   │   ├── model.go
│   │   ├── repository.go
│   │   ├── service.go
│   │   └── handler.go
│   └── location/
│       ├── model.go
│       ├── repository.go
│       ├── service.go
│       └── handler.go
│
├── pkg/                           # Shared utilities
│   ├── database/postgres.go       # PostgreSQL connection pool
│   ├── geo/distance.go            # Haversine distance formula
│   └── response/response.go      # API Gateway JSON response helpers
│
├── migrations/                    # SQL migrations (up + down)
│   ├── 000001_create_sites_table
│   ├── 000002_create_employees_table
│   ├── 000003_create_site_assignments_table
│   ├── 000004_create_attendance_logs_table
│   └── 000005_create_location_tracks_table
│
└── infrastructure/terraform/      # AWS infrastructure (Terraform)
    ├── main.tf      – provider & backend config
    ├── variables.tf – input variables
    ├── vpc.tf       – VPC, subnets, NAT gateway, security groups
    ├── rds.tf       – RDS PostgreSQL 16 instance
    ├── iam.tf       – Lambda execution IAM role
    ├── lambda.tf    – 4 Lambda function resources
    └── outputs.tf   – API URL, RDS endpoint, VPC ID
```

---

### 3. Domain Services Implemented

| Service     | Responsibility                                                                 |
|-------------|--------------------------------------------------------------------------------|
| `site`      | Create / list / get / delete cleaning sites with location & proximity radius   |
| `employee`  | Create / list / get employees; assign employees to sites                       |
| `attendance`| Sign-in & sign-out with GPS proximity check (configurable radius per site)     |
| `location`  | Record periodic GPS pings during a work session; query by attendance/employee  |

---

### 4. Key Business Rules Implemented

- **Proximity enforcement**: sign-in and sign-out both validate that the employee is within the site's `proximity_radius_m` (default 100 m) using the Haversine formula.
- **Configurable radius**: stored per site in the database; can be changed without a code deploy.
- **Location tracking**: periodic pings are stored in `location_tracks` and queryable by attendance session or employee — supports future analytics and decision-making.

---

### 5. Database Schema

5 tables, all with up/down migrations:

| Table                | Purpose                                            |
|----------------------|----------------------------------------------------|
| `sites`              | Cleaning site registry with GPS coordinates        |
| `employees`          | Staff records                                      |
| `site_assignments`   | Many-to-many employee ↔ site with active flag      |
| `attendance_logs`    | Sign-in/out records with GPS snapshot              |
| `location_tracks`    | High-frequency GPS pings during active sessions    |

---

### 6. Infrastructure (Terraform)

- VPC with public + private subnets across 2 AZs
- NAT Gateway for Lambda outbound access
- RDS PostgreSQL 16 in private subnets (encrypted, backup enabled)
- 4 Lambda functions (`provided.al2023` runtime, Go binary as `bootstrap`)
- Shared IAM execution role with VPC access policy

---

## 🔲 TODO (Next Steps)

- [ ] Run `go mod tidy` to pull dependencies (`aws-lambda-go`, `lib/pq`, `google/uuid`)
- [ ] Add API Gateway v2 (HTTP API) Terraform resource to front the Lambdas
- [ ] Add build scripts / Makefile targets to compile & zip each Lambda for deployment (`GOOS=linux GOARCH=amd64`)
- [ ] Write unit tests for `geo/distance.go` and service layer
- [ ] Set up `golang-migrate` or similar to run migrations against RDS
- [ ] Add Cognito or JWT-based auth middleware (manager vs employee roles)
- [ ] Android / iOS mobile app (Kotlin) – sign-in/out + periodic location ping
- [ ] React web admin panel – site management, map search (OpenStreetMap/Google), employee assignment
