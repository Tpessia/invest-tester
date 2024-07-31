# curl -fsSL -A 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' http://localhost/ > output-bot.html

FROM node:20.12.2-bookworm

SHELL ["/bin/bash", "-c"]

ARG ENV=dev

WORKDIR /app

RUN apt-get update
RUN apt-get install -y chromium=126.0.6478.182-1~deb12u1
RUN apt-get install -y gettext-base moreutils

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

COPY ./www/ssr-proxy-js.config.json .
RUN export TARGET_URL=$([ "$ENV" == "dev" ] && echo "http://invest-tester" || echo "https://www.investtester.com") && \
  envsubst < ./ssr-proxy-js.config.json | sponge ./ssr-proxy-js.config.json
RUN cat ./ssr-proxy-js.config.json

RUN npm install -g ssr-proxy-js@1.1.3

RUN rm -rf /var/lib/apt/lists/*

EXPOSE 8080

CMD npx ssr-proxy-js@1.1.3 -c ./ssr-proxy-js.config.json
