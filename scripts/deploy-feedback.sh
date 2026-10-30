#!/bin/sh
# Install / update the feedback form backend on the simakoov.ru server.
# Usage: npm run deploy:feedback   (needs ssh access to $DEPLOY_HOST)
# First run creates /etc/simakoov-feedback.env from the example — fill in the secrets there, then run again.
set -eu

DEPLOY_HOST="${DEPLOY_HOST:-root@153.76.160.216}"
VHOST=/etc/nginx/sites-available/simakoov.ru

COPYFILE_DISABLE=1 tar --no-xattrs -C server/feedback -czf - . | ssh "$DEPLOY_HOST" "set -e
  mkdir -p /opt/simakoov-feedback
  tar -xzf - -C /opt/simakoov-feedback
  chmod 755 /opt/simakoov-feedback && chmod 644 /opt/simakoov-feedback/*

  if [ ! -f /etc/simakoov-feedback.env ]; then
    install -m 600 /opt/simakoov-feedback/feedback.env.example /etc/simakoov-feedback.env
    echo '>>> Created /etc/simakoov-feedback.env — fill in SMTP_PASSWORD (and Telegram), then run this script again.'
  fi

  install -m 644 /opt/simakoov-feedback/simakoov-feedback.service /etc/systemd/system/simakoov-feedback.service
  systemctl daemon-reload
  systemctl enable simakoov-feedback >/dev/null 2>&1
  systemctl restart simakoov-feedback

  install -m 644 /opt/simakoov-feedback/nginx-feedback.conf /etc/nginx/snippets/simakoov-feedback.conf
  if ! grep -q 'snippets/simakoov-feedback.conf' $VHOST; then
    cp $VHOST $VHOST.bak
    # Add the include right after the site root line (present in the served server block).
    sed -i 's|^\(\s*root /var/www/simakoov.ru;\)|\1\n    include snippets/simakoov-feedback.conf;|' $VHOST
  fi
  nginx -t && systemctl reload nginx

  sleep 1
  systemctl --no-pager --lines=5 status simakoov-feedback || true"

echo "Feedback backend deployed: https://simakoov.ru/api/feedback"
