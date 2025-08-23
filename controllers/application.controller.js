const pool = require("../config/db");
const { sendEmail } = require("../utils/mailer");

(exports.getApplicationStatus = async (req, res) => {
  const userId = req.params.uid;
  console.log(`Received userId param: ${userId}`);

  if (!userId) {
    return res.status(400).json({ error: "Missing uid parameter" });
  }

  const sql = `
    SELECT 
      a.uid,
      a.jobid,
      a.applied,
      a.status,
      a.interview_score,
      j.title AS job_title,
      c.name AS company_name
    FROM applications a
    INNER JOIN jobs j ON a.jobid = j.jobid
    INNER JOIN company c ON j.cid = c.cid
    WHERE a.uid = ?
    ORDER BY a.applied DESC
  `;

  try {
    const [rows] = await pool.query(sql, [userId]);

    // ✅ Return empty array if no applications
    const applications = rows.map((row) => ({
      uid: row.uid,
      jobid: row.jobid,
      applied: row.applied,
      status: row.status,
      interview_score: row.interview_score,
      job_title: row.job_title,
      company_name: row.company_name,
    }));

    res.json(applications); // empty array is fine
  } catch (err) {
    console.error("Error fetching application status:", err);
    res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
}),
  (exports.GetApplication = async (req, res) => {
    const jobid = req.params.jobid;
    console.log("Fetching applications for job ID:", jobid);

    if (!jobid) {
      return res
        .status(400)
        .json({ success: false, message: "Job ID is required." });
    }

    try {
      const [applications] = await pool.query(
        `SELECT 
        a.uid,
        a.jobid,
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
      WHERE a.jobid = ?
      ORDER BY a.applied`,
        [jobid]
      );

      if (applications.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No applications found for this job.",
        });
      }

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
  });

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

exports.getUserStats = async (req, res) => {
  try {
    const { uid } = req.query;

    if (!uid) {
      return res.status(400).json({ message: "Missing uid parameter" });
    }

    // 1. Total applications
    const [totalApplications] = await pool.query(
      `SELECT COUNT(*) AS count FROM applications WHERE uid = ?`,
      [uid]
    );

    // 2. Applications this month
    const [applicationsThisMonth] = await pool.query(
      `SELECT COUNT(*) AS count 
       FROM applications 
       WHERE uid = ? 
         AND MONTH(applied) = MONTH(CURRENT_DATE()) 
         AND YEAR(applied) = YEAR(CURRENT_DATE())`,
      [uid]
    );

    // 3. Distinct companies applied
    const [totalCompaniesApplied] = await pool.query(
      `SELECT COUNT(DISTINCT j.cid) AS count
       FROM applications a
       JOIN jobs j ON a.jobid = j.jobid
       WHERE a.uid = ?`,
      [uid]
    );

    // 4. Offers received
    const [offersReceived] = await pool.query(
      `SELECT COUNT(*) AS count 
       FROM applications 
       WHERE uid = ? AND status = 'accepted'`,
      [uid]
    );

    // 5. Applications last month (for change %)
    const [lastMonthApplications] = await pool.query(
      `SELECT COUNT(*) AS count 
       FROM applications 
       WHERE uid = ? 
         AND MONTH(applied) = MONTH(CURRENT_DATE() - INTERVAL 1 MONTH) 
         AND YEAR(applied) = YEAR(CURRENT_DATE() - INTERVAL 1 MONTH)`,
      [uid]
    );

    const applicationsThisMonthChange =
      lastMonthApplications[0].count === 0
        ? 0
        : ((applicationsThisMonth[0].count - lastMonthApplications[0].count) /
            lastMonthApplications[0].count) *
          100;

    // ✅ Send response
    res.json({
      data: {
        totalApplications: totalApplications[0].count,
        applicationsThisMonth: applicationsThisMonth[0].count,
        totalCompaniesApplied: totalCompaniesApplied[0].count,
        offersReceived: offersReceived[0].count,
        totalApplicationsChange: 0, // optional to implement later
        applicationsThisMonthChange,
        totalCompaniesChange: 0,
        offersReceivedChange: 0,
      },
    });
  } catch (err) {
    console.error("Error fetching user stats:", err);
    res.status(500).json({ message: "Server error fetching stats" });
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

// FIXED: UpdatedStatus to correctly update by uid + jobid
exports.UpdatedStatus = async (req, res) => {
  const { uid, jobid, status } = req.body;

  if (!uid || !jobid || !status) {
    return res.status(400).json({
      success: false,
      message: "UID, JobID and status are required",
    });
  }

  try {
    // Update application status for a specific user + job
    const [result] = await pool.query(
      "UPDATE applications SET status = ? WHERE uid = ? AND jobid = ?",
      [status, uid, jobid]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Send email notification only for accepted/rejected
    if (["accepted", "rejected"].includes(status.toLowerCase())) {
      try {
        await sendEmailNotification(uid, jobid, status);
        return res.status(200).json({
          success: true,
          message: `Application for job ${jobid} updated to ${status}. Email notification sent.`,
        });
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        return res.status(200).json({
          success: true,
          message: `Application updated to ${status}, but email failed: ${emailError.message}`,
        });
      }
    }

    // For pending or other statuses (no email needed)
    return res.status(200).json({
      success: true,
      message: `Application for job ${jobid} updated to ${status}.`,
    });
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
  const { jobid } = req.body;

  if (!jobid) {
    return res.status(400).json({ message: "Missing jobid" });
  }

  try {
    // ✅ user already set by verifyToken middleware
    const uid = req.user.id; // use id from payload
    const appliedDate = new Date();

    await pool.query(
      `INSERT INTO applications (uid, jobid, applied, status)
       VALUES (?, ?, ?, 'pending')
       ON DUPLICATE KEY UPDATE applied = VALUES(applied), status = 'pending'`,
      [uid, jobid, appliedDate]
    );

    res.json({ message: "Application submitted successfully" });
  } catch (err) {
    console.error("Error applying for job:", err);
    res.status(500).json({ message: "Server error while applying" });
  }
};
