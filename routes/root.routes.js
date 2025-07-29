//This is just for consistency with the existing code structure
const express = require("express");
const router = express.Router();

router.get("", (req, res) => {
  res.send("Welcome to the Job Portal API");
});

module.exports = router;