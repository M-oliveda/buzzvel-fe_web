output "dns_records" {
  description = "Records to create at the DNS provider (empty until Cloud Run has processed the mapping)."
  value = [
    for record in try(google_cloud_run_domain_mapping.this.status[0].resource_records, []) : {
      name   = record.name
      type   = record.type
      rrdata = record.rrdata
    }
  ]
}
