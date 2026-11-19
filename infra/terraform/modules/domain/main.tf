# Custom domain for the production service (MASTERPLAN §12 Phase 6).
#
# Cloud Run domain mapping is available in us-central1, so no load balancer is needed. It is a
# Preview feature (README Known gaps). The identity that applies this must be a verified owner of
# the base domain in Search Console (`gcloud domains verify moliveda.dev`). The DNS zone is hosted
# outside Google Cloud, so the records in the `dns_records` output are added by hand at the
# registrar; Google then issues and renews the certificate.

resource "google_cloud_run_domain_mapping" "this" {
  project  = var.project_id
  location = var.region
  name     = var.domain_name

  metadata {
    namespace = var.project_id
    labels    = var.labels
  }

  spec {
    route_name = var.service_name
  }
}
