const multer = require("multer");

const upload = multer();

const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
};

module.exports = {
  upload,
  logger,
};
