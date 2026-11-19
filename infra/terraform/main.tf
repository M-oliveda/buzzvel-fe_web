# Reference only: written to demonstrate Terraform and never applied. The environments are set up
# with scripts/gcp-setup.sh and deployed with gcloud from GitHub Actions (README "Terraform").
#
# Persistent infrastructure for one environment (MASTERPLAN §6.2, §12 Phase 2). The Workload
# Identity pool, provider and deployer service accounts are shared with other repositories and
# are not managed here.

locals {
  labels = {
    app        = "buzzvel-fe"
    env        = var.env
    managed-by = "terraform"
  }
}

module "artifact_registry" {
  source = "./modules/artifact-registry"

  project_id    = var.project_id
  region        = var.region
  repository_id = var.repository_id
  labels        = local.labels
}

module "runtime_sa" {
  source = "./modules/runtime-sa"

  project_id = var.project_id
  account_id = var.runtime_sa_id
}

module "cloud_run_service" {
  source = "./modules/cloud-run-service"
  count  = var.create_service ? 1 : 0

  project_id            = var.project_id
  region                = var.region
  name                  = var.service_name
  service_account_email = module.runtime_sa.email
  # Gated environments receive traffic through the NGINX gate; production through the app itself.
  ingress_container   = var.env == "production" ? "app" : "gate"
  min_instances       = var.min_instances
  max_instances       = var.max_instances
  deletion_protection = var.deletion_protection
  labels              = local.labels
}

module "domain" {
  source = "./modules/domain"
  count  = var.create_service && var.domain_name != null ? 1 : 0

  project_id   = var.project_id
  region       = var.region
  domain_name  = var.domain_name
  service_name = module.cloud_run_service[0].name
  labels       = local.labels
}
