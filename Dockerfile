# Multi-stage production container for NexusEMS
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application source code
COPY . .

# Set permissions
RUN mkdir -p storage/uploads database && chmod -R 755 storage database

EXPOSE 8080

CMD ["node", "server.js"]
