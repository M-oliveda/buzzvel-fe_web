output "repository_url" {
  description = "Image path prefix, e.g. us-central1-docker.pkg.dev/<project>/buzzvel-fe."
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.this.repository_id}"
}
