const express = require("express");
const router = express.Router();
const skillController = require("../controllers/skill.controller");
const { skilllogger } = require("../middlewares/skill.middleware");

router.get("/all", skilllogger, skillController.skills);
router.get(
  "/count-app-skills",
  skilllogger,
  skillController.countApplicantSkills
);
router.get("/count-job-skills", skilllogger, skillController.countJobsSkills);
router.get("/:skillid", skilllogger, skillController.skill);

module.exports = router;
