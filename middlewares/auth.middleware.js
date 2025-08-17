const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

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

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1]; // Expecting: "Bearer <token>"

  console.log("Auth header:", authHeader);

  console.log("Extracted token:", token);

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // attach user data to request

    console.log("Token verified, user:", decoded); // ← ADD DEBUG LOG

    next();
  } catch (err) {
    console.error("Token verification failed:", err.message); // ← ADD DEBUG LOG

    return res.status(403).json({ error: "Invalid or expired token." });
  }
};

module.exports = {
  otpLogger,
  registerlogger,
  loginlogger,
  registerValidation,
  loginValidation,
  verifyToken,
};
