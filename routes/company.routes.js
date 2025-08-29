const express = require("express");
const router = express.Router();
const companyController = require("../controllers/company.controller");
const { companylogger } = require("../middlewares/company.middleware");
const { verifyToken } = require("../middlewares/auth.middleware");

router.get("/all", companylogger, companyController.companies);

router.get(
  "/getCompanyByRecruiter",
  verifyToken,
  companyController.getCompanyByRecruiter
);

router.patch("/update/:cid", companyController.patchCompanyProfile);

router.get("/getAll", companyController.getAllCompanies);

router.get("/getCompanyDetail", companyController.getCompanyDetails);

module.exports = router;
