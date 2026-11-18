# The version constraint lives in the root module (../../versions.tf).
terraform {
  required_providers {
    google = {
      source = "hashicorp/google"
    }
  }
}
