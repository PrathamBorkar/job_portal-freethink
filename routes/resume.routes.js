const express = require("express");
const router = express.Router();
const { upload, logger } = require("../middlewares/resume.middleware");
const {
  uploadResume,
  downloadResume,
  sendResume,
} = require("../controllers/resume.controller");

router.post("/upload-resume", logger, upload.single("resume"), uploadResume);
router.get("/:uid", downloadResume);
router.get("/view-resume/:uid", sendResume);

module.exports = router;