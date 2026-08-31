#!/usr/bin/env bash
# Updates and (re)starts VlogPlanner on Unraid using plain `docker run`
# (no docker-compose). Safe to re-run any time to update — it pulls the
# latest image, replaces the container, and never touches your data.
#
# Data lives in /mnt/user/appdata/vlogplanner/{data,uploads,backups} as bind
# mounts on the host, completely separate from the container/image.

set -e

APP_DIR="/mnt/user/appdata/vlogplanner"
CONTAINER_NAME="vlogplanner"
IMAGE="ghcr.io/jayvenco/vlogplanner:latest"

# Load .env if present (same variables docker-compose.yml would use)
if [ -f "$APP_DIR/.env" ]; then
  set -a
  source "$APP_DIR/.env"
  set +a
fi

JWT_SECRET_KEY="${JWT_SECRET_KEY:-please-change-this-secret-in-your-env-file}"
ACCESS_TOKEN_EXPIRE_MINUTES="${ACCESS_TOKEN_EXPIRE_MINUTES:-10080}"
FRONTEND_PORT="${FRONTEND_PORT:-7766}"
YOUTUBE_CLIENT_ID="${YOUTUBE_CLIENT_ID:-}"
YOUTUBE_CLIENT_SECRET="${YOUTUBE_CLIENT_SECRET:-}"
YOUTUBE_REDIRECT_URI="${YOUTUBE_REDIRECT_URI:-}"
YOUTUBE_API_KEY="${YOUTUBE_API_KEY:-}"

mkdir -p "$APP_DIR/data" "$APP_DIR/uploads" "$APP_DIR/backups"

echo "==> Nieuwste image ophalen"
docker pull "$IMAGE"

if docker ps -a --format '{{.Names}}' | grep -qx "$CONTAINER_NAME"; then
  echo "==> Bestaande container stoppen en verwijderen (data blijft gewoon staan)"
  docker stop "$CONTAINER_NAME" >/dev/null
  docker rm "$CONTAINER_NAME" >/dev/null
fi

echo "==> Container starten"
docker run -d \
  --name "$CONTAINER_NAME" \
  --restart unless-stopped \
  -p "${FRONTEND_PORT}:8000" \
  -v "$APP_DIR/data:/app/data" \
  -v "$APP_DIR/uploads:/app/uploads" \
  -v "$APP_DIR/backups:/app/backups" \
  -e JWT_SECRET_KEY="$JWT_SECRET_KEY" \
  -e ACCESS_TOKEN_EXPIRE_MINUTES="$ACCESS_TOKEN_EXPIRE_MINUTES" \
  -e YOUTUBE_CLIENT_ID="$YOUTUBE_CLIENT_ID" \
  -e YOUTUBE_CLIENT_SECRET="$YOUTUBE_CLIENT_SECRET" \
  -e YOUTUBE_REDIRECT_URI="$YOUTUBE_REDIRECT_URI" \
  -e YOUTUBE_API_KEY="$YOUTUBE_API_KEY" \
  "$IMAGE"

echo ""
echo "Klaar. Je data in $APP_DIR/{data,uploads,backups} is niet aangeraakt."
echo "Open de app op http://<dit-ip>:${FRONTEND_PORT}"
