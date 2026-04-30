package attendance

import "time"

// Status represents the current state of an attendance record.
type Status string

const (
	StatusInProgress Status = "in_progress"
	StatusCompleted  Status = "completed"
)

// AttendanceLog records a single work session for an employee at a site.
type AttendanceLog struct {
	ID         string     `json:"id"`
	SiteID     string     `json:"site_id"`
	EmployeeID string     `json:"employee_id"`
	SignInAt   time.Time  `json:"sign_in_at"`
	SignOutAt  *time.Time `json:"sign_out_at,omitempty"`
	SignInLat  float64    `json:"sign_in_lat"`
	SignInLon  float64    `json:"sign_in_lon"`
	SignOutLat *float64   `json:"sign_out_lat,omitempty"`
	SignOutLon *float64   `json:"sign_out_lon,omitempty"`
	Status     Status     `json:"status"`
	CreatedAt  time.Time  `json:"created_at"`
}

type SignInRequest struct {
	EmployeeID string  `json:"employee_id"`
	SiteID     string  `json:"site_id"`
	Latitude   float64 `json:"latitude"`
	Longitude  float64 `json:"longitude"`
}

type SignOutRequest struct {
	AttendanceID string  `json:"attendance_id"`
	Latitude     float64 `json:"latitude"`
	Longitude    float64 `json:"longitude"`
}
