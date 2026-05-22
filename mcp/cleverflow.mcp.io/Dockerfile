# Dockerfile for cleverflow.mcp.io
# Based on minimal Node.js Alpine image
FROM node:24.16.0-alpine3.23

# Install tsx globally for running TypeScript directly
RUN npm install -g tsx

# Set working directory
WORKDIR /app

# Copy package files
COPY mcp/cleverflow.mcp.io/.npmrc ./.npmrc
COPY mcp/cleverflow.mcp.io/package.json ./package.json
COPY mcp/cleverflow.mcp.io/tsconfig.json ./tsconfig.json

# Install dependencies (includes @cleverflow-ai/cleverflow.mcp from npm registry)
RUN npm install

# Copy source files
COPY mcp/cleverflow.mcp.io/src ./src

# Expose the port (as defined in src/index.ts, ExpressMcpHost uses port 8032)
EXPOSE 8032

ENV NODE_ENV=production

# Run the TypeScript application directly with tsx
CMD ["npx", "tsx", "src/index.ts"]