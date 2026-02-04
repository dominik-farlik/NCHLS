FROM node:20-alpine AS build
WORKDIR /app

COPY React/package*.json ./
RUN npm ci

COPY React/ ./
RUN npm run build

FROM nginx:alpine
COPY nginx/nginx.conf /etc/nginx/nginx.conf

COPY --from=build /app/dist /usr/share/nginx/html
