variable "project_id" {
  description = "GCP project that owns the repository."
  type        = string
}

variable "region" {
  description = "Artifact Registry location."
  type        = string
}

variable "repository_id" {
  description = "Repository name (ARTIFACT_REGISTRY_REPO in GitHub)."
  type        = string
}

variable "keep_count" {
  description = "Most recent versions per image that cleanup never deletes."
  type        = number
  default     = 10
}

variable "labels" {
  description = "Labels applied to the repository."
  type        = map(string)
  default     = {}
}
