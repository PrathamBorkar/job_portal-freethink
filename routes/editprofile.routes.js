const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const profileController = require("../controllers/editProfile.controller");

router.get("/profile", authMiddleware, profileController.getUserProfile);
router.patch("/profile", authMiddleware, profileController.patchUserProfile);

module.exports = router;
