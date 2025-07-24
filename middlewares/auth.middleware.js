const { body, validationResult } = require("express-validator");

const registerlogger = (req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} Name: '${
      req.body.name || "No name"
    }' with password: '${req.body.password || "not provided"}'`
  );
  next();
};

const loginlogger = (req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} Email: '${
      req.body.email || "No Email"
    }' with password: '${req.body.password || "not provided"}'`
  );
  next();
};

const otpLogger = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
};

module.exports = {
  otpLogger,
};

const registerValidation = [
  body("name").notEmpty().withMessage("name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .notEmpty()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role").notEmpty().withMessage("Role is required"),
  body("phone")
    .notEmpty()
    .isLength({ min: 10, max: 10 })
    .withMessage("Phone number must be exact 10 characters"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const loginValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .notEmpty()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = {
  registerlogger,
  loginlogger,
  registerValidation,
  loginValidation,
};
