package location

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
	case req.HTTPMethod == http.MethodPost:
		return h.record(ctx, req.Body)
	case req.HTTPMethod == http.MethodGet && req.QueryStringParameters["attendance_id"] != "":
		return h.queryByAttendance(ctx, req.QueryStringParameters["attendance_id"])
	case req.HTTPMethod == http.MethodGet && req.QueryStringParameters["employee_id"] != "":
		return h.queryByEmployee(ctx, req.QueryStringParameters["employee_id"])
	default:
		return response.Error(http.StatusBadRequest, "provide query param: attendance_id or employee_id"), nil
	}
}

func (h *Handler) record(ctx context.Context, body string) (events.APIGatewayProxyResponse, error) {
	var req RecordLocationRequest
	if err := json.Unmarshal([]byte(body), &req); err != nil {
		return response.Error(http.StatusBadRequest, "invalid request body"), nil
	}
	t, err := h.svc.Record(ctx, req)
	if err != nil {
		return response.Error(http.StatusInternalServerError, err.Error()), nil
	}
	return response.JSON(http.StatusCreated, t), nil
}

func (h *Handler) queryByAttendance(ctx context.Context, attendanceID string) (events.APIGatewayProxyResponse, error) {
	tracks, err := h.svc.QueryByAttendance(ctx, attendanceID)
	if err != nil {
		return response.Error(http.StatusInternalServerError, err.Error()), nil
	}
	if tracks == nil {
		tracks = []*LocationTrack{}
	}
	return response.JSON(http.StatusOK, tracks), nil
}

func (h *Handler) queryByEmployee(ctx context.Context, employeeID string) (events.APIGatewayProxyResponse, error) {
	tracks, err := h.svc.QueryByEmployee(ctx, employeeID)
	if err != nil {
		return response.Error(http.StatusInternalServerError, err.Error()), nil
	}
	if tracks == nil {
		tracks = []*LocationTrack{}
	}
	return response.JSON(http.StatusOK, tracks), nil
}
