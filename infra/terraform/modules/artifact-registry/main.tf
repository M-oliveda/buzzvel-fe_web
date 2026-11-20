# Docker repository for the app and gate images (MASTERPLAN §9, "Build and push").
# Cleanup policies keep storage bounded: KEEP rules win over DELETE rules, so the most recent
# images always survive, which keeps a rollback target available.

resource "google_artifact_registry_repository" "this" {
  project       = var.project_id
  location      = var.region
  repository_id = var.repository_id
  description   = "Buzzvel FE container images (app and gate)"
  format        = "DOCKER"
  labels        = var.labels

  cleanup_policy_dry_run = false

  cleanup_policies {
    id     = "keep-most-recent"
    action = "KEEP"
    most_recent_versions {
      keep_count = var.keep_count
    }
  }

  cleanup_policies {
    id     = "delete-untagged"
    action = "DELETE"
    condition {
      tag_state  = "UNTAGGED"
      older_than = "7d"
    }
  }

  # Preview images (`pr-<n>-<sha>`) outlive their service only briefly.
  cleanup_policies {
    id     = "delete-previews"
    action = "DELETE"
    condition {
      tag_state    = "TAGGED"
      tag_prefixes = ["pr-"]
      older_than   = "7d"
    }
  }

  cleanup_policies {
    id     = "delete-old"
    action = "DELETE"
    condition {
      tag_state  = "ANY"
      older_than = "30d"
    }
  }
}
