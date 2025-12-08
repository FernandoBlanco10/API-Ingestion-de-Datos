const { v4: uuidv4 } = require("uuid");
const { query } = require("../db");

async function postIngest(req, res) {
  try {
    const payload = req.body;
    const id = uuidv4();

    // parsear fecha si viene como string iso
    const fecha = payload.fecha ? new Date(payload.fecha).toISOString() : null;

    const sql = `
      INSERT INTO ingesta_raw(id, folio, monto, fecha, cliente, items, received_at)
      VALUES($1, $2, $3, $4, $5::jsonb, $6::jsonb, now())
      RETURNING id, received_at;
    `;

    const params = [
      id,
      payload.folio || null,
      payload.monto != null ? payload.monto : null,
      fecha,
      payload.cliente ? JSON.stringify(payload.cliente) : null,
      payload.items ? JSON.stringify(payload.items) : null
    ];

    const result = await query(sql, params);
    const inserted = result.rows[0];

    return res.status(201).json({ id: inserted.id, received_at: inserted.received_at, message: "ingesta persistida" });
  } catch (err) {
    console.error("Error en postIngest:", err);
    return res.status(500).json({ error: "internal_server_error", detail: err.message });
  }
}

async function listIngests(req, res) {
  try {
    const result = await query("SELECT id, folio, monto, fecha, cliente, items, received_at FROM ingesta_raw ORDER BY received_at DESC LIMIT 100", []);
    return res.json({ total: result.rowCount, data: result.rows });
  } catch (err) {
    console.error("Error listIngests:", err);
    return res.status(500).json({ error: "internal_server_error", detail: err.message });
  }
}

module.exports = { postIngest, listIngests };



// const { v4: uuidv4 } = require("uuid");

// // almacenamiento temporal en memoria
// const memoryStore = {
//   ingests: []
// };

// function postIngest(req, res) {
//   const payload = req.body;
//   const id = uuidv4();

//   const record = {
//     id,
//     received_at: new Date().toISOString(),
//     payload
//   };

//   // insertar en memoria
//   memoryStore.ingests.push(record);

//   // responder con 201 y id
//   res.status(201).json({ id, message: "ingesta recibida" });
// }

// // endpoint para debugging: listar ingestas en memoria (solo dev)
// function listIngests(req, res) {
//   res.json({ total: memoryStore.ingests.length, data: memoryStore.ingests });
// }

// module.exports = { postIngest, listIngests, memoryStore };
