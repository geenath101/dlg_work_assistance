package employee

import (
	"context"
	"encoding/json"
	"log"
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
	log.Printf("[employee] route: method=%s resource=%s params=%v", req.HTTPMethod, req.Resource, req.PathParameters)
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
		log.Printf("[employee] create: failed to parse request body: %v", err)
		return response.Error(http.StatusBadRequest, "invalid request body"), nil
	}
	log.Printf("[employee] create: name=%s email=%s", req.Name, req.Email)
	emp, err := h.svc.Create(ctx, req)
	if err != nil {
		log.Printf("[employee] create: error: %v", err)
		return response.Error(http.StatusInternalServerError, err.Error()), nil
	}
	log.Printf("[employee] create: success id=%s", emp.ID)
	return response.JSON(http.StatusCreated, emp), nil
}

func (h *Handler) getByID(ctx context.Context, id string) (events.APIGatewayProxyResponse, error) {
	log.Printf("[employee] getByID: id=%s", id)
	emp, err := h.svc.GetByID(ctx, id)
	if err != nil {
		log.Printf("[employee] getByID: error: %v", err)
		return response.Error(http.StatusInternalServerError, err.Error()), nil
	}
	if emp == nil {
		log.Printf("[employee] getByID: not found id=%s", id)
		return response.Error(http.StatusNotFound, "employee not found"), nil
	}
	return response.JSON(http.StatusOK, emp), nil
}

func (h *Handler) list(ctx context.Context) (events.APIGatewayProxyResponse, error) {
	log.Printf("[employee] list: fetching all employees")
	emps, err := h.svc.List(ctx)
	if err != nil {
		log.Printf("[employee] list: error: %v", err)
		return response.Error(http.StatusInternalServerError, err.Error()), nil
	}
	if emps == nil {
		emps = []*Employee{}
	}
	log.Printf("[employee] list: returned %d employees", len(emps))
	return response.JSON(http.StatusOK, emps), nil
}

func (h *Handler) assign(ctx context.Context, body string) (events.APIGatewayProxyResponse, error) {
	var req AssignToSiteRequest
	if err := json.Unmarshal([]byte(body), &req); err != nil {
		log.Printf("[employee] assign: failed to parse request body: %v", err)
		return response.Error(http.StatusBadRequest, "invalid request body"), nil
	}
	log.Printf("[employee] assign: employeeID=%s siteID=%s", req.EmployeeID, req.SiteID)
	a, err := h.svc.AssignToSite(ctx, req)
	if err != nil {
		log.Printf("[employee] assign: error: %v", err)
		return response.Error(http.StatusInternalServerError, err.Error()), nil
	}
	log.Printf("[employee] assign: success assignmentID=%s", a.ID)
	return response.JSON(http.StatusCreated, a), nil
}

func (h *Handler) getBySite(ctx context.Context, siteID string) (events.APIGatewayProxyResponse, error) {
	log.Printf("[employee] getBySite: siteID=%s", siteID)
	assignments, err := h.svc.GetAssignmentsBySite(ctx, siteID)
	if err != nil {
		log.Printf("[employee] getBySite: error: %v", err)
		return response.Error(http.StatusInternalServerError, err.Error()), nil
	}
	if assignments == nil {
		assignments = []*SiteAssignment{}
	}
	log.Printf("[employee] getBySite: siteID=%s returned %d assignments", siteID, len(assignments))
	return response.JSON(http.StatusOK, assignments), nil
}
