package employee
package employee

import "time"

// Employee represents a cleaning company staff member.
type Employee struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Phone     string    `json:"phone"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type CreateEmployeeRequest struct {
	Name  string `json:"name"`
	Email string `json:"email"`
	Phone string `json:"phone"`
}

// SiteAssignment links an employee to a cleaning site.
type SiteAssignment struct {
	ID         string    `json:"id"`
	SiteID     string    `json:"site_id"`
	EmployeeID string    `json:"employee_id"`
	AssignedAt time.Time `json:"assigned_at"`
	Active     bool      `json:"active"`
}

type AssignToSiteRequest struct {
	EmployeeID string `json:"employee_id"`
	SiteID     string `json:"site_id"`
}
