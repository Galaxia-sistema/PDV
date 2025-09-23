# Etapa de compilación (build)
FROM node:22 AS build
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Compilar Angular en modo producción
RUN npm run build --configuration production

# Etapa de producción (Nginx para servir los archivos)
FROM nginx:stable-alpine

# Copiar la build de Angular a la carpeta pública de Nginx
COPY --from=build /app/dist/mac-indicadores /usr/share/nginx/html

# Exponer el puerto 80
EXPOSE 80

# Comando de inicio
CMD ["nginx", "-g", "daemon off;"]
