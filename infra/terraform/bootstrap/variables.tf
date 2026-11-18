variable "project_id" {
  description = "GCP project to bootstrap."
  type        = string
}

variable "region" {
  description = "Location of the state bucket."
  type        = string
  default     = "us-central1"
}

variable "create_state_bucket" {
  description = "False when the project already has a <project>-tfstate bucket owned elsewhere (prev)."
  type        = bool
  default     = true
}
