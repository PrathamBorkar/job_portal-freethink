const express = require("express");
const router = express.Router();
const applicationController = require("../controllers/application.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

// ✅ Existing routes
router.get("/status/:uid", applicationController.getApplicationStatus);
router.patch("/apply", verifyToken, applicationController.ApplyForJob);
router.get(
  "/applications/:jobid",
  verifyToken,
  applicationController.GetApplication
);
router.get("/education/:uid", applicationController.GetEducation);
router.get("/experience/:uid", applicationController.GetExperience);
router.put("/status", applicationController.UpdatedStatus);
router.post("/send-email", applicationController.Sendmail);

// ✅ New route for user application stats
// Example: GET /application/getUserStats?uid=123
router.get("/getUserStats", applicationController.getUserStats);

module.exports = router;
