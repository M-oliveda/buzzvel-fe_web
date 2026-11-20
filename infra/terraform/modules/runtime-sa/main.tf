# Identity the Cloud Run revisions run as. It gets no project roles: the app calls no Google APIs,
# and Cloud Run writes request and container logs on the platform's behalf. The deployer can act as
# it through its existing project-level roles/iam.serviceAccountUser (MASTERPLAN §6.2).

resource "google_service_account" "this" {
  project      = var.project_id
  account_id   = var.account_id
  display_name = "Buzzvel FE Cloud Run runtime"
  description  = "Runtime identity for the buzzvel-fe Cloud Run services. No project roles."
}
