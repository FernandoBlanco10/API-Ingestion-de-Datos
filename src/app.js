const express = require('express');
const app = express();

// Middleware global para parsear JSON
app.use(express.json());

// Swagger - OpenAPI
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");

const swaggerDocument = YAML.load(path.join(__dirname, "./docs/openapi.yaml"));

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Importar rutas
const healthRoutes = require("./routes/health.routes");
const ingestionRoutes = require("./routes/ingestion.routes");

// Registrar rutas
app.use('/api', healthRoutes);
app.use("/api", ingestionRoutes);

module.exports = app;