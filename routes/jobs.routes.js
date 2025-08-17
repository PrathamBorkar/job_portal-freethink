const express = require("express");
const router = express.Router();
const jobsController = require("../controllers/jobs.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { skilllogger } = require("../middlewares/skill.middleware");

// Route to get recommended jobs for logged-in user
router.get("/recommended", verifyToken, jobsController.getRecommendedJobs);

router.patch("/edit-job", jobsController.updateOneJob);

// Create a new job
router.post("/CreateJob", verifyToken, jobsController.createJob);

// Get all jobs
router.get("/getJobs", verifyToken, jobsController.getJobs);

// Delete a job by ID
router.delete("/deleteJob/:jobid", verifyToken, jobsController.deleteJob);

router.get(
  "/getJobsByRecruiter",
  verifyToken,
  jobsController.getJobsByRecruiter
);

router.get(
  "/getTotalJobsByRecruiter",
  verifyToken,
  jobsController.getTotalJobsByRecruiter
);

router.get("/getJobDetail", jobsController.getJobDetails);

router.get("/getAllJobs", jobsController.getJobs);

router.get("/getFilters", jobsController.getFilters);

router.get("/PieChart", skilllogger, verifyToken, jobsController.Piechart);

module.exports = router;
