package attendance

import (
	"context"
	"fmt"

	"dimeo/work-assistance/pkg/geo"
)

// Service enforces business rules for employee sign-in and sign-out.
// Both operations require the employee to be within the site's configured proximity radius.
type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) SignIn(ctx context.Context, req SignInRequest) (*AttendanceLog, error) {
	siteLat, siteLon, radius, err := s.repo.GetSiteLocation(ctx, req.SiteID)
	if err != nil {
		return nil, fmt.Errorf("fetching site location: %w", err)
	}

	dist := geo.Haversine(req.Latitude, req.Longitude, siteLat, siteLon)
	if dist > float64(radius) {
		return nil, fmt.Errorf("employee is %.1f m from site; must be within %d m to sign in", dist, radius)
	}

	return s.repo.Create(ctx, req)
}

func (s *Service) SignOut(ctx context.Context, req SignOutRequest) (*AttendanceLog, error) {
	log, err := s.repo.GetByID(ctx, req.AttendanceID)
	if err != nil {
		return nil, err
	}
	if log == nil {
		return nil, fmt.Errorf("attendance record not found")
	}

	siteLat, siteLon, radius, err := s.repo.GetSiteLocation(ctx, log.SiteID)
	if err != nil {
		return nil, fmt.Errorf("fetching site location: %w", err)
	}

	dist := geo.Haversine(req.Latitude, req.Longitude, siteLat, siteLon)
	if dist > float64(radius) {
		return nil, fmt.Errorf("employee is %.1f m from site; must be within %d m to sign out", dist, radius)
	}

	return s.repo.SignOut(ctx, req)
}

func (s *Service) GetByID(ctx context.Context, id string) (*AttendanceLog, error) {
	return s.repo.GetByID(ctx, id)
}
