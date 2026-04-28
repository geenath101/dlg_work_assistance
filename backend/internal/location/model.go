package location
package location

import "time"

// LocationTrack is a single GPS data point recorded during an active work session.
type LocationTrack struct {
	ID           string    `json:"id"`
	AttendanceID string    `json:"attendance_id"`
	EmployeeID   string    `json:"employee_id"`
	SiteID       string    `json:"site_id"`
	Latitude     float64   `json:"latitude"`
	Longitude    float64   `json:"longitude"`
	RecordedAt   time.Time `json:"recorded_at"`
}

type RecordLocationRequest struct {
	AttendanceID string  `json:"attendance_id"`
	EmployeeID   string  `json:"employee_id"`
	SiteID       string  `json:"site_id"`
	Latitude     float64 `json:"latitude"`
	Longitude    float64 `json:"longitude"`
}
