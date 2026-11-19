# Long-lived Cloud Run service shell (develop, staging, production).
#
# Terraform owns the service itself: identity, ingress, scaling, concurrency and public access.
# The deploy workflows own what runs in it: images, the gate sidecar and every environment
# variable, including the basic-auth secrets. Ignoring the containers keeps image rollouts from
# showing up as drift and keeps secret values out of Terraform state (MASTERPLAN §9.3).

resource "google_cloud_run_v2_service" "this" {
  project             = var.project_id
  name                = var.name
  location            = var.region
  ingress             = "INGRESS_TRAFFIC_ALL"
  deletion_protection = var.deletion_protection
  labels              = var.labels

  template {
    service_account                  = var.service_account_email
    max_instance_request_concurrency = var.max_concurrency

    scaling {
      min_instance_count = var.min_instances
      max_instance_count = var.max_instances
    }

    # Placeholder until the first deploy replaces it with the app (and gate) images. It carries the
    # ingress container's name so `gcloud run deploy --container <name>` updates it in place instead
    # of adding a second container with a port.
    containers {
      name  = var.ingress_container
      image = "us-docker.pkg.dev/cloudrun/container/hello"
      ports {
        container_port = 8080
      }
    }
  }

  lifecycle {
    ignore_changes = [
      template[0].containers,
      template[0].labels,
      template[0].annotations,
      template[0].revision,
      client,
      client_version,
    ]
  }
}

# Public on purpose: protected environments are guarded by the NGINX gate, and production is the
# public site.
resource "google_cloud_run_v2_service_iam_member" "public" {
  project  = var.project_id
  location = google_cloud_run_v2_service.this.location
  name     = google_cloud_run_v2_service.this.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
