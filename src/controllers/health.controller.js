// Controlador simple que devuelve status
function getHealthStatus(req, res) {
  res.json({ status: "ok", service: "data-ingestion-api" });
}

module.exports = { getHealthStatus };
