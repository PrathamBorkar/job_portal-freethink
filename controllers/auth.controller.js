// auth.controller.js
const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/mailer");
const otpStore = new Map();

exports.sendOTP = async (req, res) => {
  const { email } = req.body;
  
  // Input validation
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store OTP with 10 minutes expiry instead of 5
  otpStore.set(email.toLowerCase(), { 
    otp, 
    expiresAt: Date.now() + 10 * 60 * 1000 
  });
  
  console.log(`Generated OTP for ${email}: ${otp}`); // Debug log
  
  try {
    await sendEmail(email, "Your OTP Code", `Your OTP code is ${otp}`);
    res.json({ 
      message: "OTP sent to your email", 
      nextStep: "verify-otp",
      debug: `OTP: ${otp}` // Remove this in production
    });
  } catch (err) {
    console.error("Email sending error:", err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

exports.verifyOTP = (req, res) => {
  const { email, otp } = req.body;
  
  // Input validation
  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }
  
  console.log(`Verifying OTP for ${email}: ${otp}`); // Debug log
  
  const record = otpStore.get(email.toLowerCase());
  
  if (!record) {
    console.log(`No OTP record found for ${email}`);
    return res.status(400).json({ message: "No OTP found for this email" });
  }
  
  if (Date.now() > record.expiresAt) {
    console.log(`OTP expired for ${email}`);
    otpStore.delete(email.toLowerCase());
    return res.status(400).json({ message: "OTP has expired" });
  }
  
  // Convert both to strings and trim whitespace
  const storedOTP = record.otp.toString().trim();
  const providedOTP = otp.toString().trim();
  
  if (storedOTP !== providedOTP) {
    console.log(`OTP mismatch for ${email}. Expected: ${storedOTP}, Got: ${providedOTP}`);
    return res.status(400).json({ message: "Invalid OTP" });
  }
  
  // Clean up the OTP
  otpStore.delete(email.toLowerCase());
  
  const token = jwt.sign({ email: email.toLowerCase() }, process.env.JWT_SECRET, { expiresIn: "10m" });
  
  console.log(`OTP verified successfully for ${email}`);
  
  res.json({ 
    success: true, 
    message: "OTP verified", 
    token, 
    nextStep: "role-selection" 
  });
};

exports.register = async (req, res) => {
  const conn = await pool.getConnection();
  await conn.beginTransaction();

  try {
    const { token, name, email, password, phone, role, company } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.email !== email.toLowerCase()) {
      return res.status(400).json({ error: "Invalid token" });
    }

    const [userResult] = await conn.query(
      "INSERT INTO users (name, email, password, phone, role, created) VALUES (?, ?, ?, ?, ?, NOW())",
      [name, email.toLowerCase(), await bcrypt.hash(password, 10), phone, role]
    );
    const uid = userResult.insertId;

    if (role === "recruiter" && company) {
      const [companyResult] = await conn.query(
        "INSERT INTO company (name, location, description) VALUES (?, ?, ?)",
        [company.name, company.location, company.description]
      );
      const cid = companyResult.insertId;
      await conn.query("INSERT INTO recruiter (uid, cid) VALUES (?, ?)", [uid, cid]);
    } else if (role === "applicant") {
      await conn.query("INSERT INTO applicant (uid) VALUES (?)", [uid]);
    }

    await conn.commit();
    res.json({
      success: true,
      message: role === "applicant" ? "Registration successful, redirecting to homepage" : "Registration successful, please confirm",
      nextStep: role === "applicant" ? "homepage" : "confirmation",
    });
  } catch (err) {
    await conn.rollback();
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(400).json({ error: "Invalid or expired token" });
    }
    res.status(500).json({ error: "Registration failed", details: err.message });
  } finally {
    conn.release();
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  
  try {
    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email.toLowerCase()]);
    if (users.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }
    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ uid: user.uid, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ success: true, message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ error: "Login failed", details: err.message });
  }
};