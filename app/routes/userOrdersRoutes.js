const express = require("express");
const userOrders = require("../controllers/userOrdersControllers");
const router = express.Router();
const upload = require('../middleware/upload');
router.post("/create-user-order", upload.single('image') ,userOrders.createOrders);
router.get("/status", userOrders.getOrdersByStatus);
router.get("/orders/:id", userOrders.getOrderById);
router.patch("/orders/:id",upload.single('image') , userOrders.updateOrder);
router.delete("/orders/:id", userOrders.deleteOrder);

module.exports = router;