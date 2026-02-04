# Stage 1: Build the React application
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
# Remove default Nginx static assets
RUN rm -rf /usr/share/nginx/html/*
# Copy the build output from the previous stage
COPY --from=build /app/build /usr/share/nginx/html
# CRITICAL FIX: Copy the custom nginx configuration to enable the API proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
