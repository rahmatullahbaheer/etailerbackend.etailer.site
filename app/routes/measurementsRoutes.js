const express = require("express");
const MeasurementController = require("../controllers/MeasurementController");
const router = express.Router();

router.get("/getAll", MeasurementController.getAll);
router.post("/measurement", MeasurementController.create);
router.get("/measurementById", MeasurementController.getById);
router.patch("/measurement/:id", MeasurementController.update);
router.delete("/measurement/:id", MeasurementController.delete);


module.exports = router;
