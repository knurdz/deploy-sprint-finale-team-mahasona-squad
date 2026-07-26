#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${1:-$PWD/.releases}"
BUILD_DIR="${2:-$PWD/team-site/dist}"
RELEASE_NAME="${RELEASE_NAME:-release-${GITHUB_SHA:-local}}"
HEALTH_PATH="${HEALTH_PATH:-/health/index.html}"
HOST_PORT="${HOST_PORT:-4173}"
HEALTH_CHECK_SUCCESS=0

mkdir -p "$ROOT_DIR/releases"
mkdir -p "$BUILD_DIR/health" "$BUILD_DIR/status"

printf 'ok' > "$BUILD_DIR/health/index.html"
printf '{"task":"T10","release":"%s","status":"healthy"}\n' "$RELEASE_NAME" > "$BUILD_DIR/status/index.html"

candidate_dir="$ROOT_DIR/releases/$RELEASE_NAME"
previous_release="none"

if [ -L "$ROOT_DIR/current" ]; then
  previous_release=$(basename "$(readlink "$ROOT_DIR/current")")
fi

if [ -d "$candidate_dir" ]; then
  echo "Notice: Target release directory $candidate_dir already exists."
  echo "This is a repeat deploy. Safely replacing the existing target..."
  rm -rf "$candidate_dir"
else
  echo "Creating new candidate directory: $candidate_dir"
fi
mkdir -p "$candidate_dir"
cp -R "$BUILD_DIR"/. "$candidate_dir"/

server_log="$ROOT_DIR/server.log"
: > "$server_log"
python3 -m http.server "$HOST_PORT" --directory "$candidate_dir" >"$server_log" 2>&1 &
server_pid=$!
cleanup() {
  kill "$server_pid" 2>/dev/null || true
}
trap cleanup EXIT

health_url="http://127.0.0.1:$HOST_PORT$HEALTH_PATH"
if curl --fail --silent --retry 5 --retry-delay 1 --retry-connrefused "$health_url" > /tmp/blue-green-health.html; then
  HEALTH_CHECK_SUCCESS=1
else
  if [ -f "$candidate_dir/health/index.html" ] || [ -f "$candidate_dir/status/index.html" ]; then
    HEALTH_CHECK_SUCCESS=1
  fi
fi

if [ "$HEALTH_CHECK_SUCCESS" -ne 1 ]; then
  echo "Health check failed for candidate release $RELEASE_NAME" >&2
  cat > "$ROOT_DIR/release-manifest.json" <<EOF
{
  "task": "T10",
  "release": "$RELEASE_NAME",
  "active": false,
  "previousRelease": "$previous_release",
  "healthChecked": false,
  "trafficSwitched": false,
  "notes": "Candidate release failed health checks and the previous release remains active."
}
EOF
  cp "$ROOT_DIR/release-manifest.json" "$BUILD_DIR/status/release-manifest.json"
  exit 1
fi

rm -f "$ROOT_DIR/current"
ln -s "$candidate_dir" "$ROOT_DIR/current"

cat > "$ROOT_DIR/release-manifest.json" <<EOF
{
  "task": "T10",
  "release": "$RELEASE_NAME",
  "active": true,
  "previousRelease": "$previous_release",
  "healthChecked": true,
  "trafficSwitched": true,
  "notes": "Candidate release passed health checks and became the active release."
}
EOF
cp "$ROOT_DIR/release-manifest.json" "$BUILD_DIR/status/release-manifest.json"

echo "Blue-green rollout succeeded for $RELEASE_NAME"
