terraform {
  required_version = ">= 1.6"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Uncomment and configure for remote state (recommended for teams):
  # backend "s3" {
  #   bucket = "dimeo-tf-state"
  #   key    = "work-assistance/terraform.tfstate"
  #   region = var.aws_region
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "dimeo-work-assistance"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}
