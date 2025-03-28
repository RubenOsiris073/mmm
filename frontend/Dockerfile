FROM node:18-alpine as build

# Directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración
COPY package.json package-lock.json ./

# Instalar dependencias y añadir las dependencias faltantes
RUN npm install --legacy-peer-deps
RUN npm install bootstrap bootstrap-icons react-icons @tensorflow/tfjs react-toastify --legacy-peer-deps

# Copiar el código fuente
COPY . ./

# Variables de entorno
ENV REACT_APP_API_URL=http://localhost:5000/api
ENV REACT_APP_FIREBASE_API_KEY=AIzaSyALafcLIe2JfBAYpvhphPzWpvNRAE5AYDg

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM nginx:alpine

# Crear una configuración nginx básica
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /api/ { \
        proxy_pass http://backend:5000/api/; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_cache_bypass $http_upgrade; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Copiar los archivos de construcción desde la etapa anterior
COPY --from=build /app/build /usr/share/nginx/html

# Exponer el puerto 80
EXPOSE 80

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]