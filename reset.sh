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