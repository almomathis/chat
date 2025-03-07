services:
  chat-app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8443:8443"
    volumes:
      - ./src/client:/app/src/client
    environment:
      - NODE_ENV=production
      - PORT=8443
    restart: unless-stopped
