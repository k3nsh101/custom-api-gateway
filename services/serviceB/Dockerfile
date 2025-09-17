FROM node:alpine3.22

WORKDIR /usr/src/app

COPY package*.json .

RUN npm ci --omit=dev

COPY . .

EXPOSE 3002

CMD ["node", "server.js"]
