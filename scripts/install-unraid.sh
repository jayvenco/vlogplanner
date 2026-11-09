#!/usr/bin/env bash
# Installeert of werkt VlogPlanner bij op Unraid, zodat de container in de
# Docker-tab verschijnt met icoon, WebUI-link en Edit / Check for Updates / Apply Update.
#
# Veilig om opnieuw te draaien: data in $APPDATA/{data,uploads,backups} blijft altijd staan,
# bestaande sleutels worden hergebruikt en nooit vervangen.
#
# Gebruik (op de Unraid-terminal):
#   curl -fsSL https://raw.githubusercontent.com/jayvenco/vlogplanner/main/scripts/install-unraid.sh | bash
#
# Optionele omgevingsvariabelen (zet ze achter de pipe, vóór `bash`):
#   PORT=7766                      host-poort (standaard: bestaande instelling of 7766)
#   APPDATA=/mnt/user/appdata/vlogplanner
#   IMAGE_TAG=latest               image-tag
#   GHCR_USER / GHCR_TOKEN         alleen nodig als het GHCR-package privé is
#   curl -fsSL ... | PORT=8080 bash

set -euo pipefail

NAME="vlogplanner"
IMAGE_REPO="ghcr.io/jayvenco/vlogplanner"
IMAGE_TAG="${IMAGE_TAG:-latest}"
IMAGE="${IMAGE:-$IMAGE_REPO:$IMAGE_TAG}"
APPDATA="${APPDATA:-/mnt/user/appdata/vlogplanner}"
CONTAINER_PORT=8000
RAW_BASE="https://raw.githubusercontent.com/jayvenco/vlogplanner/main/unraid"
TEMPLATE_URL="${TEMPLATE_URL:-$RAW_BASE/vlogplanner.xml}"
ICON_URL="${ICON_URL:-$RAW_BASE/icon.png}"
TEMPLATE_DIR="${TEMPLATE_DIR:-/boot/config/plugins/dockerMan/templates-user}"
SECRET_FILE="$APPDATA/secret_key"
LEGACY_ENV="$APPDATA/.env"

info() { echo "==> $*"; }
warn() { echo "Let op: $*" >&2; }
die() { echo "FOUT: $*" >&2; exit 1; }

command -v docker >/dev/null 2>&1 || die "docker niet gevonden. Draai dit script op je Unraid-server."

# Leest KEY=waarde uit een bestand zonder het te 'sourcen'. Leeg resultaat bij ontbrekende sleutel.
kv_get() { [ -f "$1" ] && { grep -m1 "^$2=" "$1" | cut -d= -f2- || true; } || true; }

# Leest een variabele uit de omgeving van een bestaande container (leeg als die er niet is).
container_env() {
  docker inspect -f '{{range .Config.Env}}{{println .}}{{end}}' "$NAME" 2>/dev/null \
    | { grep -m1 "^$1=" || true; } | cut -d= -f2- || true
}

container_exists() { docker ps -a --format '{{.Names}}' | grep -qx "$NAME"; }

random_secret() { head -c 32 /dev/urandom | base64 | tr -d '\n'; }

# --- Mappen ---------------------------------------------------------------
info "Mappen aanmaken in $APPDATA"
mkdir -p "$APPDATA/data" "$APPDATA/uploads" "$APPDATA/backups"
# De container draait als root; 99:100 (nobody:users) houdt de share netjes toegankelijk via SMB.
chown -R 99:100 "$APPDATA/data" "$APPDATA/uploads" "$APPDATA/backups" 2>/dev/null \
  || warn "chown 99:100 mislukt (niet als root gedraaid?). Dit is niet fataal."
chmod 755 "$APPDATA"

# --- Instellingen en sleutels ---------------------------------------------
# Voorrang per instelling: omgevingsvariabele > secret_key/.env > bestaande container > standaard.
HAD_EXISTING_CONTAINER=0
container_exists && HAD_EXISTING_CONTAINER=1

setting() { # setting NAAM STANDAARD
  local key="$1" default="$2" val="${!1:-}"
  [ -z "$val" ] && val="$(kv_get "$LEGACY_ENV" "$key")"
  [ -z "$val" ] && [ "$HAD_EXISTING_CONTAINER" = 1 ] && val="$(container_env "$key")"
  printf '%s' "${val:-$default}"
}

