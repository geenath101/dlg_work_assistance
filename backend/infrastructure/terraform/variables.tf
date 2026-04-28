variable "aws_region" {
  description = "AWS region to deploy resources into."
  type        = string
  default     = "ap-southeast-1"
}

variable "environment" {
  description = "Deployment environment name (dev | staging | prod)."
  type        = string
  default     = "dev"
}

variable "db_name" {
  description = "PostgreSQL database name."
  type        = string
  default     = "dimeo"
}

variable "db_username" {
  description = "PostgreSQL master username."
  type        = string
  default     = "dimeo_admin"
}

variable "db_password" {
  description = "PostgreSQL master password. Store in a secrets manager; never commit."
  type        = string
  sensitive   = true
}

variable "db_instance_class" {
  description = "RDS instance class."
  type        = string
  default     = "db.t3.micro"
}

variable "lambda_memory_mb" {
  description = "Memory (MB) allocated to each Lambda function."
  type        = number
  default     = 128
}

variable "lambda_timeout_sec" {
  description = "Timeout (seconds) for each Lambda function."
  type        = number
  default     = 30
}
