const express = require("express");
const router = express.Router();
const roleController = require("../controllers/roles.controller");
const { skilllogger } = require("../middlewares/skill.middleware");

router.get("/all", skilllogger, roleController.roles);

module.exports = router;
