# Terraform bootstrap

> **Reference only.** This configuration was written to demonstrate Terraform and has never been
> applied. The projects are set up with [`scripts/gcp-setup.sh`](../../../scripts/gcp-setup.sh) (see
> the main README, "Cloud setup (gcloud)").

Run once per GCP project, by the owner, before the per-environment configuration in `..`. It enables
the three APIs the pipeline needs and creates the `<project>-tfstate` state bucket.

State stays **local** (it creates the remote bucket), one workspace per project. The state files
under `terraform.tfstate.d/` are git-ignored. Keep them, or re-import the bucket if they are lost.

```bash
cd infra/terraform/bootstrap
terraform init

# develop, staging, production: the bucket does not exist yet
for suffix in dev stg prod; do
  terraform workspace select -or-create "$suffix"
  terraform plan  -var="project_id=moliveda-gcloudprojects-$suffix" -out="$suffix.tfplan"
  terraform apply "$suffix.tfplan"
done

# preview: moliveda-gcloudprojects-prev-tfstate already exists (shared with other repositories),
# so only the APIs are declared here
terraform workspace select -or-create prev
terraform plan  -var="project_id=moliveda-gcloudprojects-prev" -var="create_state_bucket=false" \
  -out=prev.tfplan
terraform apply prev.tfplan
```

Every bucket gets versioning, uniform access, enforced public access prevention and
`prevent_destroy`. Disabling the APIs is never part of a destroy (`disable_on_destroy = false`).
