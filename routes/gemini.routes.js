const express = require("express");
const router = express.Router();
const geminiController = require("../controllers/gemini.controller");

router.post("/ask", geminiController.askGemini);

module.exports = router;
