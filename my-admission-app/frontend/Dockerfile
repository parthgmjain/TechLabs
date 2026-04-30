FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173