const express = require('express');
const app = express();

// Middleware global para parsear JSON
app.use(express.json());

// Importar rutas
const healthRoutes = require("./routes/health.routes");
const ingestionRoutes = require("./routes/ingestion.routes");

// Registrar rutas
app.use('/api', healthRoutes);
app.use("/api", ingestionRoutes);

module.exports = app;