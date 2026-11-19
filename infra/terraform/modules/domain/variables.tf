variable "project_id" {
  description = "GCP project that owns the service."
  type        = string
}

variable "region" {
  description = "Region of the Cloud Run service."
  type        = string
}

variable "domain_name" {
  description = "Fully qualified domain to map, e.g. buzzvel-fe.moliveda.dev."
  type        = string
}

variable "service_name" {
  description = "Cloud Run service the domain points to."
  type        = string
}

variable "labels" {
  description = "Labels applied to the mapping."
  type        = map(string)
  default     = {}
}
