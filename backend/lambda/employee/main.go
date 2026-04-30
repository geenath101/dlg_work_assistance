package employee

import (
	"context"
	"log"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"

	"dimeo/work-assistance/internal/employee"
	"dimeo/work-assistance/pkg/database"
)

var handler *employee.Handler

func init() {
	db, err := database.NewPostgresDB()
	if err != nil {
		log.Fatalf("connecting to database: %v", err)
	}
	repo := employee.NewRepository(db)
	svc := employee.NewService(repo)
	handler = employee.NewHandler(svc)
}

func handle(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	return handler.Route(ctx, req)
}

func main() {
	lambda.Start(handle)
}
