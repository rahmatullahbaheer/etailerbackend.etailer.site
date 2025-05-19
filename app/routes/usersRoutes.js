const express = require("express");
const usersControllers = require("../controllers/usersControllers");
const router = express.Router();
const upload = require("../middleware/upload");

router.post("/register", upload.single("image"), usersControllers.register);
router.post("/login", usersControllers.login);
// PATCH route for updating a user by ID (editUser)
router.patch("/users/:id", upload.single("image"), usersControllers.editUser);
router.post("/post", usersControllers.testAdd);

router.get("/get", usersControllers.testGet);
router.get("/getById/:id", usersControllers.getUserById);
router.get("/getCustomer/:id", usersControllers.getCustomers);
router.post("/change-password/:id", usersControllers.changePassword);

router.post("/forgot-password", usersControllers.forgotPassword);
router.post("/verify-otp", usersControllers.verifyOtp);
router.post("/reset-password", usersControllers.resetPassword);
router.patch("/update-create_by/:userId", usersControllers.updateCreatedBy);

module.exports = router;
