const express = require("express");
const router = express.Router();
const controller = require("../controllers/CustomDesign.js");
const upload = require('../middleware/upload');

router.post("/create-custom",upload.single('image') , controller.createCustomDesign);
router.get("/custom", controller.getCustomDesigns);
router.get("/getById/:id", controller.getCustomDesignById);
router.get("/custom-design/user/:user_id", controller.getCustomDesignsByUserId);
router.put("/update-custom-design/:id", controller.updateCustomDesign);
router.delete("/custom/:id", controller.deleteCustomDesign);

module.exports = router;
