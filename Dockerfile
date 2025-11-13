# --- STAGE 1: Build Angular Application ---
# Use a Node.js image for the build process
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy base files and install dependencies
COPY package.json package-lock.json angular.json ./
RUN npm install

# Copy all source code
COPY . .

# Build the Angular app (output path is taken from angular.json: "dist/brecha-frontend")
RUN npm run build -- --configuration=production

# --- STAGE 2: Serve the Static Files with Nginx ---
# Use a lightweight Nginx image to serve the build
FROM nginx:alpine

# 1. Copy the Nginx configuration (must have 'listen 8080;')
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# 2. Copy the compiled files from the 'builder' stage
# KEY FIX: The path is now /app/dist/brecha-frontend/ where "brecha-frontend" is the outputPath from angular.json
COPY --from=builder /app/dist/brecha-frontend/ /usr/share/nginx/html/

# Document the port, even though Nginx is already set to 8080
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
