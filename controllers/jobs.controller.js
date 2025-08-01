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
    const [rows] = await pool.query("SELECT * FROM jobs");

    if (rows.length === 0) {
      return res.status(404).json({ message: "No jobs found" });
    }

    res.status(200).json({ jobs: rows });
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
      WHERE ${skillNames.map(() => `JSON_SEARCH(description->'$.requiredSkills', 'one', ?) IS NOT NULL`).join(" OR ")}
    `, skillNames);

    res.status(200).json({ jobs });
  } catch (err) {
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
