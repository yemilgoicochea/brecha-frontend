# --- STAGE 1: Build Angular Application (igual que el tuyo) ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
# La ruta de salida que usas en package.json es dist/browser
RUN npm run build -- --output-path=./dist/browser --configuration=production

# --- STAGE 2: Serve the Static Files with Nginx ---
FROM nginx:alpine

# 1. Copiar la configuración personalizada que escucha en 8080
# NOTA: Asegúrate de que el archivo nginx.conf exista en la raíz de tu repo
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# 2. Copiar los archivos compilados
# Tu build anterior usaba /dist/browser, así que lo mantenemos.
COPY --from=builder /app/dist/browser /usr/share/nginx/html

# EXPOSE 8080 es opcional, pero buena práctica de documentación.
EXPOSE 8080 
CMD ["nginx", "-g", "daemon off;"]