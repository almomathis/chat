FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Make sure the application binds to 0.0.0.0
ENV HOST=0.0.0.0
ENV PORT=8443

# Expose port explicitly
EXPOSE 8443

# Command to run the application
CMD ["node", "src/server/server.js"]
