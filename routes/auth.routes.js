// routes/auth.routes.js

const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");
const {
  registerlogger,
  loginlogger,
  registerValidation,
  loginValidation,
} = require("../middlewares/request.middleware");

// OTP and verification (public)
router.post("/send-otp", authController.sendOTP);
router.post("/verify-otp", authController.verifyOTP);

// Registration route with logging & validation
router.post(
  "/register",
  registerlogger,
  registerValidation,
  authController.register
);

// Login route with logging & validation
router.post(
  "/login",
  loginlogger,
  loginValidation,
  authController.login
);

// Example protected route
router.get("/profile", authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: "Protected route accessed",
    user: req.user,
  });
});

module.exports = router;
