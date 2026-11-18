# Partial configuration: one state per environment, each in its own project's bucket.
#   terraform init -reconfigure \
#     -backend-config="bucket=<project>-tfstate" -backend-config="prefix=buzzvel-fe/<env>"
terraform {
  backend "gcs" {}
}
