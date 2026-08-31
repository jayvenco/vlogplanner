#!/usr/bin/env bash
# Updates VlogPlanner without touching your data.
#
# Your database, uploads, and backups live in ./data, ./uploads, ./backups
# as bind mounts on the host — they are never part of the Docker image and
# are left completely untouched by this script.
#
# Usage:
#   ./update.sh                              (run from the install directory)
#   ./update.sh /mnt/user/appdata/vlogplanner (or pass the path explicitly)

set -e

TARGET_DIR="${1:-$(pwd)}"

if [ ! -f "$TARGET_DIR/docker-compose.yml" ]; then
  echo "FOUT: geen docker-compose.yml gevonden in '$TARGET_DIR'."
  echo "Geef het juiste pad mee: ./update.sh /pad/naar/vlogplanner"
  exit 1
fi

cd "$TARGET_DIR"

echo "==> Data-mappen (worden nooit aangeraakt):"
for dir in data uploads backups; do
  if [ -d "$dir" ]; then
    echo "  - ./$dir bestaat"
  else
    echo "  - ./$dir bestaat nog niet (wordt bij eerste start automatisch aangemaakt)"
  fi
done

if [ -n "$(git status --porcelain)" ]; then
  echo ""
  echo "Let op: er staan niet-gecommitte lokale wijzigingen in deze map."
  echo "git pull kan hierdoor mislukken. Los dit op (bijv. git stash) als dat gebeurt."
fi

echo ""
echo "==> Nieuwste versie ophalen (git pull)"
git pull

echo ""
echo "==> Nieuwste image ophalen (docker compose pull)"
docker compose pull

echo ""
echo "==> Container herstarten (docker compose up -d)"
docker compose up -d

PORT="7766"
if [ -f .env ] && grep -q "^FRONTEND_PORT=" .env; then
  PORT=$(grep "^FRONTEND_PORT=" .env | cut -d '=' -f2)
fi

echo ""
echo "Update voltooid. Je data in ./data, ./uploads en ./backups is niet aangeraakt."
echo "Open de app op http://<dit-ip>:$PORT"
