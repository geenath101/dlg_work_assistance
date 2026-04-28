package site
package site

import "time"

// Site represents a cleaning work-site.
type Site struct {
	ID               string    `json:"id"`
	Name             string    `json:"name"`
	Address          string    `json:"address"`
	Latitude         float64   `json:"latitude"`
	Longitude        float64   `json:"longitude"`
	ProximityRadiusM int       `json:"proximity_radius_m"` // metres; configurable check-in/out radius
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

type CreateSiteRequest struct {
	Name             string  `json:"name"`
	Address          string  `json:"address"`
	Latitude         float64 `json:"latitude"`
	Longitude        float64 `json:"longitude"`
	ProximityRadiusM int     `json:"proximity_radius_m"`
}
