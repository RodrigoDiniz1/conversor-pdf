FROM node:20-bookworm-slim

ENV NODE_ENV=production
ENV LIBREOFFICE_PATH=/usr/bin/soffice

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    libreoffice \
    fonts-dejavu-core \
    fonts-liberation \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev

COPY backend ./backend
COPY frontend ./frontend
COPY README.md ./README.md

EXPOSE 3000

CMD ["npm", "start"]
