#!/bin/bash

# Detener contenedores
docker-compose down

# Limpiar caché de Docker
docker system prune -a --volumes -f

# Limpiar caché de node_modules
rm -rf frontend/node_modules/.cache
rm -rf backend/node_modules/.cache

# Reconstruir sin caché
docker-compose build --no-cache

# Levantar contenedores
docker-compose up --force-recreate


version: '3.8'

services:
  traefik:
    image: "traefik:v2.10"
    container_name: traefik
    command:
      - "--api.insecure=true"  # Habilita el dashboard sin autenticación (quítalo en producción)
      - "--providers.docker=true"  # Permite descubrir contenedores automáticamente
      - "--entrypoints.web.address=:80"  # Define el puerto 80 para HTTP
    ports:
      - "80:80"
      - "8080:8080"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock"  # Permite que Traefik controle Docker

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: productos-backend
    restart: unless-stopped
    env_file:
      - ./.env
    environment:
      - PORT=5000
      - NODE_ENV=development
      - CORS_ORIGIN=http://api.pruebalibre.xyz
      - FIREBASE_API_KEY=${FIREBASE_API_KEY}
      - FIREBASE_AUTH_DOMAIN=${FIREBASE_AUTH_DOMAIN}
      - FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}
      - FIREBASE_STORAGE_BUCKET=${FIREBASE_STORAGE_BUCKET}
      - FIREBASE_MESSAGING_SENDER_ID=${FIREBASE_MESSAGING_SENDER_ID}
      - FIREBASE_APP_ID=${FIREBASE_APP_ID}
    ports:
      - "5000:5000"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.backend.rule=Host(`api.pruebalibre.xyz`)"
      - "traefik.http.services.backend.loadbalancer.server.port=5000"
    develop:
      watch:
        - action: sync
          path: ./backend
          target: /app
          ignore:
            - node_modules/
        - action: rebuild
          path: package.json
    healthcheck:
      test: ["CMD", "curl", "-f", "http://api.pruebalibre.xyz:5000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    volumes:
      - ./backend:/app
      - /app/node_modules

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: productos-frontend
    restart: unless-stopped
    depends_on:
      - backend
    environment:
      - REACT_APP_API_URL=http://api.pruebalibre.xyz:5000/api
      - WATCHPACK_POLLING=true
      - CHOKIDAR_USEPOLLING=true
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=Host(`pruebalibre.xyz`)"
      - "traefik.http.services.frontend.loadbalancer.server.port=80"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    develop:
      watch:
        - action: sync
          path: ./frontend
          target: /app
          ignore:
            - node_modules/
        - action: rebuild
          path: package.json

networks:
  default:
    name: productos-network