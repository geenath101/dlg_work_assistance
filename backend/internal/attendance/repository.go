package attendance

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/google/uuid"
)

type Repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) Create(ctx context.Context, req SignInRequest) (*AttendanceLog, error) {
	a := &AttendanceLog{
		ID:         uuid.New().String(),
		SiteID:     req.SiteID,
		EmployeeID: req.EmployeeID,
		SignInAt:   time.Now().UTC(),
		SignInLat:  req.Latitude,
		SignInLon:  req.Longitude,
		Status:     StatusInProgress,
		CreatedAt:  time.Now().UTC(),
	}
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO attendance_logs
		   (id, site_id, employee_id, sign_in_at, sign_in_lat, sign_in_lon, status, created_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
		a.ID, a.SiteID, a.EmployeeID, a.SignInAt, a.SignInLat, a.SignInLon, string(a.Status), a.CreatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("inserting attendance log: %w", err)
	}
	return a, nil
}

func (r *Repository) SignOut(ctx context.Context, req SignOutRequest) (*AttendanceLog, error) {
	now := time.Now().UTC()
	res, err := r.db.ExecContext(ctx,
		`UPDATE attendance_logs
		 SET sign_out_at = $1, sign_out_lat = $2, sign_out_lon = $3, status = $4
		 WHERE id = $5 AND status = $6`,
		now, req.Latitude, req.Longitude, string(StatusCompleted), req.AttendanceID, string(StatusInProgress),
	)
	if err != nil {
		return nil, fmt.Errorf("signing out: %w", err)
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return nil, fmt.Errorf("no active attendance record found with id %s", req.AttendanceID)
	}
	return r.GetByID(ctx, req.AttendanceID)
}

func (r *Repository) GetByID(ctx context.Context, id string) (*AttendanceLog, error) {
	a := &AttendanceLog{}
	err := r.db.QueryRowContext(ctx,
		`SELECT id, site_id, employee_id, sign_in_at, sign_out_at,
		        sign_in_lat, sign_in_lon, sign_out_lat, sign_out_lon, status, created_at
		 FROM attendance_logs WHERE id = $1`, id,
	).Scan(
		&a.ID, &a.SiteID, &a.EmployeeID,
		&a.SignInAt, &a.SignOutAt,
		&a.SignInLat, &a.SignInLon, &a.SignOutLat, &a.SignOutLon,
		&a.Status, &a.CreatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return a, err
}

// GetSiteLocation returns the site coordinates and proximity radius for a given site ID.
func (r *Repository) GetSiteLocation(ctx context.Context, siteID string) (lat, lon float64, radiusM int, err error) {
	err = r.db.QueryRowContext(ctx,
		`SELECT latitude, longitude, proximity_radius_m FROM sites WHERE id = $1`, siteID,
	).Scan(&lat, &lon, &radiusM)
	return
}
