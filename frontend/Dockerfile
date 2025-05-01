# Use the official Node.js image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy everything into the container
COPY . .

# Install npm dependencies
RUN npm install

# Build the Next.js app
RUN npm run build

# Expose port (Next.js runs on 3000 by default)
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "start"]
