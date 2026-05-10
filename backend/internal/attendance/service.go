package attendance

import (
	"context"
	"fmt"
	"log"

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
	log.Printf("[attendance] sign-in: employeeID=%s siteID=%s lat=%.6f lon=%.6f", req.EmployeeID, req.SiteID, req.Latitude, req.Longitude)
	siteLat, siteLon, radius, err := s.repo.GetSiteLocation(ctx, req.SiteID)
	if err != nil {
		log.Printf("[attendance] sign-in: error fetching site location siteID=%s: %v", req.SiteID, err)
		return nil, fmt.Errorf("fetching site location: %w", err)
	}

	dist := geo.Haversine(req.Latitude, req.Longitude, siteLat, siteLon)
	log.Printf("[attendance] sign-in: distance=%.1fm radius=%dm employeeID=%s siteID=%s", dist, radius, req.EmployeeID, req.SiteID)
	if dist > float64(radius) {
		log.Printf("[attendance] sign-in: rejected — employee too far (%.1fm > %dm)", dist, radius)
		return nil, fmt.Errorf("employee is %.1f m from site; must be within %d m to sign in", dist, radius)
	}

	result, err := s.repo.Create(ctx, req)
	if err != nil {
		log.Printf("[attendance] sign-in: error creating record: %v", err)
		return nil, err
	}
	log.Printf("[attendance] sign-in: success attendanceID=%s", result.ID)
	return result, nil
}

func (s *Service) SignOut(ctx context.Context, req SignOutRequest) (*AttendanceLog, error) {
	log.Printf("[attendance] sign-out: attendanceID=%s lat=%.6f lon=%.6f", req.AttendanceID, req.Latitude, req.Longitude)
	rec, err := s.repo.GetByID(ctx, req.AttendanceID)
	if err != nil {
		log.Printf("[attendance] sign-out: error fetching attendance record: %v", err)
		return nil, err
	}
	if rec == nil {
		log.Printf("[attendance] sign-out: record not found attendanceID=%s", req.AttendanceID)
		return nil, fmt.Errorf("attendance record not found")
	}

	siteLat, siteLon, radius, err := s.repo.GetSiteLocation(ctx, rec.SiteID)
	if err != nil {
		log.Printf("[attendance] sign-out: error fetching site location siteID=%s: %v", rec.SiteID, err)
		return nil, fmt.Errorf("fetching site location: %w", err)
	}

	dist := geo.Haversine(req.Latitude, req.Longitude, siteLat, siteLon)
	log.Printf("[attendance] sign-out: distance=%.1fm radius=%dm attendanceID=%s", dist, radius, req.AttendanceID)
	if dist > float64(radius) {
		log.Printf("[attendance] sign-out: rejected — employee too far (%.1fm > %dm)", dist, radius)
		return nil, fmt.Errorf("employee is %.1f m from site; must be within %d m to sign out", dist, radius)
	}

	result, err := s.repo.SignOut(ctx, req)
	if err != nil {
		log.Printf("[attendance] sign-out: error: %v", err)
		return nil, err
	}
	log.Printf("[attendance] sign-out: success attendanceID=%s", req.AttendanceID)
	return result, nil
}

func (s *Service) GetByID(ctx context.Context, id string) (*AttendanceLog, error) {
	return s.repo.GetByID(ctx, id)
}
