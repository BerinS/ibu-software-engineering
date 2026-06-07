FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src/ ./src/
RUN mkdir -p uploads/events
EXPOSE 5000
CMD ["node", "src/server.js"]
