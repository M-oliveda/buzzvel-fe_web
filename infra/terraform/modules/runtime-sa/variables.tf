variable "project_id" {
  description = "GCP project that owns the service account."
  type        = string
}

variable "account_id" {
  description = "Service account id (the part before @)."
  type        = string
}
