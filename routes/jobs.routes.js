const express = require('express');
const router = express.Router();
const jobsController = require('../controllers/jobs.controller');
const { verifyToken } = require('../middleware/auth');

// Route to get recommended jobs for logged-in user
router.get('/recommended', verifyToken, jobsController.getRecommendedJobs);

module.exports = router;
