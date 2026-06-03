#!/usr/bin/env bash
# Adds localhost HTTP referrers to the Firebase browser API key (project safe-a67e3).
# Requires: gcloud CLI logged in with permission to edit API keys.
set -euo pipefail

PROJECT_ID="safe-a67e3"
API_KEY_STRING="AIzaSyD8TcLRnV2ehh_ThVlc88crscgc9_9HfKs"
REFERRERS=(
  "http://localhost:8080/*"
  "http://127.0.0.1:8080/*"
  "http://localhost/*"
  "http://127.0.0.1/*"
)

echo "Project: $PROJECT_ID"
echo "Looking for API key $API_KEY_STRING ..."

KEY_RESOURCE=""
while IFS= read -r line; do
  name="${line%%	*}"
  key="${line##*	}"
  if [[ "$key" == "$API_KEY_STRING" ]]; then
    KEY_RESOURCE="$name"
    break
  fi
done < <(gcloud services api-keys list --project="$PROJECT_ID" --format="value(name,keyString)" 2>/dev/null || true)

if [[ -z "$KEY_RESOURCE" ]]; then
  echo "Could not find API key via gcloud. Add referrers manually:"
  printf '  %s\n' "${REFERRERS[@]}"
  echo "https://console.cloud.google.com/apis/credentials?project=$PROJECT_ID"
  exit 1
fi

REFERRER_CSV=$(IFS=,; echo "${REFERRERS[*]}")

echo "Updating $KEY_RESOURCE"
gcloud services api-keys update "$KEY_RESOURCE" \
  --project="$PROJECT_ID" \
  --allowed-referrers="$REFERRER_CSV"

echo "Done. Wait 2 minutes, then hard-refresh http://localhost:8080/index.html"
