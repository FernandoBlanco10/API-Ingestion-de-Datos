// etl-service/src/worker.js
// Worker ETL: lee ingesta_raw sin procesar, transforma e inserta en ingesta_processed,
// y marca los raws como processed. Puede ejecutarse manualmente o como cron job.

require("dotenv").config({ path: require("path").join(__dirname, "..", "..", ".env") });
const { pool, query } = require("./db");
const cron = require("node-cron");

// Tamaño del lote por ejecución
const BATCH_SIZE = process.env.ETL_BATCH_SIZE ? Number(process.env.ETL_BATCH_SIZE) : 50;

/**
 * transformRecord: recibe row con columnas (id, folio, monto, fecha, cliente, items)
 * y devuelve el objeto a insertar en ingesta_processed
 */
function transformRecord(row) {
  // row.cliente y row.items ya vienen como objetos (pg devuelve JSONB parsed), pero
  // si llegaran como strings, intentamos parsear.
  let cliente = row.cliente;
  let items = row.items;

  // defensive parsing
  if (typeof cliente === "string") {
    try { cliente = JSON.parse(cliente); } catch (e) { cliente = null; }
  }
  if (typeof items === "string") {
    try { items = JSON.parse(items); } catch (e) { items = null; }
  }

  let total_items = 0;
  let monto_calculado = null;

  if (Array.isArray(items) && items.length > 0) {
    total_items = items.reduce((acc, it) => {
      const c = parseInt(it.cantidad || 0, 10) || 0;
      return acc + c;
    }, 0);

    monto_calculado = items.reduce((acc, it) => {
      const qty = parseInt(it.cantidad || 0, 10) || 0;
      const price = parseFloat(it.precio_unitario || 0) || 0;
      return acc + qty * price;
    }, 0);

    // redondeo a 2 decimales
    monto_calculado = Math.round((monto_calculado + Number.EPSILON) * 100) / 100;
  } else {
    monto_calculado = row.monto != null ? Number(row.monto) : null;
  }

  return {
    raw_id: row.id,
    folio: row.folio,
    monto: row.monto,
    fecha: row.fecha,
    cliente,
    items,
    total_items,
    monto_calculado
  };
}

async function processBatch() {
  console.log(new Date().toISOString(), `ETL: buscando hasta ${BATCH_SIZE} registros no procesados...`);
  const selectSql = `SELECT id, folio, monto, fecha, cliente, items FROM ingesta_raw WHERE processed = false ORDER BY received_at ASC LIMIT $1`;
  const res = await query(selectSql, [BATCH_SIZE]);

  if (!res.rowCount) {
    console.log("ETL: No hay registros sin procesar.");
    return;
  }

  console.log(`ETL: Procesando ${res.rowCount} registros...`);
  for (const row of res.rows) {
    const transformed = transformRecord(row);

    // Usamos client para transacciones por registro
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const insertSql = `
        INSERT INTO ingesta_processed (
          id, raw_id, folio, monto, fecha, cliente, items, total_items, monto_calculado, processed_at
        )
        VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8, $9, now())
      `;

      // Usamos raw.id como id de processed para mantener relación simple.
      const insertParams = [
        row.id, // id del processed (puedes cambiar a uuid nuevo)
        transformed.raw_id,
        transformed.folio,
        transformed.monto,
        transformed.fecha,
        transformed.cliente ? JSON.stringify(transformed.cliente) : null,
        transformed.items ? JSON.stringify(transformed.items) : null,
        transformed.total_items,
        transformed.monto_calculado
      ];

      await client.query(insertSql, insertParams);

      const updateSql = `UPDATE ingesta_raw SET processed = true, processed_at = now() WHERE id = $1`;
      await client.query(updateSql, [row.id]);

      await client.query("COMMIT");
      console.log(`ETL: Procesado raw_id=${row.id}`);
    } catch (err) {
      await client.query("ROLLBACK");
      console.error(`ETL: Error procesando raw_id=${row.id}:`, err.message);
      // quedará sin marcar processed para reintento futuro
    } finally {
      client.release();
    }
  }
}

// Ejecutar una vez (manual)
async function runOnce() {
  try {
    await processBatch();
  } catch (err) {
    console.error("ETL worker fatal error:", err);
  }
}

// Cron programado (cada 1 minuto)
cron.schedule("*/1 * * * *", async () => {
  console.log(new Date().toISOString(), "ETL cron triggered");
  await runOnce();
});

// Si se ejecuta directamente: runOnce y salir
if (require.main === module) {
  (async () => {
    console.log("ETL: ejecución única (manual)");
    await runOnce();
    process.exit(0);
  })();
}

module.exports = { runOnce, processBatch };
