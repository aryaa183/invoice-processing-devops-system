FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY public ./public
COPY src ./src
COPY scripts ./scripts

ENV PORT=3000
ENV DATA_DIR=/app/data
ENV UPLOAD_DIR=/app/uploads

RUN mkdir -p /app/data /app/uploads

EXPOSE 3000

CMD ["node", "src/server.js"]

