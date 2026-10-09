#!/bin/sh
# Build the site for the root domain and upload it to the simakoov.ru server.
# Usage: npm run deploy            (needs ssh access to $DEPLOY_HOST)
# The swap is atomic-ish: files go to a .new dir first, then replace the live one.
set -eu

DEPLOY_HOST="${DEPLOY_HOST:-root@153.76.160.216}"
DEPLOY_DIR="${DEPLOY_DIR:-/var/www/simakoov.ru}"

BASE_PATH=/ npm run build

# --no-xattrs / COPYFILE_DISABLE keep macOS metadata out of the archive (GNU tar warns about it).
COPYFILE_DISABLE=1 tar --no-xattrs -C dist -czf - . | ssh "$DEPLOY_HOST" "set -e
  rm -rf '$DEPLOY_DIR.new' && mkdir -p '$DEPLOY_DIR.new'
  tar -xzf - -C '$DEPLOY_DIR.new'
  if [ -d '$DEPLOY_DIR' ]; then mv '$DEPLOY_DIR' '$DEPLOY_DIR.prev'; fi
  mv '$DEPLOY_DIR.new' '$DEPLOY_DIR'
  rm -rf '$DEPLOY_DIR.prev'
  chown -R www-data:www-data '$DEPLOY_DIR'"

echo "Deployed to https://simakoov.ru"
