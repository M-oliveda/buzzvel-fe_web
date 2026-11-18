# One-time setup per project (MASTERPLAN §12 Phase 2, "Bootstrap"): the remote state bucket and
# the APIs the delivery pipeline needs. Secret Manager and Cloud Build are not required.

locals {
  services = [
    "run.googleapis.com",
    "artifactregistry.googleapis.com",
    "iamcredentials.googleapis.com",
  ]
}

# The APIs are shared with the owner's other workloads, so destroying this config never turns them
# off.
resource "google_project_service" "this" {
  for_each = toset(local.services)

  project            = var.project_id
  service            = each.value
  disable_on_destroy = false
}

resource "google_storage_bucket" "tfstate" {
  count = var.create_state_bucket ? 1 : 0

  project                     = var.project_id
  name                        = "${var.project_id}-tfstate"
  location                    = var.region
  uniform_bucket_level_access = true
  public_access_prevention    = "enforced"

  versioning {
    enabled = true
  }

  # Keep a bounded history of old state versions.
  lifecycle_rule {
    condition {
      num_newer_versions = 20
      with_state         = "ARCHIVED"
    }
    action {
      type = "Delete"
    }
  }

  lifecycle {
    prevent_destroy = true
  }
}
