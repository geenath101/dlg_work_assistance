resource "aws_apigatewayv2_api" "main" {
  name          = "dimeo-api-${var.environment}"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers = ["Content-Type", "Authorization"]
    max_age       = 300
  }
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = "$default"
  auto_deploy = true
}

# ── Lambda integrations ───────────────────────────────────────────────────────

resource "aws_apigatewayv2_integration" "site" {
  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.site.invoke_arn
  payload_format_version = "1.0"
}

resource "aws_apigatewayv2_integration" "employee" {
  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.employee.invoke_arn
  payload_format_version = "1.0"
}

resource "aws_apigatewayv2_integration" "attendance" {
  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.attendance.invoke_arn
  payload_format_version = "1.0"
}

resource "aws_apigatewayv2_integration" "location_ingest" {
  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.location_ingest.invoke_arn
  payload_format_version = "1.0"
}

# ── Routes ────────────────────────────────────────────────────────────────────

locals {
  site_routes = {
    "GET /sites"         = aws_apigatewayv2_integration.site.id
    "GET /sites/{id}"    = aws_apigatewayv2_integration.site.id
    "POST /sites"        = aws_apigatewayv2_integration.site.id
    "DELETE /sites/{id}" = aws_apigatewayv2_integration.site.id
  }

  employee_routes = {
    "GET /employees"                     = aws_apigatewayv2_integration.employee.id
    "GET /employees/{id}"                = aws_apigatewayv2_integration.employee.id
    "POST /employees"                    = aws_apigatewayv2_integration.employee.id
    "POST /employees/assign"             = aws_apigatewayv2_integration.employee.id
    "GET /employees/site/{siteId}"       = aws_apigatewayv2_integration.employee.id
  }

  attendance_routes = {
    "POST /attendance/sign-in"   = aws_apigatewayv2_integration.attendance.id
    "POST /attendance/sign-out"  = aws_apigatewayv2_integration.attendance.id
    "GET /attendance/{id}"       = aws_apigatewayv2_integration.attendance.id
  }

  location_routes = {
    "POST /locations" = aws_apigatewayv2_integration.location_ingest.id
    "GET /locations"  = aws_apigatewayv2_integration.location_ingest.id
  }

  all_routes = merge(
    local.site_routes,
    local.employee_routes,
    local.attendance_routes,
    local.location_routes,
  )
}

resource "aws_apigatewayv2_route" "routes" {
  for_each  = local.all_routes
  api_id    = aws_apigatewayv2_api.main.id
  route_key = each.key
  target    = "integrations/${each.value}"
}

# ── Lambda permissions ────────────────────────────────────────────────────────

resource "aws_lambda_permission" "site" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.site.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "employee" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.employee.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "attendance" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.attendance.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "location_ingest" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.location_ingest.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}
