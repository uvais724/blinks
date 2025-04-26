# Use an official Node.js runtime as a parent image
FROM node:20-slim

# Install Chrome dependencies
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    --no-install-recommends

# Install Chrome itself
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list && \
    apt-get update && \
    apt-get install -y google-chrome-stable && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV JWT_SECRET=9d0f3a5a6df457a5d44a6aee4a31e317cb246adc5f91e54a398e4b7e4a9bb5cc
ENV MONGODB_URI=mongodb+srv://uvais724:sJ8xjlLKKp36JQJq@cluster0.eouykuz.mongodb.net/blinks
ENV NUXT_SESSION_PASSWORD=bb7b62e1d9d9486c88fc4f5b5173d2e4f1a58d63a4cbbf0147b26e8b2d7cd6f7

# Install Node.js dependencies
RUN npm run build

# Expose port (if needed)
EXPOSE 3000

# Start your app
CMD [ "npm", "start" ]
