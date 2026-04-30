package attendance

import (
	"context"
	"log"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"

	"dimeo/work-assistance/internal/attendance"
	"dimeo/work-assistance/pkg/database"
)

var handler *attendance.Handler

func init() {
	db, err := database.NewPostgresDB()
	if err != nil {
		log.Fatalf("connecting to database: %v", err)
	}
	repo := attendance.NewRepository(db)
	svc := attendance.NewService(repo)
	handler = attendance.NewHandler(svc)
}

func handle(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	return handler.Route(ctx, req)
}

func main() {
	lambda.Start(handle)
}
