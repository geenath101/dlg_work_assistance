output "api_base_url" {
  description = "Base URL of the HTTP API Gateway."
  value       = aws_apigatewayv2_stage.default.invoke_url
}

output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint (hostname only)."
  value       = aws_db_instance.postgres.address
  sensitive   = true
}

output "vpc_id" {
  description = "VPC ID."
  value       = aws_vpc.main.id
}
