FROM node:18-bullseye

# Instalar dependencias necesarias para TensorFlow, canvas y webcam
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    ffmpeg \
    v4l-utils \
    fswebcam \
    && rm -rf /var/lib/apt/lists/*

# Directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./

# Instalar dependencias
RUN npm install --legacy-peer-deps

# Copiar el resto de la aplicación
COPY . .

# Crear directorio para imágenes temporales
RUN mkdir -p temp

# Exponer puerto
EXPOSE 5000

# Comando para iniciar el servidor
CMD ["node", "server.js"]