const e = require("express");
const pool = require("../config/db");

// ✅ Create Job (for recruiter)
exports.createJob = async (req, res) => {
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
      description 
    } = req.body;
    
    const userEmail = req.user?.email;
    
    if (!userEmail) {
      return res.status(401).json({ message: "Unauthorized: Recruiter not authenticated" });
    }

    // Get user ID from database using email
    const [userRows] = await pool.query("SELECT uid FROM users WHERE email = ?", [userEmail]);
    
    if (userRows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }
    
    const uid = userRows[0].uid;
    
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    // ✅ Create comprehensive description object with all job details
    const jobDescription = {
      jobType: jobType || 'Full-time',
      modeOfWork: modeOfWork || 'Office',
      experienceRequired: experienceRequired || '0-1 years',
      salary: salary || 'Not specified',
      location: location || 'Not specified',
      skills: skills || [],
      recruiterEmail: recruiterEmail || userEmail,
      recruiterName: recruiterName || 'Not specified',
      description: description || `${title} position`
    };

    const [result] = await pool.query(
      "INSERT INTO jobs (uid, title, description, posted) VALUES (?, ?, ?, CURDATE())",
      [uid, title, JSON.stringify(jobDescription)]
    );

    res.status(201).json({ 
      message: "Job posted successfully", 
      jobid: result.insertId,
      job: {
        jobid: result.insertId,
        title,
        ...jobDescription,
        posted: new Date().toISOString().split('T')[0]
      }
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
    
    const [rows] = await pool.query("SELECT * FROM jobs WHERE jobid = ?", [jobid]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.status(200).json({ job: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get Recommended Jobs (for applicants)
exports.getRecommendedJobs = async (req, res) => {
  const uid = req.user?.id;
  if (!uid) {
    return res.status(401).json({ message: "Unauthorized: User not authenticated" });
  }

  try {
    // Step 1: Get the user's skills
    const [skillsRows] = await pool.query(`
      SELECT s.skillName 
      FROM applicant_skills a
      JOIN skills s ON a.skillid = s.skillid
      WHERE a.uid = ?;
    `, [uid]);

    if (skillsRows.length === 0) {
      return res.status(404).json({ message: "No skills found for the user" });
    }

    const skillNames = skillsRows.map(skill => skill.skillName);

    // Step 2: Find jobs matching any of those skills
    const [jobs] = await pool.query(`
      SELECT * FROM jobs
      WHERE ${skillNames.map(() => `JSON_SEARCH(description->'$.skills', 'one', ?) IS NOT NULL`).join(" OR ")}
      ORDER BY posted DESC
    `, skillNames);

    res.status(200).json({ jobs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get Jobs Posted by Recruiter (by uid)
exports.getJobsByRecruiter = async (req, res) => {
  const email= req.user?.email;
  if (!email) {return res.status(401).json({ message: "Unauthorized: Recruiter not authenticated" });
  }

 const [userRows] = await pool.query("SELECT uid FROM users WHERE email = ?", [email]);
    
    if (userRows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }
    
    const uid = userRows[0].uid;


  if (!uid) {
    return res.status(401).json({ message: "Unauthorized: Recruiter not authenticated" });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM jobs WHERE uid = ? ORDER BY posted DESC", [uid]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No jobs found for this recruiter" });
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
    return res.status(401).json({ message: "Unauthorized: Recruiter not authenticated" });
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
      description 
    } = req.body;

    // First, check if the job exists and belongs to the user
    const [existingJob] = await pool.query("SELECT * FROM jobs WHERE jobid = ? AND uid = ?", [jobid, uid]);

    if (existingJob.length === 0) {
      return res.status(404).json({ message: "Job not found or unauthorized to update" });
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
      jobType: jobType || existingDescription.jobType || 'Full-time',
      modeOfWork: modeOfWork || existingDescription.modeOfWork || 'Office',
      experienceRequired: experienceRequired || existingDescription.experienceRequired || '0-1 years',
      salary: salary || existingDescription.salary || 'Not specified',
      location: location || existingDescription.location || 'Not specified',
      skills: skills || existingDescription.skills || [],
      recruiterEmail: recruiterEmail || existingDescription.recruiterEmail,
      recruiterName: recruiterName || existingDescription.recruiterName,
      description: description || existingDescription.description || `${title || existingJob[0].title} position`
    };

    const [result] = await pool.query(
      "UPDATE jobs SET title = ?, description = ? WHERE jobid = ? AND uid = ?",
      [title || existingJob[0].title, JSON.stringify(updatedDescription), jobid, uid]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Job not found or unauthorized to update" });
    }

    res.status(200).json({ 
      message: "Job updated successfully",
      job: {
        jobid: parseInt(jobid),
        title: title || existingJob[0].title,
        ...updatedDescription,
        posted: existingJob[0].posted
      }
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
    return res.status(401).json({ message: "Unauthorized: Recruiter not authenticated" });
  }

  try {
    const [result] = await pool.query("DELETE FROM jobs WHERE jobid = ? AND uid = ?", [jobid, uid]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Job not found or unauthorized to delete" });
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
    return res.status(401).json({ message: "Unauthorized: User not authenticated" });
  }

  try {
    // Get user ID from email
    const [userRows] = await pool.query("SELECT uid FROM users WHERE email = ?", [email]);

    if (userRows.length === 0) {
      return res.status(404).json({ message: "Recruiter not found" });
    }

    const uid = userRows[0].uid;

    // Get total jobs count for this recruiter
    const [totalRows] = await pool.query(`
      SELECT COUNT(*) as total 
      FROM jobs 
      WHERE uid = ?
    `, [uid]);

    // Since there's no status column, we'll use the total for all categories
    const stats = {
      total: totalRows[0].total,
      active: totalRows[0].total, // All jobs are considered active for now
      closed: 0,
      drafts: 0
    };

    res.status(200).json({ stats });
  } catch (err) {
    console.error("Error fetching job statistics:", err);
    res.status(500).json({ error: err.message });
  }
};