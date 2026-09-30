FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
# - cache npm conservé entre deux builds : un build relancé ne retélécharge pas tout
# - délais et tentatives augmentés pour les connexions lentes (erreur EIDLETIMEOUT)
# - --ignore-scripts : évite l'erreur ETXTBSY du script d'installation d'esbuild
RUN --mount=type=cache,target=/root/.npm \
    npm config set fetch-retries 6 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm config set fetch-retry-maxtimeout 180000 \
 && npm config set fetch-timeout 600000 \
 && npm ci --ignore-scripts --no-audit --no-fund --prefer-offline
COPY . .
RUN npx ng build --configuration production

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
EXPOSE 80
