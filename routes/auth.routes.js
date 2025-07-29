const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const {
  otpLogger,
  registerlogger,
  loginlogger,
  registerValidation,
  loginValidation,
} = require("../middlewares/auth.middleware");

router.post(
  "/register",
  registerlogger,
  registerValidation,
  authController.register
);

router.post("/login", loginlogger, loginValidation, authController.login);
router.post("/send-otp", otpLogger, authController.sendOTP);
router.post("/verify-otp", otpLogger, authController.verifyOTP);
router.post("/change-pass", loginlogger, authController.changePassword);

module.exports = router;