const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/mailer");
const otpStore = new Map();

exports.sendOTP = async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });
  try {
    await sendEmail(email, "Your OTP Code", `Your OTP code is ${otp}`);
    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

exports.verifyOTP = (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore.get(email);
  if (!record || record.otp !== otp || Date.now() > record.expiresAt) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid or expired OTP" });
  }
  otpStore.delete(email);
  res.json({
    success: true,
    message: "OTP verified successfully",
  });
};

exports.register = async (req, res) => {
  const conn = await pool.getConnection();
  await conn.beginTransaction();
  let token = null;

  try {
    const {
      name,
      email,
      password,
      phone,
      role,
      company,
      cid,
      education,
      experience,
      skillids,
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const [userResult] = await conn.query(
      "INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashedPassword, phone, role]
    );
    const uid = userResult.insertId;

    if (role === "recruiter") {
      if (cid === null) {
        const [companyResult] = await conn.query(
          "INSERT INTO company (name, location, description) VALUES (?, ?, ?)",
          [company.name, company.location, company.description]
        );

        const newCid = companyResult.insertId;
        await conn.query("INSERT INTO recruiters (uid, cid) VALUES (?, ?)", [
          uid,
          newCid,
        ]);
      } else {
        await conn.query("INSERT INTO recruiters (uid, cid) VALUES (?, ?)", [
          uid,
          cid,
        ]);
      }
    } else if (role === "applicant") {
      await conn.query("INSERT INTO applicants (uid) VALUES (?)", [uid]);

      for (let i = 0; i < skillids.length; i++) {
        await conn.query(
          "INSERT INTO applicant_skills (uid, skillid) VALUES (?, ?)",
          [uid, skillids[i]]
        );
      }

      await conn.query(
        "INSERT INTO education (uid, degree, institution, field_of_study, start_date_degree, end_date_degree, grade_value, grade_type, education_level) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          uid,
          education.degree,
          education.institution,
          education.field_of_study,
          education.start_date_degree,
          education.end_date_degree,
          education.grade_value,
          education.grade_type,
          education.education_level,
        ]
      );

      await conn.query(
        "INSERT INTO experience (uid, expName, role, start, end) VALUES (?, ?, ?, ?, ?)",
        [
          uid,
          experience.expName,
          experience.role,
          experience.start,
          experience.end,
        ]
      );
    }

    await conn.commit();

    token = jwt.sign({ email: email, role: role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        uid: uid,
        email: email,
        name: name,
        role: role,
        phone: phone,
      },
    });
  } catch (err) {
    await conn.rollback();
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
        token,
        user: {},
      });
    }
    res
      .status(500)
      .json({ success: false, message: err.message, token, user: {} });
  } finally {
    conn.release();
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  let token = null;
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    const user = rows[0];

    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid email", token, user: {} });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res
        .status(401)
        .json({ message: "Invalid password", token, user: {} });
    }

    token = jwt.sign(
      { email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        uid: user.uid,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res
        .status(400)
        .json({ message: "Invalid or expired token", token, user: {} });
    }
    res.status(500).json({
      message: err.message,
      token,
      user: {},
    });
  }
};

exports.changePassword = async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Email and new password are required.",
    });
  }

  try {
    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    const [result] = await pool.query(
      "UPDATE users SET password = ? WHERE email = ?",
      [newHashedPassword, email]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    res
      .status(200)
      .json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    console.error("Error changing password:", error.message);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};