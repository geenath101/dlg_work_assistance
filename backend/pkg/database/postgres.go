package database

import (
	"database/sql"
	"fmt"
	"net/url"
	"os"

	_ "github.com/lib/pq"
)

// NewPostgresDB creates and verifies a new PostgreSQL connection pool.
// Configuration is read from environment variables.
func NewPostgresDB() (*sql.DB, error) {
	password := os.Getenv("DB_PASSWORD")
	safePassword := url.QueryEscape(password)
	dsn := fmt.Sprintf("postgres://%s:%s@workassistance.cd2oqmc2ir65.ap-southeast-2.rds.amazonaws.com:5432/postgres?sslmode=verify-full&sslrootcert=./global-bundle.pem", "postgres", safePassword)
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("opening db connection: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("pinging db: %w", err)
	}

	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(5)

	return db, nil
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
