package site

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/google/uuid"
)

// Repository handles all database operations for sites.
type Repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) Create(ctx context.Context, req CreateSiteRequest) (*Site, error) {
	s := &Site{
		ID:               uuid.New().String(),
		Name:             req.Name,
		Address:          req.Address,
		Latitude:         req.Latitude,
		Longitude:        req.Longitude,
		ProximityRadiusM: req.ProximityRadiusM,
		CreatedAt:        time.Now().UTC(),
		UpdatedAt:        time.Now().UTC(),
	}
	if s.ProximityRadiusM == 0 {
		s.ProximityRadiusM = 100 // default 100 m
	}

	_, err := r.db.ExecContext(ctx,
		`INSERT INTO sites (id, name, address, latitude, longitude, proximity_radius_m, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
		s.ID, s.Name, s.Address, s.Latitude, s.Longitude, s.ProximityRadiusM, s.CreatedAt, s.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("inserting site: %w", err)
	}
	return s, nil
}

func (r *Repository) GetByID(ctx context.Context, id string) (*Site, error) {
	s := &Site{}
	err := r.db.QueryRowContext(ctx,
		`SELECT id, name, address, latitude, longitude, proximity_radius_m, created_at, updated_at
		 FROM sites WHERE id = $1`, id,
	).Scan(&s.ID, &s.Name, &s.Address, &s.Latitude, &s.Longitude, &s.ProximityRadiusM, &s.CreatedAt, &s.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return s, err
}

func (r *Repository) List(ctx context.Context) ([]*Site, error) {
	rows, err := r.db.QueryContext(ctx,
		`SELECT id, name, address, latitude, longitude, proximity_radius_m, created_at, updated_at
		 FROM sites ORDER BY created_at DESC`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sites []*Site
	for rows.Next() {
		s := &Site{}
		if err := rows.Scan(&s.ID, &s.Name, &s.Address, &s.Latitude, &s.Longitude,
			&s.ProximityRadiusM, &s.CreatedAt, &s.UpdatedAt); err != nil {
			return nil, err
		}
		sites = append(sites, s)
	}
	return sites, rows.Err()
}

func (r *Repository) Delete(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM sites WHERE id = $1`, id)
	return err
}
