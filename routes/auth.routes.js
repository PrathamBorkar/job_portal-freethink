const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const {
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

module.exports = router;