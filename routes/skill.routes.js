const express = require("express");
const router = express.Router();
const skillController = require("../controllers/skill.controller");
const { skilllogger } = require("../middlewares/skill.middleware");

router.get("/all", skilllogger, skillController.skills);

module.exports = router;
