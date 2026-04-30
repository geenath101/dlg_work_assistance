// cmd/server/main.go
//
// Local development HTTP server.
//
// It wraps every Lambda handler behind a standard net/http mux, translating
// between net/http requests and events.APIGatewayProxyRequest so you can hit
// the same business logic with curl/Postman without deploying to AWS.
//
// Start with:
//
//	make local          # boots postgres, runs migrations, starts this server
//	make run/server     # server only (postgres must already be up)
//
// Default listen address: http://localhost:8080
// Override with PORT env var.

package main

import (
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/aws/aws-lambda-go/events"

	"dimeo/work-assistance/internal/attendance"
	"dimeo/work-assistance/internal/employee"
	"dimeo/work-assistance/internal/location"
	"dimeo/work-assistance/internal/site"
	"dimeo/work-assistance/pkg/database"
)

// lambdaFunc matches the signature every Lambda handler exposes.
type lambdaFunc func(context.Context, events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error)

// adapt returns an http.HandlerFunc that converts the net/http request into an
// APIGatewayProxyRequest, calls h, then writes the response.
//
// resource is the API Gateway route pattern, e.g. "/employees/{id}".
// Path parameter names are extracted from the pattern and read via r.PathValue.
func adapt(resource string, h lambdaFunc) http.HandlerFunc {
	paramNames := routeParamNames(resource)

	return func(w http.ResponseWriter, r *http.Request) {
		body, _ := io.ReadAll(r.Body)

		pathParams := make(map[string]string, len(paramNames))
		for _, name := range paramNames {
			if v := r.PathValue(name); v != "" {
				pathParams[name] = v
			}
		}

		queryParams := make(map[string]string)
		for k, vals := range r.URL.Query() {
			if len(vals) > 0 {
				queryParams[k] = vals[0]
			}
		}

		req := events.APIGatewayProxyRequest{
			HTTPMethod:            r.Method,
			Resource:              resource,
			PathParameters:        pathParams,
			QueryStringParameters: queryParams,
			Body:                  string(body),
		}

		resp, err := h(r.Context(), req)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		for k, v := range resp.Headers {
			w.Header().Set(k, v)
		}
		if resp.StatusCode == 0 {
			resp.StatusCode = http.StatusOK
		}
		w.WriteHeader(resp.StatusCode)
		fmt.Fprint(w, resp.Body)
	}
}

// routeParamNames extracts {name} segments from a route pattern.
func routeParamNames(pattern string) []string {
	var names []string
	for _, seg := range strings.Split(pattern, "/") {
		if strings.HasPrefix(seg, "{") && strings.HasSuffix(seg, "}") {
			names = append(names, seg[1:len(seg)-1])
		}
	}
	return names
}

func main() {
	db, err := database.NewPostgresDB()
	if err != nil {
		log.Fatalf("connecting to database: %v", err)
	}
	defer db.Close()

	// ── Wire up handlers ─────────────────────────────────────────────────────
	siteH := site.NewHandler(site.NewService(site.NewRepository(db)))
	empH := employee.NewHandler(employee.NewService(employee.NewRepository(db)))
	attH := attendance.NewHandler(attendance.NewService(attendance.NewRepository(db)))
	locH := location.NewHandler(location.NewService(location.NewRepository(db)))

	mux := http.NewServeMux()

	// ── Sites ─────────────────────────────────────────────────────────────────
	// GET  /sites          → list all sites
	// POST /sites          → create site
	// GET  /sites/{id}     → get site by id
	// DELETE /sites/{id}   → delete site
	mux.HandleFunc("GET /sites", adapt("/sites", siteH.Route))
	mux.HandleFunc("POST /sites", adapt("/sites", siteH.Route))
	mux.HandleFunc("GET /sites/{id}", adapt("/sites/{id}", siteH.Route))
	mux.HandleFunc("DELETE /sites/{id}", adapt("/sites/{id}", siteH.Route))

	// ── Employees ─────────────────────────────────────────────────────────────
	// GET  /employees                  → list all employees
	// POST /employees                  → create employee
	// POST /employees/assign           → assign employee to site
	// GET  /employees/site/{siteId}    → employees assigned to a site
	// GET  /employees/{id}             → get employee by id
	//
	// Note: fixed segments (/assign, /site) beat wildcard {id} in Go 1.22+ mux.
	mux.HandleFunc("GET /employees", adapt("/employees", empH.Route))
	mux.HandleFunc("POST /employees", adapt("/employees", empH.Route))
	mux.HandleFunc("POST /employees/assign", adapt("/employees/assign", empH.Route))
	mux.HandleFunc("GET /employees/site/{siteId}", adapt("/employees/site/{siteId}", empH.Route))
	mux.HandleFunc("GET /employees/{id}", adapt("/employees/{id}", empH.Route))

	// ── Attendance ────────────────────────────────────────────────────────────
	// POST /attendance/sign-in   → sign in
	// POST /attendance/sign-out  → sign out
	// GET  /attendance/{id}      → get attendance record
	mux.HandleFunc("POST /attendance/sign-in", adapt("/attendance/sign-in", attH.Route))
	mux.HandleFunc("POST /attendance/sign-out", adapt("/attendance/sign-out", attH.Route))
	mux.HandleFunc("GET /attendance/{id}", adapt("/attendance/{id}", attH.Route))

	// ── Location ──────────────────────────────────────────────────────────────
	// POST /location                          → record a location point
	// GET  /location?attendance_id=<uuid>     → tracks for an attendance session
	// GET  /location?employee_id=<uuid>       → tracks for an employee
	mux.HandleFunc("POST /location", adapt("/location", locH.Route))
	mux.HandleFunc("GET /location", adapt("/location", locH.Route))

	port := getEnv("PORT", "8080")
	log.Printf("Local dev server listening on http://localhost:%s", port)
	log.Printf("Routes: /sites  /employees  /attendance  /location")

	if err := http.ListenAndServe(":"+port, mux); err != nil {
		log.Fatalf("server: %v", err)
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
