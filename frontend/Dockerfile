# Use official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy everything to the container
COPY . .

# Install pnpm (or use npm if that's what you're using)
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install

# Build the Next.js app
RUN pnpm run build

# Expose port Railway will use
EXPOSE 3000

# Start Next.js
CMD ["pnpm", "start"]
