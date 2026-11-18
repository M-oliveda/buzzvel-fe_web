terraform {
  required_version = ">= 1.17"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "8.10.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}
