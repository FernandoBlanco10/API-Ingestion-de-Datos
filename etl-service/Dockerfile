# etl-service/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --production --silent

COPY . .

FROM node:20-alpine

WORKDIR /app

RUN addgroup -S etlgroup && adduser -S etluser -G etlgroup

# Copiar código y luego node_modules desde builder (evita sobrescribir node_modules accidentalmente)
COPY --from=builder /app ./
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production
ENV ETL_PORT=4000

USER etluser

EXPOSE 4000

# Por defecto levanta el server de métricas.
CMD ["node", "src/server.js"]
