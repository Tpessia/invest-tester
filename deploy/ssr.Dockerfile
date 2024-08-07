# curl -fsSL -A 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' http://localhost/ > output-bot.html
# curl -fsSL -A 'bingbot/2.0' https://investtester.com/ > output-bot.html
# Chrome DevTools -> Network conditions -> User agent -> bingbot/2.0 / Console -> Ctrl + Shift + P -> Disable JavaScript

FROM node:20.12.2-bookworm

SHELL ["/bin/bash", "-c"]

ARG ENV=dev
ENV ENV=${ENV}
ARG NODE_OPTIONS
ENV NODE_OPTIONS=${NODE_OPTIONS}

WORKDIR /app

RUN apt-get update
# RUN apt search ^chromium$ && exit 1
RUN apt-get install -y chromium
RUN apt-get install -y gettext-base moreutils
RUN rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

COPY ./www/ssr-proxy.package.json ./package.json
COPY ./www/ssr-proxy.js .

RUN npm install

EXPOSE 8080

CMD ["npm","start"]
