#!/usr/bin/env bash
# Fresh install of VlogPlanner on Unraid using plain `docker run`.
# Creates the required folders, sets permissions, generates a random JWT
# secret on first run, and starts the container.
#
# Run this ONCE for a brand-new install. To update an existing install
# afterwards, use update-docker-run.sh instead — it never touches your data.

set -e

APP_DIR="/mnt/user/appdata/vlogplanner"
CONTAINER_NAME="vlogplanner"
IMAGE="ghcr.io/jayvenco/vlogplanner:latest"

echo "==> Mappen aanmaken in $APP_DIR"
mkdir -p "$APP_DIR/data" "$APP_DIR/uploads" "$APP_DIR/backups"

echo "==> Rechten instellen"
chmod 755 "$APP_DIR"
# 777 op de data-mappen voorkomt UID/GID-mismatch-gedoe tussen de container
# (die als root draait) en de Unraid-host — prima voor een app op je eigen LAN.
chmod -R 777 "$APP_DIR/data" "$APP_DIR/uploads" "$APP_DIR/backups"

if [ ! -f "$APP_DIR/.env" ]; then
  echo "==> .env aanmaken met een willekeurig gegenereerde JWT-sleutel"
  RANDOM_SECRET=$(head -c 32 /dev/urandom | base64 | tr -d '\n')
  cat > "$APP_DIR/.env" <<EOF
JWT_SECRET_KEY=$RANDOM_SECRET
ACCESS_TOKEN_EXPIRE_MINUTES=10080
FRONTEND_PORT=7766
YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=
YOUTUBE_REDIRECT_URI=
YOUTUBE_API_KEY=
EOF
  chmod 600 "$APP_DIR/.env"
else
  echo "==> Bestaande .env gevonden in $APP_DIR, wordt niet overschreven"
fi

set -a
source "$APP_DIR/.env"
set +a

JWT_SECRET_KEY="${JWT_SECRET_KEY:-please-change-this-secret-in-your-env-file}"
ACCESS_TOKEN_EXPIRE_MINUTES="${ACCESS_TOKEN_EXPIRE_MINUTES:-10080}"
FRONTEND_PORT="${FRONTEND_PORT:-7766}"
YOUTUBE_CLIENT_ID="${YOUTUBE_CLIENT_ID:-}"
YOUTUBE_CLIENT_SECRET="${YOUTUBE_CLIENT_SECRET:-}"
YOUTUBE_REDIRECT_URI="${YOUTUBE_REDIRECT_URI:-}"
YOUTUBE_API_KEY="${YOUTUBE_API_KEY:-}"

echo "==> Image ophalen"
docker pull "$IMAGE"

if docker ps -a --format '{{.Names}}' | grep -qx "$CONTAINER_NAME"; then
  echo ""
  echo "Er bestaat al een container met de naam '$CONTAINER_NAME'."
  read -r -p "Verwijderen en opnieuw aanmaken? Je data blijft sowieso staan. [y/N] " confirm
  if [[ "$confirm" =~ ^[Yy]$ ]]; then
    docker stop "$CONTAINER_NAME" >/dev/null
    docker rm "$CONTAINER_NAME" >/dev/null
  else
    echo "Gestopt zonder wijzigingen. Gebruik update-docker-run.sh om een bestaande installatie bij te werken."
    exit 1
  fi
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
echo "Installatie voltooid!"
echo "Open de app op http://<dit-ip>:${FRONTEND_PORT} en registreer een account."
echo "Instellingen (JWT-sleutel, poort, YouTube-vars) staan in $APP_DIR/.env"
