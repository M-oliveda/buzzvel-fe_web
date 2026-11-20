output "state_bucket" {
  description = "Bucket for the environment's remote state (pass it to terraform init -backend-config)."
  value       = "${var.project_id}-tfstate"
}
