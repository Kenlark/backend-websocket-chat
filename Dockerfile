FROM node:22.12.0-slim AS base

WORKDIR /app

ENV NODE_ENV=production

# Étape de build
FROM base AS build

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

COPY package-lock.json package.json ./
RUN npm ci --include=dev

COPY . .

RUN npm run build

# Étape finale : image légère pour exécution
FROM base

COPY --from=build /app /app

EXPOSE 3000

CMD ["npm", "run", "start"]
