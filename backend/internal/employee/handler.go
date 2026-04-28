package employee

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/aws/aws-lambda-go/events"

	"dimeo/work-assistance/pkg/response"
)

type Handler struct {
	svc *Service
}

func NewHandler(svc *Service) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) Route(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	switch {
	case req.HTTPMethod == http.MethodPost && req.Resource == "/employees/assign":
		return h.assign(ctx, req.Body)
	case req.HTTPMethod == http.MethodGet && req.Resource == "/employees/site/{siteId}":
		return h.getBySite(ctx, req.PathParameters["siteId"])
	case req.HTTPMethod == http.MethodGet && req.PathParameters["id"] != "":
		return h.getByID(ctx, req.PathParameters["id"])
	case req.HTTPMethod == http.MethodGet:
		return h.list(ctx)
	case req.HTTPMethod == http.MethodPost:
		return h.create(ctx, req.Body)
	default:
		return response.Error(http.StatusMethodNotAllowed, "method not allowed"), nil
	}
}

func (h *Handler) create(ctx context.Context, body string) (events.APIGatewayProxyResponse, error) {
	var req CreateEmployeeRequest
	if err := json.Unmarshal([]byte(body), &req); err != nil {
		return response.Error(http.StatusBadRequest, "invalid request body"), nil
	}
	emp, err := h.svc.Create(ctx, req)
	if err != nil {
		return response.Error(http.StatusInternalServerError, err.Error()), nil
	}
	return response.JSON(http.StatusCreated, emp), nil
}

func (h *Handler) getByID(ctx context.Context, id string) (events.APIGatewayProxyResponse, error) {
	emp, err := h.svc.GetByID(ctx, id)
	if err != nil {
		return response.Error(http.StatusInternalServerError, err.Error()), nil
	}
	if emp == nil {
		return response.Error(http.StatusNotFound, "employee not found"), nil
	}
	return response.JSON(http.StatusOK, emp), nil
}

func (h *Handler) list(ctx context.Context) (events.APIGatewayProxyResponse, error) {
	emps, err := h.svc.List(ctx)
	if err != nil {
		return response.Error(http.StatusInternalServerError, err.Error()), nil
	}
	if emps == nil {
		emps = []*Employee{}
	}
	return response.JSON(http.StatusOK, emps), nil
}

func (h *Handler) assign(ctx context.Context, body string) (events.APIGatewayProxyResponse, error) {
	var req AssignToSiteRequest
	if err := json.Unmarshal([]byte(body), &req); err != nil {
		return response.Error(http.StatusBadRequest, "invalid request body"), nil
	}
	a, err := h.svc.AssignToSite(ctx, req)
	if err != nil {
		return response.Error(http.StatusInternalServerError, err.Error()), nil
	}
	return response.JSON(http.StatusCreated, a), nil
}

func (h *Handler) getBySite(ctx context.Context, siteID string) (events.APIGatewayProxyResponse, error) {
	assignments, err := h.svc.GetAssignmentsBySite(ctx, siteID)
	if err != nil {
		return response.Error(http.StatusInternalServerError, err.Error()), nil
	}
	if assignments == nil {
		assignments = []*SiteAssignment{}
	}
	return response.JSON(http.StatusOK, assignments), nil
}
