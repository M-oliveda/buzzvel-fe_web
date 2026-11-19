#!/usr/bin/env bash
# One-time Google Cloud setup for one environment (MASTERPLAN §12 Phase 2, README "Cloud setup").
# Run by the owner with their own gcloud login, never by CI. Idempotent: every step checks
# before it creates, so re-running it is safe.
#
#   scripts/gcp-setup.sh <preview|develop|staging|production>
#
# Creates what the deploy workflows expect to exist: the APIs, the `buzzvel-fe` Artifact Registry
# repository (with cleanup policies) and the `buzzvel-fe-runtime` service account. Cloud Run
# services are created by their first `gcloud run deploy`. For production it also maps the custom
# domain, which needs the service, so re-run it after the first production deploy.
#
# The Workload Identity pool, provider and deployer service accounts are shared with other
# repositories and already exist (MASTERPLAN §6.2); this script does not touch them.

set -euo pipefail

REGION="${GCP_REGION:-us-central1}"
REPOSITORY="buzzvel-fe"
RUNTIME_SA_ID="buzzvel-fe-runtime"
DOMAIN="buzzvel-fe.moliveda.dev"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

usage() {
    echo "Usage: $0 <preview|develop|staging|production>" >&2
    exit 64
}

[ "$#" -eq 1 ] || usage
ENV="$1"
case "$ENV" in
    preview) suffix=prev ;;
    develop) suffix=dev ;;
    staging) suffix=stg ;;
    production) suffix=prod ;;
    *) usage ;;
esac
PROJECT_ID="moliveda-gcloudprojects-${suffix}"
LABELS="app=buzzvel-fe,env=${ENV},managed-by=gcloud"

echo "==> ${ENV}: project ${PROJECT_ID}, region ${REGION}"

echo "==> Enabling APIs"
gcloud services enable run.googleapis.com artifactregistry.googleapis.com \
    iamcredentials.googleapis.com --project "$PROJECT_ID"

echo "==> Artifact Registry repository ${REPOSITORY}"
if gcloud artifacts repositories describe "$REPOSITORY" --project "$PROJECT_ID" \
    --location "$REGION" > /dev/null 2>&1; then
    echo "Already exists."
else
    gcloud artifacts repositories create "$REPOSITORY" --project "$PROJECT_ID" \
        --location "$REGION" --repository-format docker \
        --description "Buzzvel FE container images (app and gate)" --labels "$LABELS"
fi
# Without --dry-run the policies delete for real. KEEP rules win over DELETE rules, so the most
# recent images always survive as rollback targets.
gcloud artifacts repositories set-cleanup-policies "$REPOSITORY" --project "$PROJECT_ID" \
    --location "$REGION" --policy "${SCRIPT_DIR}/gcp/cleanup-policies.json"

# No project roles: the app calls no Google APIs, and Cloud Run writes its logs on the platform's
# behalf. The deployer can act as it through its project-level roles/iam.serviceAccountUser.
echo "==> Runtime service account ${RUNTIME_SA_ID}"
if gcloud iam service-accounts describe "${RUNTIME_SA_ID}@${PROJECT_ID}.iam.gserviceaccount.com" \
    --project "$PROJECT_ID" > /dev/null 2>&1; then
    echo "Already exists."
else
    gcloud iam service-accounts create "$RUNTIME_SA_ID" --project "$PROJECT_ID" \
        --display-name "Buzzvel FE Cloud Run runtime" \
        --description "Runtime identity for the buzzvel-fe Cloud Run services. No project roles."
fi

# Cloud Run domain mapping is a beta feature available in us-central1. The account running this
# must be a verified owner of moliveda.dev (`gcloud domains verify moliveda.dev`).
if [ "$ENV" = "production" ]; then
    echo "==> Domain mapping ${DOMAIN}"
    if ! gcloud run services describe buzzvel-fe-prod --project "$PROJECT_ID" \
        --region "$REGION" > /dev/null 2>&1; then
        echo "buzzvel-fe-prod does not exist yet: re-run this script after the first production deploy."
    else
        if gcloud beta run domain-mappings describe --domain "$DOMAIN" --project "$PROJECT_ID" \
            --region "$REGION" > /dev/null 2>&1; then
            echo "Already exists."
        else
            gcloud beta run domain-mappings create --service buzzvel-fe-prod --domain "$DOMAIN" \
                --project "$PROJECT_ID" --region "$REGION"
        fi
        echo "DNS records to add at the registrar:"
        gcloud beta run domain-mappings describe --domain "$DOMAIN" --project "$PROJECT_ID" \
            --region "$REGION" --format 'yaml(status.resourceRecords)'
    fi
fi

echo "==> Done: ${ENV}"
