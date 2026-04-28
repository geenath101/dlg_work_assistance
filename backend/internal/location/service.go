package location

import "context"

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) Record(ctx context.Context, req RecordLocationRequest) (*LocationTrack, error) {
	return s.repo.Record(ctx, req)
}

func (s *Service) QueryByAttendance(ctx context.Context, attendanceID string) ([]*LocationTrack, error) {
	return s.repo.QueryByAttendance(ctx, attendanceID)
}

func (s *Service) QueryByEmployee(ctx context.Context, employeeID string) ([]*LocationTrack, error) {
	return s.repo.QueryByEmployee(ctx, employeeID)
}
