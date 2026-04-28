# Shared Lambda environment variables (injected into every function)
locals {
  lambda_env = {
    DB_HOST     = aws_db_instance.postgres.address
    DB_PORT     = "5432"
    DB_USER     = var.db_username
    DB_PASSWORD = var.db_password
    DB_NAME     = var.db_name
    DB_SSLMODE  = "require"
  }

  lambda_vpc_config = {
    subnet_ids         = aws_subnet.private[*].id
    security_group_ids = [aws_security_group.lambda.id]
  }
}

# ── Site Lambda ──────────────────────────────────────────────────────────────

resource "aws_lambda_function" "site" {
  function_name = "dimeo-site-${var.environment}"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "bootstrap"
  runtime       = "provided.al2023"
  filename      = "${path.module}/../../dist/site.zip"
  memory_size   = var.lambda_memory_mb
  timeout       = var.lambda_timeout_sec

  environment {
    variables = local.lambda_env
  }

  vpc_config {
    subnet_ids         = local.lambda_vpc_config.subnet_ids
    security_group_ids = local.lambda_vpc_config.security_group_ids
  }
}

# ── Employee Lambda ──────────────────────────────────────────────────────────

resource "aws_lambda_function" "employee" {
  function_name = "dimeo-employee-${var.environment}"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "bootstrap"
  runtime       = "provided.al2023"
  filename      = "${path.module}/../../dist/employee.zip"
  memory_size   = var.lambda_memory_mb
  timeout       = var.lambda_timeout_sec

  environment {
    variables = local.lambda_env
  }

  vpc_config {
    subnet_ids         = local.lambda_vpc_config.subnet_ids
    security_group_ids = local.lambda_vpc_config.security_group_ids
  }
}

# ── Attendance Lambda ────────────────────────────────────────────────────────

resource "aws_lambda_function" "attendance" {
  function_name = "dimeo-attendance-${var.environment}"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "bootstrap"
  runtime       = "provided.al2023"
  filename      = "${path.module}/../../dist/attendance.zip"
  memory_size   = var.lambda_memory_mb
  timeout       = var.lambda_timeout_sec

  environment {
    variables = local.lambda_env
  }

  vpc_config {
    subnet_ids         = local.lambda_vpc_config.subnet_ids
    security_group_ids = local.lambda_vpc_config.security_group_ids
  }
}

# ── Location-ingest Lambda ───────────────────────────────────────────────────

resource "aws_lambda_function" "location_ingest" {
  function_name = "dimeo-location-ingest-${var.environment}"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "bootstrap"
  runtime       = "provided.al2023"
  filename      = "${path.module}/../../dist/location-ingest.zip"
  memory_size   = var.lambda_memory_mb
  timeout       = var.lambda_timeout_sec

  environment {
    variables = local.lambda_env
  }

  vpc_config {
    subnet_ids         = local.lambda_vpc_config.subnet_ids
    security_group_ids = local.lambda_vpc_config.security_group_ids
  }
}
