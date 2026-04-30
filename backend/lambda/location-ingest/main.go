package locationingest

import (
	"context"
	"log"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"

	"dimeo/work-assistance/internal/location"
	"dimeo/work-assistance/pkg/database"
)

var handler *location.Handler

func init() {
	db, err := database.NewPostgresDB()
	if err != nil {
		log.Fatalf("connecting to database: %v", err)
	}
	repo := location.NewRepository(db)
	svc := location.NewService(repo)
	handler = location.NewHandler(svc)
}

func handle(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	return handler.Route(ctx, req)
}

func main() {
	lambda.Start(handle)
}
