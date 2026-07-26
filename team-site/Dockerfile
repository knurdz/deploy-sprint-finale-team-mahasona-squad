# AI-REVIEW-MARKER: participant must manually remove this marker

# Stage 1: Build the team-site application
FROM node:20-slim AS builder

WORKDIR /app

# Copy package configurations
COPY package*.json ./

# Install dependencies strictly from package-lock.json
RUN npm ci

# Copy the rest of the application files
COPY . .

# Build the application
RUN npm run build

# Mirror the CI build process by preparing the output environment in dist
RUN mkdir -p dist/status dist/health && \
    echo "ok" > dist/health/index.html && \
    cp server.js dist/ && \
    cp package.json dist/

# Stage 2: Serve the application
FROM node:20-slim AS runner

WORKDIR /app

# Copy only the compiled/prepared assets from the builder stage
COPY --from=builder /app/dist ./

# Expose the application port
EXPOSE 8080

ENV PORT=8080

# Run the Node server to serve static assets and handle endpoints
CMD ["node", "server.js"]
