output "repository_url" {
  description = "Image path prefix for docker push."
  value       = module.artifact_registry.repository_url
}

output "runtime_service_account" {
  description = "Service account the Cloud Run revisions run as (passed to gcloud run deploy)."
  value       = module.runtime_sa.email
}

output "service_name" {
  description = "Cloud Run service name, or null for preview."
  value       = one(module.cloud_run_service[*].name)
}

output "service_uri" {
  description = "Default run.app URL, or null for preview."
  value       = one(module.cloud_run_service[*].uri)
}
