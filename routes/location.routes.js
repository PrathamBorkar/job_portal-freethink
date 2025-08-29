const express = require("express");
const router = express.Router();
const locationController = require("../controllers/location.controller");

router.get("/location", locationController.locations);

module.exports = router;
