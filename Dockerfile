FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY server ./server
COPY client ./client
EXPOSE 8443
CMD ["node", "server/server.js"]
