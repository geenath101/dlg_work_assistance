# ─── Variables ────────────────────────────────────────────────────────────────
GOCMD      := go
GOBUILD    := $(GOCMD) build
BINARY_DIR := bin
LAMBDAS    := employee site attendance location-ingest
MIGRATE    := go run github.com/golang-migrate/migrate/v4/cmd/migrate@v4.19.1

# Database connection – override any of these via environment or make invocation
# e.g.  make migrate/up DB_PASSWORD=secret
DB_HOST     ?= localhost
DB_PORT     ?= 5432
DB_USER     ?= postgres
DB_PASSWORD ?= postgres
DB_NAME     ?= work_assistance
DB_SSLMODE  ?= disable
DB_URL       = postgres://$(DB_USER):$(DB_PASSWORD)@$(DB_HOST):$(DB_PORT)/$(DB_NAME)?sslmode=$(DB_SSLMODE)

# Local dev server port
PORT ?= 8080

.PHONY: all build clean test tidy \
        db/up db/down pgadmin/open \
        migrate/up migrate/down \
        server/build run/server local help

# ─── Default ──────────────────────────────────────────────────────────────────
all: build

# ─── Lambda Builds ────────────────────────────────────────────────────────────
## build          – compile all lambda binaries for Linux/amd64 (AWS Lambda)
build:
	@mkdir -p $(BINARY_DIR)
	@for svc in $(LAMBDAS); do \
		echo "  → lambda/$$svc"; \
		GOOS=linux GOARCH=amd64 CGO_ENABLED=0 \
		$(GOBUILD) -ldflags="-s -w" -o $(BINARY_DIR)/$$svc ./lambda/$$svc/...; \
	done
	@echo "Lambdas written to $(BINARY_DIR)/"

## build/<svc>    – compile a single lambda  (e.g. make build/employee)
build/%:
	@mkdir -p $(BINARY_DIR)
	GOOS=linux GOARCH=amd64 CGO_ENABLED=0 \
	$(GOBUILD) -ldflags="-s -w" -o $(BINARY_DIR)/$* ./lambda/$*/...
	@echo "Built: $(BINARY_DIR)/$*"

# ─── Local Dev Server ─────────────────────────────────────────────────────────
## server/build   – compile the local HTTP dev server (native OS/arch)
server/build:
	@mkdir -p $(BINARY_DIR)
	$(GOBUILD) -o $(BINARY_DIR)/server ./cmd/server/...

## run/server     – run the local HTTP dev server  (postgres must already be up)
run/server: server/build
	DB_HOST=$(DB_HOST) \
	DB_PORT=$(DB_PORT) \
	DB_USER=$(DB_USER) \
	DB_PASSWORD=$(DB_PASSWORD) \
	DB_NAME=$(DB_NAME) \
	DB_SSLMODE=$(DB_SSLMODE) \
	PORT=$(PORT) \
	$(BINARY_DIR)/server

# ─── Database ─────────────────────────────────────────────────────────────────
## db/up          – start PostgreSQL + pgAdmin containers (detached)
db/up:
	docker compose up -d postgres pgadmin
	@echo "Waiting for PostgreSQL..."
	@until docker compose exec -T postgres pg_isready -U $(DB_USER) -d $(DB_NAME) > /dev/null 2>&1; do \
		printf "."; sleep 1; \
	done
	@echo " ready."
	@echo "pgAdmin → http://localhost:5050  (admin@local.dev / admin)"

## pgadmin/open   – open pgAdmin in the default browser
pgadmin/open:
	xdg-open http://localhost:5050 2>/dev/null || open http://localhost:5050 2>/dev/null || echo "Open http://localhost:5050 in your browser"

## db/down        – stop containers and remove volumes
db/down:
	docker compose down -v

# ─── Migrations ───────────────────────────────────────────────────────────────
## migrate/up     – apply all pending migrations
migrate/up:
	$(MIGRATE) -path ./migrations -database "$(DB_URL)" up

## migrate/down   – rollback the last applied migration
migrate/down:
	$(MIGRATE) -path ./migrations -database "$(DB_URL)" down 1

## migrate/force  – force migration version  (e.g. make migrate/force V=3)
migrate/force:
	$(MIGRATE) -path ./migrations -database "$(DB_URL)" force $(V)

# ─── Full Local Stack ─────────────────────────────────────────────────────────
## local          – start postgres → migrate → launch dev server (one command)
local: db/up migrate/up run/server

# ─── Code Quality ─────────────────────────────────────────────────────────────
## test           – run all tests
test:
	$(GOCMD) test -v ./...

## tidy           – tidy and verify go modules
tidy:
	$(GOCMD) mod tidy
	$(GOCMD) mod verify

## clean          – remove compiled binaries
clean:
	rm -rf $(BINARY_DIR)

# ─── Help ─────────────────────────────────────────────────────────────────────
## help           – list all targets
help:
	@grep -E '^##' Makefile | sed 's/^## /  /'
