package employee

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

func (r *Repository) Create(ctx context.Context, req CreateEmployeeRequest) (*Employee, error) {
	e := &Employee{
		ID:        uuid.New().String(),
		Name:      req.Name,
		Email:     req.Email,
		Phone:     req.Phone,
		CreatedAt: time.Now().UTC(),
		UpdatedAt: time.Now().UTC(),
	}
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO employees (id, name, email, phone, created_at, updated_at)
		 VALUES ($1, $2, $3, $4, $5, $6)`,
		e.ID, e.Name, e.Email, e.Phone, e.CreatedAt, e.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("inserting employee: %w", err)
	}
	return e, nil
}

func (r *Repository) GetByID(ctx context.Context, id string) (*Employee, error) {
	e := &Employee{}
	err := r.db.QueryRowContext(ctx,
		`SELECT id, name, email, phone, created_at, updated_at FROM employees WHERE id = $1`, id,
	).Scan(&e.ID, &e.Name, &e.Email, &e.Phone, &e.CreatedAt, &e.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return e, err
}

func (r *Repository) List(ctx context.Context) ([]*Employee, error) {
	rows, err := r.db.QueryContext(ctx,
		`SELECT id, name, email, phone, created_at, updated_at FROM employees ORDER BY name`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var employees []*Employee
	for rows.Next() {
		e := &Employee{}
		if err := rows.Scan(&e.ID, &e.Name, &e.Email, &e.Phone, &e.CreatedAt, &e.UpdatedAt); err != nil {
			return nil, err
		}
		employees = append(employees, e)
	}
	return employees, rows.Err()
}

func (r *Repository) AssignToSite(ctx context.Context, req AssignToSiteRequest) (*SiteAssignment, error) {
	// Deactivate any existing active assignment for this employee at the same site.
	_, _ = r.db.ExecContext(ctx,
		`UPDATE site_assignments SET active = false WHERE employee_id = $1 AND site_id = $2 AND active = true`,
		req.EmployeeID, req.SiteID,
	)

	a := &SiteAssignment{
		ID:         uuid.New().String(),
		SiteID:     req.SiteID,
		EmployeeID: req.EmployeeID,
		AssignedAt: time.Now().UTC(),
		Active:     true,
	}
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO site_assignments (id, site_id, employee_id, assigned_at, active)
		 VALUES ($1, $2, $3, $4, $5)`,
		a.ID, a.SiteID, a.EmployeeID, a.AssignedAt, a.Active,
	)
	if err != nil {
		return nil, fmt.Errorf("creating site assignment: %w", err)
	}
	return a, nil
}

func (r *Repository) GetAssignmentsBySite(ctx context.Context, siteID string) ([]*SiteAssignment, error) {
	rows, err := r.db.QueryContext(ctx,
		`SELECT id, site_id, employee_id, assigned_at, active
		 FROM site_assignments WHERE site_id = $1 AND active = true ORDER BY assigned_at`,
		siteID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var assignments []*SiteAssignment
	for rows.Next() {
		a := &SiteAssignment{}
		if err := rows.Scan(&a.ID, &a.SiteID, &a.EmployeeID, &a.AssignedAt, &a.Active); err != nil {
			return nil, err
		}
		assignments = append(assignments, a)
	}
	return assignments, rows.Err()
}
