const express = require('express');
const router = express.Router();

const { getHealthStatus } = require('../controllers/health.controller');

// Definimos la ruta y conectamos el controlador
router.get('/health', getHealthStatus);

module.exports = router;