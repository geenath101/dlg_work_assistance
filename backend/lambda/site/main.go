package site
package main

import (
	"context"
	"log"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"

	"dimeo/work-assistance/internal/site"
	"dimeo/work-assistance/pkg/database"
)

var handler *site.Handler

func init() {
	db, err := database.NewPostgresDB()
	if err != nil {
		log.Fatalf("connecting to database: %v", err)
	}
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
