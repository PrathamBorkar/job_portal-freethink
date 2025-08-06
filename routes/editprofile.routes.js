const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const profileController = require("../controllers/editProfile.controller");

// router.get("/profile", authMiddleware, profileController.getUserProfile);
// router.patch("/profile", authMiddleware, profileController.patchUserProfile);

router.patch("/additional-details", profileController.patchAdditionalData);
router.patch("/education", profileController.patchEducationalData);
router.patch("/skills", profileController.patchSkillData);

module.exports = router;
