FROM node:alpine3.22 AS builder
WORKDIR /usr/src/app
COPY package*.json .
RUN npm ci
COPY . .
RUN npm run build

FROM node:alpine3.22
WORKDIR /usr/src/app
COPY package*.json .
RUN npm ci --omit=dev
COPY --from=builder /usr/src/app/build ./build
CMD ["npm", "run", "start"]
