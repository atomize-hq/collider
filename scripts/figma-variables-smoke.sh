#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  FIGMA_TOKEN=... FIGMA_FILE_KEY=... ./scripts/figma-variables-smoke.sh [--cleanup]

Required environment variables:
  FIGMA_TOKEN     Personal access token or OAuth access token with:
                  - file_variables:read
                  - file_variables:write
  FIGMA_FILE_KEY  Figma file key or branch key for a throwaway design file

What this does:
  1. GET  /v1/files/:file_key/variables/local
  2. POST /v1/files/:file_key/variables
     - creates one throwaway variable collection
     - creates one throwaway FLOAT variable
     - sets one value on the collection's initial mode
  3. Optionally deletes the created collection and variable with --cleanup

Notes:
  - Run this against a throwaway design file with edit access.
  - The script never prints your token.
  - Requires: curl, jq
EOF
}

require_bin() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

require_env() {
  if [[ -z "${!1:-}" ]]; then
    echo "Missing required environment variable: $1" >&2
    exit 1
  fi
}

write_body() {
  local path="$1"
  cat >"$path"
}

api_request() {
  local method="$1"
  local endpoint="$2"
  local body_file="${3:-}"
  local response_file="$4"
  local status_file="$5"

  local curl_args=(
    --silent
    --show-error
    --location
    --request "$method"
    --header "X-Figma-Token: $FIGMA_TOKEN"
    --header "Content-Type: application/json"
    --output "$response_file"
    --write-out "%{http_code}"
  )

  if [[ -n "$body_file" ]]; then
    curl_args+=(--data "@$body_file")
  fi

  curl "${curl_args[@]}" "https://api.figma.com$endpoint" >"$status_file"
}

assert_http_ok() {
  local label="$1"
  local status
  status="$(<"$2")"
  local body_file="$3"

  if [[ "$status" =~ ^2 ]]; then
    return 0
  fi

  echo "$label failed with HTTP $status" >&2
  jq . "$body_file" >&2 || cat "$body_file" >&2
  exit 1
}

cleanup_created_objects() {
  local collection_id="$1"
  local variable_id="$2"
  local delete_body="$TMPDIR/figma-delete.json"
  local delete_response="$TMPDIR/figma-delete-response.json"
  local delete_status="$TMPDIR/figma-delete-status.txt"

  write_body "$delete_body" <<EOF
{
  "variables": [
    {
      "action": "DELETE",
      "id": "$variable_id"
    }
  ],
  "variableCollections": [
    {
      "action": "DELETE",
      "id": "$collection_id"
    }
  ]
}
EOF

  api_request "POST" "/v1/files/$FIGMA_FILE_KEY/variables" "$delete_body" "$delete_response" "$delete_status"
  assert_http_ok "Cleanup POST /variables" "$delete_status" "$delete_response"
  echo "Cleanup succeeded."
}

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  usage
  exit 0
fi

CLEANUP=false
if [[ "${1:-}" == "--cleanup" ]]; then
  CLEANUP=true
elif [[ $# -gt 0 ]]; then
  usage >&2
  exit 1
fi

require_bin curl
require_bin jq
require_env FIGMA_TOKEN
require_env FIGMA_FILE_KEY

TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT

timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
collection_temp_id="smoke_collection_$timestamp"
mode_temp_id="smoke_mode_$timestamp"
variable_temp_id="smoke_variable_$timestamp"
collection_name="Collider Smoke $timestamp"
variable_name="smoke/float/$timestamp"

get_response="$TMPDIR/figma-get-local.json"
get_status="$TMPDIR/figma-get-local-status.txt"

echo "==> GET local variables"
api_request "GET" "/v1/files/$FIGMA_FILE_KEY/variables/local" "" "$get_response" "$get_status"
assert_http_ok "GET /variables/local" "$get_status" "$get_response"

local_collection_count="$(jq '.meta.variableCollections | length' "$get_response")"
local_variable_count="$(jq '.meta.variables | length' "$get_response")"
echo "Read succeeded."
echo "Collections visible: $local_collection_count"
echo "Variables visible:   $local_variable_count"

post_body="$TMPDIR/figma-post-create.json"
post_response="$TMPDIR/figma-post-create-response.json"
post_status="$TMPDIR/figma-post-create-status.txt"

write_body "$post_body" <<EOF
{
  "variableCollections": [
    {
      "action": "CREATE",
      "id": "$collection_temp_id",
      "name": "$collection_name",
      "initialModeId": "$mode_temp_id"
    }
  ],
  "variables": [
    {
      "action": "CREATE",
      "id": "$variable_temp_id",
      "name": "$variable_name",
      "resolvedType": "FLOAT",
      "variableCollectionId": "$collection_temp_id"
    }
  ],
  "variableModeValues": [
    {
      "variableId": "$variable_temp_id",
      "modeId": "$mode_temp_id",
      "value": 42
    }
  ]
}
EOF

echo
echo "==> POST create throwaway collection + variable"
api_request "POST" "/v1/files/$FIGMA_FILE_KEY/variables" "$post_body" "$post_response" "$post_status"
assert_http_ok "POST /variables" "$post_status" "$post_response"

real_collection_id="$(jq -r --arg key "$collection_temp_id" '.meta.tempIdToRealId[$key]' "$post_response")"
real_mode_id="$(jq -r --arg key "$mode_temp_id" '.meta.tempIdToRealId[$key]' "$post_response")"
real_variable_id="$(jq -r --arg key "$variable_temp_id" '.meta.tempIdToRealId[$key]' "$post_response")"

echo "Write succeeded."
echo "Created collection: $real_collection_id"
echo "Created mode:       $real_mode_id"
echo "Created variable:   $real_variable_id"

echo
echo "==> Verify created variable is readable"
verify_response="$TMPDIR/figma-verify.json"
verify_status="$TMPDIR/figma-verify-status.txt"
api_request "GET" "/v1/files/$FIGMA_FILE_KEY/variables/local" "" "$verify_response" "$verify_status"
assert_http_ok "GET /variables/local (verify)" "$verify_status" "$verify_response"

verify_value="$(jq -r --arg id "$real_variable_id" '.meta.variables[$id].valuesByMode | to_entries[0].value' "$verify_response")"
verify_name="$(jq -r --arg id "$real_variable_id" '.meta.variables[$id].name' "$verify_response")"

if [[ "$verify_name" == "null" ]]; then
  echo "Verification failed: created variable was not found in GET /variables/local output." >&2
  exit 1
fi

echo "Verified variable:  $verify_name"
echo "Observed value:     $verify_value"

if [[ "$CLEANUP" == true ]]; then
  echo
  echo "==> Cleanup"
  cleanup_created_objects "$real_collection_id" "$real_variable_id"
else
  echo
  echo "Left created objects in place because --cleanup was not set."
  echo "Use a throwaway file, or rerun with --cleanup."
fi

echo
echo "Smoke test completed successfully."
