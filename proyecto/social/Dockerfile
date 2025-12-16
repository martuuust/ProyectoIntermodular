# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Argumentos de build para variables de entorno
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_GEMINI_API_KEY

# Exponer como variables de entorno para Vite
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY . .

# Build de la aplicación con Vite
RUN npm run build

# Production stage - usar nginx para servir archivos estáticos
FROM nginx:alpine

# Copiar build de Vite al directorio de nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración de nginx para SPA
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Exponer puerto 80
EXPOSE 80

# Nginx se inicia automáticamente
CMD ["nginx", "-g", "daemon off;"]