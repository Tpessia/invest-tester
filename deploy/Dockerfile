# Build

FROM node:20.12.2-bookworm AS build

ARG ENV=dev
ARG NODE_OPTIONS

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY *.* ./
COPY src ./src
COPY public ./public

RUN ls -la .

RUN npm run build

# Run

FROM nginx:1.27.0-bookworm AS run

ARG ENV=dev
ENV ENV=${ENV}
ARG PROTOCOL=http
ENV PROTOCOL=${PROTOCOL}

WORKDIR /app

RUN apt-get update
RUN apt-get install -y net-tools nano
RUN if [ "${PROTOCOL}" = "https" ]; then apt-get install -y certbot cron; fi
RUN rm -rf /var/lib/apt/lists/*

COPY --from=build /app/dist ./

COPY ./deploy/www/nginx.* /etc/nginx/
RUN cp "/etc/nginx/nginx.${PROTOCOL}.conf" /etc/nginx/nginx.conf

COPY ./deploy/www/*.sh ./www/
RUN ls -la ./www && touch "./www/${PROTOCOL}-setup.sh" && chmod +x "./www/${PROTOCOL}-setup.sh"

COPY ./deploy/www/robots.txt ./
COPY ./deploy/www/sitemap.xml ./

RUN ls -la .

# USER nginx

EXPOSE 80
EXPOSE 443

CMD echo "PROTOCOL=${PROTOCOL}" && /app/www/${PROTOCOL}-setup.sh && nginx -g 'daemon off;'
