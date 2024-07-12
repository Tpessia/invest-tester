#!/bin/bash

if [ ! -d "/etc/letsencrypt/live/InvestTester.com" ]; then
    mkdir -p /var/www/certbot

    # TODO: change email
    certbot certonly --standalone \
        --cert-name InvestTester.com \
        --email test@example.com \
        --agree-tos --no-eff-email \
        --non-interactive --expand \
        -d InvestTester.com,www.InvestTester.com

    crontab -l | { cat; echo "0 0 * * * certbot renew --post-hook 'nginx -s reload'"; } | crontab -
fi
