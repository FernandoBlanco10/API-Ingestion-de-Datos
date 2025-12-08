// src/validators/ingestion.validator.js
const Joi = require("joi");

const ingestionSchema = Joi.object({
  folio: Joi.string().max(50).required().example("A123"),
  monto: Joi.number().precision(2).min(0).required().example(950.5),
  fecha: Joi.date().iso().required().example("2025-12-03"),
  cliente: Joi.object({
    id: Joi.string().required(),
    nombre: Joi.string().required()
  }).optional(),
  items: Joi.array().items(
    Joi.object({
      sku: Joi.string().required(),
      cantidad: Joi.number().integer().min(1).required(),
      precio_unitario: Joi.number().precision(2).min(0).required()
    })
  ).optional()
});

module.exports = { ingestionSchema };
