variable "project_id" {
  description = "GCP project of this environment (MASTERPLAN §6.2)."
  type        = string
}

variable "region" {
  description = "Region for every resource."
  type        = string
  default     = "us-central1"
}

variable "env" {
  description = "Environment name; matches the GitHub Environment and APP_ENV."
  type        = string

  validation {
    condition     = contains(["preview", "develop", "staging", "production"], var.env)
    error_message = "env must be one of preview, develop, staging, production."
  }
}

variable "repository_id" {
  description = "Artifact Registry repository (ARTIFACT_REGISTRY_REPO)."
  type        = string
  default     = "buzzvel-fe"
}

variable "runtime_sa_id" {
  description = "Runtime service account id."
  type        = string
  default     = "buzzvel-fe-runtime"
}

variable "create_service" {
  description = "Whether Terraform owns a long-lived Cloud Run service. False for preview, whose services the PR workflows create and delete."
  type        = bool
  default     = true
}

variable "service_name" {
  description = "Cloud Run service name (ignored when create_service is false)."
  type        = string
  default     = null

  validation {
    condition     = !var.create_service || var.service_name != null
    error_message = "service_name is required when create_service is true."
  }
}

variable "min_instances" {
  description = "Minimum Cloud Run instances."
  type        = number
  default     = 0
}

variable "max_instances" {
  description = "Maximum Cloud Run instances."
  type        = number
  default     = 2
}

variable "deletion_protection" {
  description = "Prevents Terraform from destroying the Cloud Run service."
  type        = bool
  default     = true
}
