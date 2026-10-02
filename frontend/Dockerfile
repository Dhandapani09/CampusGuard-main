```dockerfile
# ==============================
# Stage 1: Build React Application
# ==============================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json ./

# Install exact versions from package-lock.json
RUN npm ci

# Copy application source
COPY . .

# Build Vite production application
RUN npm run build


# ==============================
# Stage 2: Nginx Web Server
# ==============================
FROM nginx:alpine

# Remove default Nginx page
RUN rm -rf /usr/share/nginx/html/*

# Vite creates the production build under /dist
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx listens on port 80
EXPOSE 80

# Keep Nginx running in the foreground
CMD ["nginx", "-g", "daemon off;"]
```
