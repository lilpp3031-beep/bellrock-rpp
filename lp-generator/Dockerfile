FROM mcr.microsoft.com/playwright:v1.44.0-jammy

WORKDIR /app

# Install Node.js
RUN apt-get update && apt-get install -y \
  curl \
  && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
  && apt-get install -y nodejs \
  && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source
COPY src ./src
COPY tsconfig.json .

# Build
RUN pnpm build

# Expose port
EXPOSE 3001

# Start server
CMD ["npm", "start"]
