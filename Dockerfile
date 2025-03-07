FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY src/server ./src/server
RUN mkdir -p src/client
EXPOSE 8443
CMD ["npm", "start"]
