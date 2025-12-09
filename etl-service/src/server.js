// etl-service/src/server.js
require('dotenv').config();
const express = require("express");
const { query } = require("./db");

const app = express();
app.use(express.json());

app.get("/api/metricas", async (req, res) => {
  try {
    const totalProcessedRes = await query("SELECT count(*)::int AS total FROM ingesta_processed");
    const totalRawRes = await query("SELECT count(*)::int AS total FROM ingesta_raw");
    const pendingRes = await query("SELECT count(*)::int AS pending FROM ingesta_raw WHERE processed = false");
    const latestProcessed = await query("SELECT id, raw_id, folio, processed_at FROM ingesta_processed ORDER BY processed_at DESC LIMIT 10");

    res.json({
      total_processed: totalProcessedRes.rows[0].total,
      total_raw: totalRawRes.rows[0].total,
      pending: pendingRes.rows[0].pending,
      latest_processed: latestProcessed.rows
    });
  } catch (err) {
    console.error("Error metricas:", err);
    res.status(500).json({ error: "internal_error", detail: err.message });
  }
});

const PORT = process.env.ETL_PORT ? Number(process.env.ETL_PORT) : 4000;
app.listen(PORT, () => {
  console.log(`ETL service listening on http://0.0.0.0:${PORT}`);
});
