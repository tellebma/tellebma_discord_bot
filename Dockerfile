FROM node:19

WORKDIR /usr/src/app

# Installer les dépendances pour Canvas
RUN apt-get update && \
    apt-get install -y \
    libcairo2 \
    libpango1.0-0 \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    && apt-get clean

COPY package.json ./
RUN npm install

COPY . .

# Start the bot
CMD ["node", "app.js"]
