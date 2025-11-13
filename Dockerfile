
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

# Build the Angular app.
# IMPORTANT: Add --base-href / to ensure asset paths are correct for Nginx at root.
RUN npm run build -- --configuration=production --base-href /

# --- DEBUG STEP: Check output folder structure ---
# This will show up in GitHub Actions logs. If you see your index.html here, the copy will work.
RUN ls -R /app/dist/


# --- STAGE 2: Serve the Static Files with Nginx ---
# Use a lightweight Nginx image to serve the build
FROM nginx:alpine

# 1. Copy the Nginx configuration (must have 'listen 8080;')
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# 2. Copy the compiled files from the 'builder' stage
# The path is /app/dist/brecha-frontend/ (according to your angular.json)
COPY --from=builder /app/dist/brecha-frontend/browser/ /usr/share/nginx/html/

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
