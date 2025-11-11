# ---------- Etapa 1: Build React ----------
FROM node:20-alpine AS build

ARG REACT_APP_API_URL=http://18.231.243.156:8080
ENV REACT_APP_API_URL=$REACT_APP_API_URL

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ---------- Etapa 2: Nginx con HTTPS ----------
FROM nginx:stable-alpine

# Copiar build de React
COPY --from=build /app/build /usr/share/nginx/html

# Copiar certificados y config de nginx
COPY certs /etc/nginx/certs
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto HTTPS
EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]
