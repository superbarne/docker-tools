FROM node:12.6.0-alpine as builder
WORKDIR /app
COPY package.json package-lock.json main.js jobTemplate.yaml ./
RUN npm ci
FROM docker.pkg.github.com/superbarne/docker-tools/node:ca42229
COPY --from=builder /app /
ENTRYPOINT ["node", "/main.js"]