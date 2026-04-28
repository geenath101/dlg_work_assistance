package employee

import "context"

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) Create(ctx context.Context, req CreateEmployeeRequest) (*Employee, error) {
	return s.repo.Create(ctx, req)
}

func (s *Service) GetByID(ctx context.Context, id string) (*Employee, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *Service) List(ctx context.Context) ([]*Employee, error) {
	return s.repo.List(ctx)
}

func (s *Service) AssignToSite(ctx context.Context, req AssignToSiteRequest) (*SiteAssignment, error) {
	return s.repo.AssignToSite(ctx, req)
}

func (s *Service) GetAssignmentsBySite(ctx context.Context, siteID string) ([]*SiteAssignment, error) {
	return s.repo.GetAssignmentsBySite(ctx, siteID)
}
