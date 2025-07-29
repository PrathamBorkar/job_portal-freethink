const express = require("express");
const router = express.Router();
const companyController = require("../controllers/company.controller");
const { companylogger } = require("../middlewares/company.middleware");

router.get("/all", companylogger, companyController.companies);

module.exports = router;