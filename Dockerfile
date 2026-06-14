# Stage 1: Build the frontend React app
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Set up the backend Express engine
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./backend/
RUN npm ci --prefix backend --only=production
COPY backend/ ./backend/
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Configure runtime environment
EXPOSE 5000
ENV NODE_ENV=production
ENV PORT=5000

WORKDIR /app/backend
CMD ["node", "server.js"]
