# --- STAGE 1: Build Angular Application ---
# Use a Node.js image to handle the build process.
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy all source code
COPY . .

# Execute the Angular build command. 
# We specify the output path for clarity, but it usually defaults to /dist/<project-name>.
RUN npm run build -- --output-path=./dist/browser --configuration=production

# --- STAGE 2: Serve the Static Files with Nginx ---
# Use a super-lightweight Nginx image for serving the built application.
FROM nginx:alpine

# Copy the Nginx configuration file (optional, but good for routing/history mode)
# If you need specific routing (like HTML5 History Mode), you must create a custom nginx.conf file.
# COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built files from the 'builder' stage into the Nginx serving directory.
# We are copying the content of the browser output folder.
# NOTE: Check your 'angular.json' to confirm the exact output path if this fails.
COPY --from=builder /app/dist/browser /usr/share/nginx/html

# The default Nginx CMD starts the server
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]