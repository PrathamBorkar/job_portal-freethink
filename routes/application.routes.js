const express = require("express");
const router = express.Router();  
const applicationController = require("../controllers/application.controller");
const { verifyToken } = require("../middlewares/auth.middleware");



// Your routes - cleaned up

router.get('/applications/:jobid',verifyToken, applicationController.GetApplication);
router.get('/education/:uid', applicationController.GetEducation);  
router.get('/experience/:uid', applicationController.GetExperience);
router.put('/status', applicationController.UpdatedStatus);
router.post('/send-email', applicationController.Sendmail);

module.exports = router;
