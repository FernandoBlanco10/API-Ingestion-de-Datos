# Dockerfile (API) - coloca en la raíz del proyecto (data-ingestion-api/Dockerfile)
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias de build
COPY package*.json ./
RUN npm ci --production --silent

# Copiar código
COPY . .

# Build step finished. Use smaller runtime image
FROM node:20-alpine

WORKDIR /app

# Crea usuario no-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copiar código y luego node_modules desde builder (evita sobrescribir node_modules accidentalmente)
COPY --from=builder /app ./
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production
ENV PORT=3000

USER appuser

EXPOSE 3000
CMD ["node", "src/server.js"]
