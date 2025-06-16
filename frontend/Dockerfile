FROM node:18-alpine

# Install curl for health checks
RUN apk add --no-cache curl

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --silent

# Copy source code
COPY . .

EXPOSE 3000

# Use npm start for development
CMD ["npm", "start"] 