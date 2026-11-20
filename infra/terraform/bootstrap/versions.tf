# Bootstrap keeps local state on purpose: it creates the bucket that holds every other state.
# Run it once per project with a separate workspace (see README.md in this folder).
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
