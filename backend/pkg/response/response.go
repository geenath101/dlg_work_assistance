package response

import (
	"encoding/json"

	"github.com/aws/aws-lambda-go/events"
)

// JSON serialises body as JSON and returns an API Gateway proxy response.
func JSON(statusCode int, body any) events.APIGatewayProxyResponse {
	data, _ := json.Marshal(body)
	return events.APIGatewayProxyResponse{
		StatusCode: statusCode,
		Headers:    map[string]string{"Content-Type": "application/json"},
		Body:       string(data),
	}
}

// Error returns a JSON error response with the given status code and message.
func Error(statusCode int, message string) events.APIGatewayProxyResponse {
	return JSON(statusCode, map[string]string{"error": message})
}
