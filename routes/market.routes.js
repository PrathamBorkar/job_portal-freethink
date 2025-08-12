const express = require("express");
const router = express.Router();
const marketController = require("../controllers/market.controller");
const { skilllogger } = require("../middlewares/skill.middleware");

router.get("/all", skilllogger, marketController.markets);

module.exports = router;
