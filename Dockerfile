# syntax = docker/dockerfile:1

# Use Bun as the runtime
FROM oven/bun:1 AS base

LABEL fly_launch_runtime="SvelteKit/Bun"

WORKDIR /app

# Set production environment
ENV NODE_ENV="production"

# Build stage
FROM base AS build

# Install dependencies
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# Copy application code
COPY . .

# Build application
RUN bun run build

# Remove development dependencies
RUN rm -rf node_modules && bun install --production --frozen-lockfile

# Final stage
FROM base

# Copy built application
COPY --from=build /app/build /app/build
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/package.json /app/package.json

# Start the server
EXPOSE 3000
ENV PORT=3000
ENV HOST=0.0.0.0
CMD [ "bun", "run", "build/index.js" ]
