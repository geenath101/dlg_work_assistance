package site

import (
	"context"
	"encoding/json"
	"log"
	"net/http"

	"github.com/aws/aws-lambda-go/events"

	"dimeo/work-assistance/pkg/response"
)

// Handler routes API Gateway requests to the correct site operation.
type Handler struct {
	svc *Service
}

func NewHandler(svc *Service) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) Route(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	log.Printf("[site] route: method=%s params=%v", req.HTTPMethod, req.PathParameters)
	switch req.HTTPMethod {
	case http.MethodGet:
		if id := req.PathParameters["id"]; id != "" {
			return h.getByID(ctx, id)
		}
		return h.list(ctx)
	case http.MethodPost:
		return h.create(ctx, req.Body)
	case http.MethodDelete:
		if id := req.PathParameters["id"]; id != "" {
			return h.delete(ctx, id)
		}
		return response.Error(http.StatusBadRequest, "missing path parameter: id"), nil
	default:
		return response.Error(http.StatusMethodNotAllowed, "method not allowed"), nil
	}
}

func (h *Handler) create(ctx context.Context, body string) (events.APIGatewayProxyResponse, error) {
	var req CreateSiteRequest
	if err := json.Unmarshal([]byte(body), &req); err != nil {
		log.Printf("[site] create: failed to parse request body: %v", err)
		return response.Error(http.StatusBadRequest, "invalid request body"), nil
	}
	log.Printf("[site] create: name=%s lat=%.6f lon=%.6f radius=%d", req.Name, req.Latitude, req.Longitude, req.ProximityRadiusM)
	s, err := h.svc.Create(ctx, req)
	if err != nil {
		log.Printf("[site] create: error: %v", err)
		return response.Error(http.StatusInternalServerError, err.Error()), nil
	}
	log.Printf("[site] create: success id=%s", s.ID)
	return response.JSON(http.StatusCreated, s), nil
}

func (h *Handler) getByID(ctx context.Context, id string) (events.APIGatewayProxyResponse, error) {
	log.Printf("[site] getByID: id=%s", id)
	s, err := h.svc.GetByID(ctx, id)
	if err != nil {
		log.Printf("[site] getByID: error: %v", err)
		return response.Error(http.StatusInternalServerError, err.Error()), nil
	}
	if s == nil {
		log.Printf("[site] getByID: not found id=%s", id)
		return response.Error(http.StatusNotFound, "site not found"), nil
	}
	return response.JSON(http.StatusOK, s), nil
}

func (h *Handler) list(ctx context.Context) (events.APIGatewayProxyResponse, error) {
	log.Printf("[site] list: fetching all sites")
	sites, err := h.svc.List(ctx)
	if err != nil {
		log.Printf("[site] list: error: %v", err)
		return response.Error(http.StatusInternalServerError, err.Error()), nil
	}
	if sites == nil {
		sites = []*Site{}
	}
	log.Printf("[site] list: returned %d sites", len(sites))
	return response.JSON(http.StatusOK, sites), nil
}

func (h *Handler) delete(ctx context.Context, id string) (events.APIGatewayProxyResponse, error) {
	log.Printf("[site] delete: id=%s", id)
	if err := h.svc.Delete(ctx, id); err != nil {
		log.Printf("[site] delete: error: %v", err)
		return response.Error(http.StatusInternalServerError, err.Error()), nil
	}
	log.Printf("[site] delete: success id=%s", id)
	return response.JSON(http.StatusNoContent, nil), nil
}
