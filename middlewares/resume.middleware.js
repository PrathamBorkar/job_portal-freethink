const multer = require("multer");

const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "resumes/");
  },
  filename: function (req, file, cb) {
    const uid = req.body.uid;
    const timestamp = Date.now();
    const uniqueName = `resume-${uid}-${timestamp}.pdf`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype !== "application/pdf") {
    return cb(new Error("Only PDF files are allowed"));
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter });

module.exports = {
  upload,
  logger,
};