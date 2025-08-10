const e = require("express");
const pool = require("../config/db");

exports.createJob = async (req, res) => {
  console.log("Creating job with data:", req.body);
  try {
    const {
      uid,
      title,
      bigDescription,
      smallDescription,
      job_type,
      mode_of_work,
      exp_required,
      salary,
      skillids,
      equity,
      lid,
      cid,
      posted,
    } = req.body;

    const newSalary = salary.split("L" || "K")[0];

    const [result] = await pool.query(
      `INSERT INTO jobs (
        uid, title, bigDescription, posted, job_type, mode_of_work, exp_required, salary, skillids, equity,lid, cid, smallDescription 

      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        uid,
        title,
        bigDescription,
        posted,
        job_type,
        mode_of_work,
        exp_required,
        newSalary,
        JSON.stringify(skillids),
        equity || 0,
        lid,
        cid,
        smallDescription,
      ]
    );

    res.status(201).json({
      message: "Job posted successfully",
      jobid: result.insertId,
      job: {
        jobid: result.insertId,
        title,
        bigDescription,
        smallDescription,
        job_type,
        mode_of_work,
        exp_required,
        salary,
        equity,
        skillids,
        lid,
        cid,
        posted: new Date().toISOString().split("T")[0],
      },
    });
  } catch (err) {
    console.error("Create job error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get All Jobs (public)
exports.getJobs = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM jobs ORDER BY posted DESC");

    if (rows.length === 0) {
      return res.status(404).json({ message: "No jobs found" });
    }

    res.status(200).json({ jobs: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get Job by ID (public)
exports.getJobById = async (req, res) => {
  try {
    const jobid = req.params.jobid;

    const [rows] = await pool.query("SELECT * FROM jobs WHERE jobid = ?", [
      jobid,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.status(200).json({ job: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRecommendedJobs = async (req, res) => {
  const uid = req.user?.id;

  if (!uid) {
    console.log("Unauthorized: No user ID found in request.");
    return res
      .status(401)
      .json({ message: "Unauthorized: User not authenticated" });
  }

  try {
    console.log(`Fetching skills for user: ${uid}`);
    const [skillRows] = await pool.query(
      `SELECT skillid FROM applicant_skills WHERE uid = ?`,
      [uid]
    );

    if (skillRows.length === 0) {
      console.log("No skills found for the user.");
      return res.status(404).json({ message: "No skills found for the user" });
    }

    const skillIds = skillRows.map((row) => row.skillid);
    console.log("User skill IDs:", skillIds);

    const placeholders = skillIds
      .map(() => "JSON_CONTAINS(skillids, JSON_ARRAY(?))")
      .join(" OR ");

    console.log("Constructed SQL condition for skills:", placeholders);

    console.log("Fetching jobs matching user skills...");
    const [jobs] = await pool.query(
      `SELECT * FROM jobs WHERE ${placeholders} ORDER BY posted DESC`,
      skillIds
    );

    console.log(`Found ${jobs.length} job(s) matching the skills.`);

    for (let job of jobs) {
      console.log(`Fetching location for job with lid: ${job.lid}`);
      const [locationData] = await pool.query(
        `SELECT lname FROM locations WHERE lid = ?`,
        [job.lid]
      );

      console.log(`Fetching company info for cid: ${job.cid}`);
      const [companyData] = await pool.query(
        `SELECT name, location, status, tags, type FROM company WHERE cid = ?`,
        [job.cid]
      );

      job.location = locationData[0]?.lname || null;
      job.company = companyData[0] || null;
    }

    console.log("Final recommended jobs prepared.");
    res.status(200).json({ jobs });
  } catch (err) {
    console.error("Error in getRecommendedJobs:", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
};

// ✅ Get Jobs Posted by Recruiter (by uid)
exports.getJobsByRecruiter = async (req, res) => {
  const email = req.user?.email;
  if (!email) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Recruiter not authenticated" });
  }

  const [userRows] = await pool.query("SELECT uid FROM users WHERE email = ?", [
    email,
  ]);

  if (userRows.length === 0) {
    return res.status(401).json({ message: "User not found" });
  }

  const uid = userRows[0].uid;

  if (!uid) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Recruiter not authenticated" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT * FROM jobs WHERE uid = ? ORDER BY posted DESC",
      [uid]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No jobs found for this recruiter" });
    }

    res.status(200).json({ jobs: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update Job by jobid (only by the recruiter who posted it)
exports.updateJob = async (req, res) => {
  const jobid = req.params.jobid;
  const uid = req.user?.id;

  if (!uid) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Recruiter not authenticated" });
  }

  try {
    const {
      title,
      jobType,
      modeOfWork,
      experienceRequired,
      salary,
      location,
      skills,
      recruiterEmail,
      recruiterName,
      description,
    } = req.body;

    // First, check if the job exists and belongs to the user
    const [existingJob] = await pool.query(
      "SELECT * FROM jobs WHERE jobid = ? AND uid = ?",
      [jobid, uid]
    );

    if (existingJob.length === 0) {
      return res
        .status(404)
        .json({ message: "Job not found or unauthorized to update" });
    }

    // Parse existing description to merge with updates
    let existingDescription = {};
    try {
      existingDescription = JSON.parse(existingJob[0].description);
    } catch (error) {
      console.log("Error parsing existing description:", error);
    }

    // Create updated description object
    const updatedDescription = {
      ...existingDescription,
      jobType: jobType || existingDescription.jobType || "Full-time",
      modeOfWork: modeOfWork || existingDescription.modeOfWork || "Office",
      experienceRequired:
        experienceRequired ||
        existingDescription.experienceRequired ||
        "0-1 years",
      salary: salary || existingDescription.salary || "Not specified",
      location: location || existingDescription.location || "Not specified",
      skills: skills || existingDescription.skills || [],
      recruiterEmail: recruiterEmail || existingDescription.recruiterEmail,
      recruiterName: recruiterName || existingDescription.recruiterName,
      description:
        description ||
        existingDescription.description ||
        `${title || existingJob[0].title} position`,
    };

    const [result] = await pool.query(
      "UPDATE jobs SET title = ?, description = ? WHERE jobid = ? AND uid = ?",
      [
        title || existingJob[0].title,
        JSON.stringify(updatedDescription),
        jobid,
        uid,
      ]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Job not found or unauthorized to update" });
    }

    res.status(200).json({
      message: "Job updated successfully",
      job: {
        jobid: parseInt(jobid),
        title: title || existingJob[0].title,
        ...updatedDescription,
        posted: existingJob[0].posted,
      },
    });
  } catch (err) {
    console.error("Update job error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ Delete Job by jobid (only by the recruiter who posted it)
exports.deleteJob = async (req, res) => {
  const jobid = req.params.jobid;
  const uid = req.user?.id;

  if (!uid) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Recruiter not authenticated" });
  }

  try {
    const [result] = await pool.query(
      "DELETE FROM jobs WHERE jobid = ? AND uid = ?",
      [jobid, uid]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Job not found or unauthorized to delete" });
    }

    res.status(200).json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// In your jobs.controller.js file
exports.getTotalJobsByRecruiter = async (req, res) => {
  console.log("Fetching total jobs by recruiter...");
  const email = req.user?.email;

  if (!email) {
    return res
      .status(401)
      .json({ message: "Unauthorized: User not authenticated" });
  }

  try {
    // Get user ID from email
    const [userRows] = await pool.query(
      "SELECT uid FROM users WHERE email = ?",
      [email]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: "Recruiter not found" });
    }

    const uid = userRows[0].uid;

    // Get total jobs count for this recruiter
    const [totalRows] = await pool.query(
      `
      SELECT COUNT(*) as total 
      FROM jobs 
      WHERE uid = ?
    `,
      [uid]
    );

    // Since there's no status column, we'll use the total for all categories
    const stats = {
      total: totalRows[0].total,
      active: totalRows[0].total, // All jobs are considered active for now
      closed: 0,
      drafts: 0,
    };

    res.status(200).json({ stats });
  } catch (err) {
    console.error("Error fetching job statistics:", err);
    res.status(500).json({ error: err.message });
  }
};
