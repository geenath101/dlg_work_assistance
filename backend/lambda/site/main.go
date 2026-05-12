package main

import (
	"context"
	"log"

	"dimeo/work-assistance/internal/site"
	"dimeo/work-assistance/pkg/database"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

var handler *site.Handler

func init() {
	db, err := database.NewPostgresDB()
	if err != nil {
		log.Fatalf("connecting to database: %v", err)
	}
	log.Print("Initialized the database ....")
	repo := site.NewRepository(db)
	svc := site.NewService(repo)
	handler = site.NewHandler(svc)
}

func handle(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	return handler.Route(ctx, req)
}

func main() {
	lambda.Start(handle)
}
