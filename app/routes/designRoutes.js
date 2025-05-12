const express = require("express");
const DesignControllers = require("../controllers/designControllers");
const router = express.Router();

router.get("/design", DesignControllers.getDesigns);
// router.get("/design",(req,res)=>{
//     return res.send("Hello World>>>>>>");
// });
router.post("/design", DesignControllers.createDesign);
router.put("/design/:id", DesignControllers.updateDesign);
router.delete("/design/:id", DesignControllers.deleteDesign);
router.get("/design/:id", DesignControllers.getDesignById);
router.get("/design-user/:user_id", DesignControllers.getDesignsByUserId);
router.post("/custom-design", DesignControllers.createCustomDesign);

module.exports = router;