PORT="${PORT:-}"
[ -z "$PORT" ] && PORT="$(kv_get "$LEGACY_ENV" FRONTEND_PORT)"
if [ -z "$PORT" ] && [ "$HAD_EXISTING_CONTAINER" = 1 ]; then
  PORT="$(docker inspect -f "{{with index .HostConfig.PortBindings \"$CONTAINER_PORT/tcp\"}}{{(index . 0).HostPort}}{{end}}" "$NAME" 2>/dev/null || true)"
fi
PORT="${PORT:-7766}"

if [ -f "$SECRET_FILE" ]; then
  info "Bestaande sleutels hergebruiken ($SECRET_FILE)"
  JWT_SECRET_KEY="$(kv_get "$SECRET_FILE" JWT_SECRET_KEY)"
  ENCRYPTION_KEY="$(kv_get "$SECRET_FILE" ENCRYPTION_KEY)"
  [ -n "$JWT_SECRET_KEY" ] || die "$SECRET_FILE bevat geen JWT_SECRET_KEY. Herstel of verwijder dat bestand zelf."
else
  JWT_SECRET_KEY="$(setting JWT_SECRET_KEY "")"
  if [ -f "$LEGACY_ENV" ] || { [ "$HAD_EXISTING_CONTAINER" = 1 ] && [ -n "$JWT_SECRET_KEY" ]; }; then
    # Bestaande installatie: ENCRYPTION_KEY precies overnemen (ook als die leeg is, anders
    # worden opgeslagen API-sleutels onleesbaar).
    info "Sleutels van de bestaande installatie overnemen"
    if [ -f "$LEGACY_ENV" ] && grep -q '^ENCRYPTION_KEY=' "$LEGACY_ENV"; then
      ENCRYPTION_KEY="$(kv_get "$LEGACY_ENV" ENCRYPTION_KEY)"
    else
      ENCRYPTION_KEY="$(setting ENCRYPTION_KEY "")"
    fi
    [ -n "$JWT_SECRET_KEY" ] || { JWT_SECRET_KEY="$(random_secret)"; warn "geen JWT-sleutel gevonden, nieuwe aangemaakt (bestaande logins vervallen)."; }
  else
    info "Nieuwe installatie: sleutels genereren"
    JWT_SECRET_KEY="${JWT_SECRET_KEY:-$(random_secret)}"
    ENCRYPTION_KEY="${ENCRYPTION_KEY:-$(random_secret)}"
  fi
  ( umask 077
    printf 'JWT_SECRET_KEY=%s\nENCRYPTION_KEY=%s\n' "$JWT_SECRET_KEY" "$ENCRYPTION_KEY" > "$SECRET_FILE" )
  chmod 600 "$SECRET_FILE"
fi

ACCESS_TOKEN_EXPIRE_MINUTES="$(setting ACCESS_TOKEN_EXPIRE_MINUTES 10080)"
YOUTUBE_CLIENT_ID="$(setting YOUTUBE_CLIENT_ID "")"
YOUTUBE_CLIENT_SECRET="$(setting YOUTUBE_CLIENT_SECRET "")"
YOUTUBE_REDIRECT_URI="$(setting YOUTUBE_REDIRECT_URI "")"
YOUTUBE_API_KEY="$(setting YOUTUBE_API_KEY "")"

# --- Image ophalen --------------------------------------------------------
if [ -n "${GHCR_USER:-}" ] && [ -n "${GHCR_TOKEN:-}" ]; then
  info "Inloggen bij ghcr.io als $GHCR_USER"
  printf '%s' "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USER" --password-stdin >/dev/null
fi

if [ "${SKIP_PULL:-0}" = 1 ]; then
  info "Image ophalen overgeslagen (SKIP_PULL=1), lokale image $IMAGE wordt gebruikt"
else
  info "Image ophalen: $IMAGE"
  docker pull "$IMAGE" || die "image ophalen mislukt. Is het GHCR-package privé? Gebruik dan GHCR_USER en GHCR_TOKEN."
fi

# --- Container (opnieuw) aanmaken -----------------------------------------
if container_exists; then
  info "Bestaande container stoppen en verwijderen (data blijft staan op de volumes)"
  docker stop "$NAME" >/dev/null
  docker rm "$NAME" >/dev/null
fi

info "Container starten"
docker run -d \
  --name "$NAME" \
  --restart unless-stopped \
  -p "$PORT:$CONTAINER_PORT" \
  -v "$APPDATA/data:/app/data" \
  -v "$APPDATA/uploads:/app/uploads" \
  -v "$APPDATA/backups:/app/backups" \
  -e JWT_SECRET_KEY="$JWT_SECRET_KEY" \
  -e ENCRYPTION_KEY="$ENCRYPTION_KEY" \
  -e ACCESS_TOKEN_EXPIRE_MINUTES="$ACCESS_TOKEN_EXPIRE_MINUTES" \
  -e YOUTUBE_CLIENT_ID="$YOUTUBE_CLIENT_ID" \
  -e YOUTUBE_CLIENT_SECRET="$YOUTUBE_CLIENT_SECRET" \
  -e YOUTUBE_REDIRECT_URI="$YOUTUBE_REDIRECT_URI" \
  -e YOUTUBE_API_KEY="$YOUTUBE_API_KEY" \
  --label "net.unraid.docker.managed=dockerman" \
  --label "net.unraid.docker.webui=http://[IP]:[PORT:$CONTAINER_PORT]/" \
  --label "net.unraid.docker.icon=$ICON_URL" \
  "$IMAGE" >/dev/null

# --- Unraid-template bewaren (voor Edit / Check for Updates / Apply Update) -
xml_escape() { printf '%s' "$1" | sed -e 's/&/\&amp;/g' -e 's/</\&lt;/g' -e 's/>/\&gt;/g'; }
sed_escape() { printf '%s' "$1" | sed -e 's/[\\&|]/\\&/g'; }

fill_config() { # fill_config BESTAND TARGET WAARDE
  local val
  val="$(sed_escape "$(xml_escape "$3")")"
  sed "s|\\(Target=\"$2\"[^>]*>\\)[^<]*\\(</Config>\\)|\\1$val\\2|" "$1" > "$1.tmp" && mv "$1.tmp" "$1"
}

if [ -d "$TEMPLATE_DIR" ]; then
  info "Unraid-template opslaan in $TEMPLATE_DIR"
  TEMPLATE_OUT="$TEMPLATE_DIR/my-$NAME.xml"
  TMP_TEMPLATE="$(mktemp)"
  if curl -fsSL "$TEMPLATE_URL" -o "$TMP_TEMPLATE"; then
    sed "s|<Repository>[^<]*</Repository>|<Repository>$(sed_escape "$IMAGE")</Repository>|" "$TMP_TEMPLATE" > "$TMP_TEMPLATE.new" && mv "$TMP_TEMPLATE.new" "$TMP_TEMPLATE"
    fill_config "$TMP_TEMPLATE" "$CONTAINER_PORT" "$PORT"
    fill_config "$TMP_TEMPLATE" "/app/data" "$APPDATA/data"
    fill_config "$TMP_TEMPLATE" "/app/uploads" "$APPDATA/uploads"
    fill_config "$TMP_TEMPLATE" "/app/backups" "$APPDATA/backups"
    fill_config "$TMP_TEMPLATE" "JWT_SECRET_KEY" "$JWT_SECRET_KEY"
    fill_config "$TMP_TEMPLATE" "ENCRYPTION_KEY" "$ENCRYPTION_KEY"
    fill_config "$TMP_TEMPLATE" "ACCESS_TOKEN_EXPIRE_MINUTES" "$ACCESS_TOKEN_EXPIRE_MINUTES"
    fill_config "$TMP_TEMPLATE" "YOUTUBE_CLIENT_ID" "$YOUTUBE_CLIENT_ID"
    fill_config "$TMP_TEMPLATE" "YOUTUBE_CLIENT_SECRET" "$YOUTUBE_CLIENT_SECRET"
    fill_config "$TMP_TEMPLATE" "YOUTUBE_REDIRECT_URI" "$YOUTUBE_REDIRECT_URI"
    fill_config "$TMP_TEMPLATE" "YOUTUBE_API_KEY" "$YOUTUBE_API_KEY"
    ( umask 077; cp "$TMP_TEMPLATE" "$TEMPLATE_OUT" )
    chmod 600 "$TEMPLATE_OUT"
  else
    warn "template downloaden mislukt ($TEMPLATE_URL). De container draait wel, maar Edit in de Docker-tab werkt pas na een nieuwe run."
  fi
  rm -f "$TMP_TEMPLATE" "$TMP_TEMPLATE.new"
else
  warn "$TEMPLATE_DIR bestaat niet (geen Unraid?). Template-stap overgeslagen."
fi

# --- Wachten op gezondheid ------------------------------------------------
info "Wachten tot de container gezond is"
STATUS="starting"
for _ in $(seq 1 60); do
  RUNNING="$(docker inspect -f '{{.State.Running}}' "$NAME" 2>/dev/null || echo false)"
  if [ "$RUNNING" != "true" ]; then
    docker logs --tail 20 "$NAME" >&2 || true
    die "de container draait niet meer. Zie de logs hierboven."
  fi
  STATUS="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$NAME")"
  case "$STATUS" in
    healthy) break ;;
    unhealthy) docker logs --tail 20 "$NAME" >&2 || true; die "de container is unhealthy. Zie de logs hierboven." ;;
    none) warn "deze image heeft geen healthcheck; alleen 'running' gecontroleerd."; break ;;
  esac
  sleep 2
done
[ "$STATUS" = "starting" ] && die "geen gezonde status binnen 2 minuten. Bekijk: docker logs $NAME"

IP="$(hostname -I 2>/dev/null | awk '{print $1}' || true)"
echo ""
echo "Klaar! VlogPlanner draait op http://${IP:-<unraid-ip>}:$PORT"
echo "Beheer via de Docker-tab: Edit, Check for Updates en Apply Update."
echo "Je data staat in $APPDATA/{data,uploads,backups}; sleutels in $SECRET_FILE (bewaar een kopie)."
