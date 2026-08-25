#!/bin/sh
set -eu

# Sauvegarde les données persistantes de la VM et supprime les archives trop anciennes.
PROJECT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
BACKUP_DIR="$PROJECT_DIR/data/backups"
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}
STAMP=$(date +%Y%m%d_%H%M%S)
ARCHIVE="$BACKUP_DIR/observatoire_$STAMP.tar.gz"

mkdir -p "$BACKUP_DIR"

if [ ! -f "$PROJECT_DIR/data/source/benchmark_from_mapping_pdf.xlsx" ]; then
  echo "Source Excel introuvable." >&2
  exit 1
fi

tar -czf "$ARCHIVE" -C "$PROJECT_DIR" \
  data/source/benchmark_from_mapping_pdf.xlsx \
  data/contributions

find "$BACKUP_DIR" -maxdepth 1 -type f \
  -name 'observatoire_*.tar.gz' -mtime "+$RETENTION_DAYS" -delete

echo "Sauvegarde créée : $ARCHIVE"
