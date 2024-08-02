echo "PROTOCOL=${PROTOCOL}"

bash /app/www/${PROTOCOL}-setup.sh

# (cat /var/log/nginx/access.log | tee -a /opt/logs/access.log) &
# (cat /var/log/nginx/error.log | tee -a /opt/logs/error.log) &

nginx -g 'daemon off;'