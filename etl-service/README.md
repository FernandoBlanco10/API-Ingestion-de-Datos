# ETL Service

Cómo ejecutar localmente (desarrollo):

1. Copia variables de la raíz: asegúrate de tener `.env` en la raíz del repo con credenciales Postgres.
2. Instala deps:
   cd etl-service
   npm install

3. Ejecutar server (API de métricas):
   npm start

4. Ejecutar worker manual (procesa registros una vez):
   npm run worker

En Docker (usando docker-compose en la raíz), el servicio ETL se levanta con:
   docker-compose up -d --build

El worker en docker-compose está configurado como servicio separado (`etl-worker`) que ejecuta `node src/worker.js`.
