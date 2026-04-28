package attendance

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
	case req.HTTPMethod == http.MethodPost && req.Resource == "/attendance/sign-in":
		return h.signIn(ctx, req.Body)
	case req.HTTPMethod == http.MethodPost && req.Resource == "/attendance/sign-out":
		return h.signOut(ctx, req.Body)
	case req.HTTPMethod == http.MethodGet && req.PathParameters["id"] != "":
		return h.getByID(ctx, req.PathParameters["id"])
	default:
		return response.Error(http.StatusMethodNotAllowed, "method not allowed"), nil
	}
}

func (h *Handler) signIn(ctx context.Context, body string) (events.APIGatewayProxyResponse, error) {
	var req SignInRequest
	if err := json.Unmarshal([]byte(body), &req); err != nil {
		return response.Error(http.StatusBadRequest, "invalid request body"), nil
	}
	log, err := h.svc.SignIn(ctx, req)
	if err != nil {
		return response.Error(http.StatusBadRequest, err.Error()), nil
	}
	return response.JSON(http.StatusCreated, log), nil
}

func (h *Handler) signOut(ctx context.Context, body string) (events.APIGatewayProxyResponse, error) {
	var req SignOutRequest
	if err := json.Unmarshal([]byte(body), &req); err != nil {
		return response.Error(http.StatusBadRequest, "invalid request body"), nil
	}
	log, err := h.svc.SignOut(ctx, req)
	if err != nil {
		return response.Error(http.StatusBadRequest, err.Error()), nil
	}
	return response.JSON(http.StatusOK, log), nil
}

func (h *Handler) getByID(ctx context.Context, id string) (events.APIGatewayProxyResponse, error) {
	log, err := h.svc.GetByID(ctx, id)
	if err != nil {
		return response.Error(http.StatusInternalServerError, err.Error()), nil
	}
	if log == nil {
		return response.Error(http.StatusNotFound, "attendance record not found"), nil
	}
	return response.JSON(http.StatusOK, log), nil
}
