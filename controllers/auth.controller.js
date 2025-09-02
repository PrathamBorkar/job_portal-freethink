const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/mailer");
const getUserById = require("../utils/getUserById");
const otpStore = new Map();

exports.sendOTP = async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });
  try {
    await sendEmail(email, "Your OTP Code", `Your OTP code is ${otp}`);
    console.log(otp);
    res.json({ success: true, message: "OTP sent to your email" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to send OTP" });
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
      expiresIn: "1d", // Token expires in 1 day
    });

    res.cookie("token", token, {
      httpOnly: true, // Cookie is not accessible via JavaScript
      secure: process.env.NODE_ENV === "production", // Only over HTTPS in production
      sameSite: "Strict", // Prevents CSRF attacks
      maxAge: 24 * 60 * 60 * 1000, // Cookie expiration time: 1 day
    });

    res.json({
      success: true,
      message: "Registration successful",
      user: {
        uid: uid,
        email: email,
        name: name,
        role: role,
        phone: phone,

        ...(role === "applicant" && {
          education: education,
          experience: experience,
          skillids: skillids,
        }),

        ...(role === "recruiter" && {
          company: { ...company, cid: cid },
        }),
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
      {
        id: user.uid,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true, // Makes cookie inaccessible to JavaScript
      secure: process.env.NODE_ENV === "production", // Only over HTTPS in production
      sameSite: "Strict", // Prevent CSRF attacks
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    const userDetails = await getUserById(user.uid);

    if (!userDetails) {
      return res
        .status(401)
        .json({ message: "User not found", token, user: {} });
    }

    const {
      user: userData,
      appData,
      eduData,
      expData,
      appSkillData,
      recruiterInfo,
    } = userDetails;

    return res.json({
      message: "Login successful",
      user: {
        uid: userData.uid,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        phone: userData.phone,
        gender: userData.gender,
        dob: userData.dob,
        ...(userData.role === "applicant" && {
          employmentStatus: appData.employmentStatus,
          jobType: appData.jobType,
          preferredLocation: appData.preferredLocation,
          availability: appData.availability,
          linkedIn: appData.linkedIn,
          portfolioWebsite: appData.portfolioWebsite,
          degree: eduData.degree,
          institution: eduData.institution,
          field_of_study: eduData.field_of_study,
          start_date_degree: eduData.start_date_degree,
          end_date_degree: eduData.end_date_degree,
          gradeValue: eduData.grade_value,
          gradeType: eduData.grade_type,
          education_level: eduData.education_level,
          expName: expData.expName,
          expRole: expData.role,
          expStart: expData.start,
          expEnd: expData.end,
          skillids: appSkillData,
        }),
        ...(recruiterInfo && {
          company: recruiterInfo,
        }),
      },
    });
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res
        .status(400)
        .json({ message: "Invalid or expired token", token, user: {} });
    }
    res.status(500).json({ message: err.message, token, user: {} });
  }
};

exports.logout = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return res
      .status(200)
      .json({ success: true, message: "Logged out successfully." });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ success: false, message: "Logout failed." });
  }
};

exports.verify = async (req, res) => {
  const token = req.cookies.token;
  console.log("Verifying token:", token);
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userDetails = await getUserById(decoded.id);

    if (!userDetails) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    const { user, appData, eduData, expData, appSkillData, recruiterInfo } =
      userDetails;
    console.log("User details:", userDetails);

    res.json({
      success: true,
      message: "Token verified successfully",
      user: {
        uid: user.uid,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        gender: user.gender,
        dob: user.dob,
        ...(user.role === "applicant" && {
          employmentStatus: appData.employmentStatus,
          jobType: appData.jobType,
          preferredLocation: appData.preferredLocation,
          availability: appData.availability,
          linkedIn: appData.linkedIn,
          portfolioWebsite: appData.portfolioWebsite,
          degree: eduData.degree,
          institution: eduData.institution,
          field_of_study: eduData.field_of_study,
          start_date_degree: eduData.start_date_degree,
          end_date_degree: eduData.end_date_degree,
          gradeValue: eduData.grade_value,
          gradeType: eduData.grade_type,
          education_level: eduData.education_level,
          expName: expData.expName,
          expRole: expData.role,
          expStart: expData.start,
          expEnd: expData.end,
          skillids: appSkillData,
        }),
        ...(recruiterInfo && {
          company: recruiterInfo,
        }),
      },
    });
  } catch (error) {
    res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};
