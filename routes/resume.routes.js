const express = require("express");
const router = express.Router();
const { upload, logger } = require("../middlewares/resume.middleware");
const { uploadResume } = require("../controllers/resume.controller");

router.post("/upload-resume", logger, upload.single("resume"), uploadResume);

module.exports = router;
