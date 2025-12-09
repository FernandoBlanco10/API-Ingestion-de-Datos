// etl-service/src/db.js
// Exporta pool y query. Lee variables desde ../.env (si existe) o desde process.env.

// Cargar variables de entorno desde un posible fichero .env si está disponible
require('dotenv').config();
// También permitirá usar variables de entorno inyectadas por docker-compose

const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "postgres",
  database: process.env.PGDATABASE || "data_ingestion",
  max: 10,
  idleTimeoutMillis: 30000
});

pool.on("error", (err) => {
  // Evento para errores inesperados en el pool
  console.error("Unexpected PG error in ETL pool", err);
});

async function query(text, params) {
  return pool.query(text, params);
}

module.exports = { pool, query };
