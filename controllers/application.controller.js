const pool = require("../config/db");
const { sendEmail } = require("../utils/mailer");

exports.GetApplication = async (req, res) => {
  const jobid = req.params.jobid;
  console.log("Fetching applications for job ID:", jobid);

  if (!jobid) {
    return res
      .status(400)
      .json({ success: false, message: "Job ID is required." });
  }

  try {
    // First get all uids for this job
    const [uss] = await pool.query(
      "SELECT uid FROM applications WHERE jobid = ?",
      [jobid]
    );

    if (uss.length === 0) {
      return res
        .status(404)
        .json({
          success: false,
          message: "No applications found for this job.",
        });
    }

    // Extract uids
    const uids = uss.map((row) => row.uid);

    // Fetch application details for all uids - INCLUDING uid and user details
    const [applications] = await pool.query(
      `SELECT 
        a.uid,
        a.applied,
        a.status,
        ap.preferredLocation,
        ap.availability,
        ap.linkedIn,
        ap.portfolioWebsite,
        ap.resume_url,
        u.name,
        u.email,
        u.phone
      FROM applications AS a
      JOIN applicants AS ap ON a.uid = ap.uid
      LEFT JOIN users AS u ON a.uid = u.uid
      WHERE a.uid IN (?)
      ORDER BY a.applied`,
      [uids]
    );

    return res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// FIXED: Get education by uid from URL params instead of middleware
exports.GetEducation = async (req, res) => {
  const uid = req.params.uid; // Changed from req.uid to req.params.uid

  if (!uid) {
    return res
      .status(400)
      .json({ success: false, message: "User ID is required." });
  }

  try {
    const [education] = await pool.query(
      "SELECT * FROM education WHERE uid = ?",
      [uid]
    );

    if (education.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No education records found." });
    }

    return res.status(200).json({
      success: true,
      data: education,
    });
  } catch (error) {
    console.error("Error fetching education:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// FIXED: Get experience by uid from URL params instead of middleware
exports.GetExperience = async (req, res) => {
  const uid = req.params.uid; // Changed from req.uid to req.params.uid
  console.log("Fetching experience for user ID:", uid);

  if (!uid) {
    return res
      .status(400)
      .json({ success: false, message: "User ID is required." });
  }

  try {
    const [experience] = await pool.query(
      "SELECT * FROM experience WHERE uid = ?",
      [uid]
    );

    if (experience.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No experience records found." });
    }

    return res.status(200).json({
      success: true,
      data: experience,
    });
  } catch (error) {
    console.error("Error fetching experience:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// FIXED: Send email function that doesn't send response (helper function)
async function sendEmailNotification(uid, status) {
  try {
    // Get applicant email from users table
    const [rows] = await pool.query(
      "SELECT email, name FROM users WHERE uid = ?",
      [uid]
    );

    if (rows.length === 0) {
      throw new Error("User not found");
    }

    const { email, name } = rows[0];

    // Prepare message based on status
    let subject, message;

    if (status.toLowerCase() === "accepted") {
      subject = "Application Status - Accepted";
      message = `Hello ${name},\n\nCongratulations! Your application has been accepted. You may be called soon for an interview.\n\nBest regards,\nRecruitment Team`;
    } else if (status.toLowerCase() === "rejected") {
      subject = "Application Status - Rejected";
      message = `Hello ${name},\n\nThank you for applying. Unfortunately, your application was not selected. We wish you the best in your job search.\n\nBest regards,\nRecruitment Team`;
    } else {
      throw new Error("Invalid status for email notification");
    }

    // Send email
    await sendEmail(email, subject, message);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("Error sending email notification:", error);
    throw error;
  }
}

// ORIGINAL: Sendmail endpoint (if you want to keep it separate)
exports.Sendmail = async (req, res) => {
  const { uid, status } = req.body;

  if (!uid || !status) {
    return res
      .status(400)
      .json({ success: false, message: "UID and status are required" });
  }

  try {
    const result = await sendEmailNotification(uid, status);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// FIXED: UpdatedStatus that doesn't have header conflicts
exports.UpdatedStatus = async (req, res) => {
  const { uid, status } = req.body;

  if (!uid || !status) {
    return res
      .status(400)
      .json({ success: false, message: "UID and status are required" });
  }

  try {
    // Update application status
    const [result] = await pool.query(
      "UPDATE applications SET status = ? WHERE uid = ?",
      [status, uid]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }

    // Send email notification (only for accepted/rejected status)
    if (
      status.toLowerCase() === "accepted" ||
      status.toLowerCase() === "rejected"
    ) {
      try {
        await sendEmailNotification(uid, status);
        return res.status(200).json({
          success: true,
          message: `Application status updated to ${status}. Email notification sent.`,
        });
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        // Status was updated successfully, but email failed
        return res.status(200).json({
          success: true,
          message: `Application status updated to ${status}. Email notification failed: ${emailError.message}`,
        });
      }
    } else {
      // For pending status, don't send email
      return res.status(200).json({
        success: true,
        message: `Application status updated to ${status}.`,
      });
    }
  } catch (error) {
    console.error("Error updating application status:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

exports.ApplyForJob = async (req, res) => {
  const { applicationData } = req.body;

  if (!applicationData || !applicationData.uid || !applicationData.jobid) {
    return res.status(400).json({ message: "Missing uid or jobid" });
  }

  try {
    const appliedDate = new Date();

    // Insert application or update if exists
    await pool.query(
      `INSERT INTO applications (uid, jobid, applied, status)
       VALUES (?, ?, ?, 'pending')
       ON DUPLICATE KEY UPDATE applied = VALUES(applied), status = 'pending'`,
      [applicationData.uid, applicationData.jobid, appliedDate]
    );

    res.json({ message: "Application submitted successfully" });
  } catch (err) {
    console.error("Error applying for job:", err);
    res.status(500).json({ message: "Server error while applying" });
  }
};
