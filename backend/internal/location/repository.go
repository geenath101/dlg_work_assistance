package location

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

func (r *Repository) Record(ctx context.Context, req RecordLocationRequest) (*LocationTrack, error) {
	t := &LocationTrack{
		ID:           uuid.New().String(),
		AttendanceID: req.AttendanceID,
		EmployeeID:   req.EmployeeID,
		SiteID:       req.SiteID,
		Latitude:     req.Latitude,
		Longitude:    req.Longitude,
		RecordedAt:   time.Now().UTC(),
	}
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO location_tracks
		   (id, attendance_id, employee_id, site_id, latitude, longitude, recorded_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
		t.ID, t.AttendanceID, t.EmployeeID, t.SiteID, t.Latitude, t.Longitude, t.RecordedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("inserting location track: %w", err)
	}
	return t, nil
}

func (r *Repository) QueryByAttendance(ctx context.Context, attendanceID string) ([]*LocationTrack, error) {
	rows, err := r.db.QueryContext(ctx,
		`SELECT id, attendance_id, employee_id, site_id, latitude, longitude, recorded_at
		 FROM location_tracks WHERE attendance_id = $1 ORDER BY recorded_at`,
		attendanceID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanRows(rows)
}

func (r *Repository) QueryByEmployee(ctx context.Context, employeeID string) ([]*LocationTrack, error) {
	rows, err := r.db.QueryContext(ctx,
		`SELECT id, attendance_id, employee_id, site_id, latitude, longitude, recorded_at
		 FROM location_tracks WHERE employee_id = $1 ORDER BY recorded_at DESC LIMIT 1000`,
		employeeID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanRows(rows)
}

func scanRows(rows *sql.Rows) ([]*LocationTrack, error) {
	var tracks []*LocationTrack
	for rows.Next() {
		t := &LocationTrack{}
		if err := rows.Scan(&t.ID, &t.AttendanceID, &t.EmployeeID, &t.SiteID,
			&t.Latitude, &t.Longitude, &t.RecordedAt); err != nil {
			return nil, err
		}
		tracks = append(tracks, t)
	}
	return tracks, rows.Err()
}
