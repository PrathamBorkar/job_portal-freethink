const express = require("express");
const router = express.Router();
const { logger, upload } = require("../middlewares/resume.middleware");
const {
  uploadResume,
  downloadResume,
  sendResume,
} = require("../controllers/resume.controller");

router.post(
  "/upload-resume/:uid",
  logger,
  upload.single("resume"),
  uploadResume
);
router.get("/download-resume/:uid", logger, downloadResume);
router.get("/view-resume/:uid", logger, sendResume);

module.exports = router;
