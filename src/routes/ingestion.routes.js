const express = require("express");
const router = express.Router();

const { postIngest, listIngests } = require("../controllers/ingestion.controller");
const { ingestionSchema } = require("../validators/ingestion.validator");
const { validate } = require("../middlewares/validate.middleware");

router.post("/ingesta/datos", validate(ingestionSchema), postIngest);
router.get("/ingesta", listIngests);

module.exports = router;
