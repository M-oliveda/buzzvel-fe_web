variable "project_id" {
  description = "GCP project that owns the service."
  type        = string
}

variable "region" {
  description = "Cloud Run region."
  type        = string
}

variable "name" {
  description = "Cloud Run service name."
  type        = string
}

variable "service_account_email" {
  description = "Runtime service account the revisions run as."
  type        = string
}

variable "min_instances" {
  description = "Minimum instances (0 scales to zero)."
  type        = number
  default     = 0
}

variable "max_instances" {
  description = "Maximum instances (cost ceiling)."
  type        = number
  default     = 2
}

variable "max_concurrency" {
  description = "Maximum concurrent requests per instance."
  type        = number
  default     = 80
}

variable "deletion_protection" {
  description = "Prevents Terraform from destroying or replacing the service."
  type        = bool
  default     = true
}

variable "labels" {
  description = "Labels applied to the service."
  type        = map(string)
  default     = {}
}
