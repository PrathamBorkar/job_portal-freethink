const e = require("express");
const pool = require("../config/db");

// ✅ Create Job (for recruiter)
exports.createJob = async (req, res) => {
  console.log("Creating job with data:", req.body);
  try {
    const {
      custom_title,           // Changed from 'title' to match DB field
      job_type,
      mode_of_work,
      experience_min,         // Changed from 'exp_required' to match DB field  
      experience_max,         // New field from DB schema
      salary_min,             // Changed from 'salary' to match DB field
      salary_max,             // New field from DB schema
      equity_min,             // New field from DB schema
      equity_max,             // New field from DB schema
      opening,                // New field from DB schema
      qualification_id,       // New field from DB schema
      marketid,               // New field from DB schema
      lid,                    // Keeping same
      skillids,               // Keeping same
      smallDescription,       // Keeping same
      bigDescription,         // Keeping same
      links                   // This might be stored elsewhere or ignored
    } = req.body;

    const userEmail = req.user?.email;

    if (!userEmail) {
      return res.status(401).json({ message: "Unauthorized: Recruiter not authenticated" });
    }

    const [userRows] = await pool.query("SELECT uid FROM users WHERE email = ?", [userEmail]);

    if (userRows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const uid = userRows[0].uid;

    const [companyRows] = await pool.query("SELECT cid FROM recruiters WHERE uid = ?", [uid]);

    if (companyRows.length === 0) {
      return res.status(400).json({ message: "Company not found for this user" });
    }

    const cid = companyRows[0].cid;

    // Validation - Updated field names
    if (!custom_title || !job_type || !mode_of_work || experience_min === undefined || salary_min === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate location if provided
    if (lid) {
      const [locationRows] = await pool.query("SELECT lid FROM locations WHERE lid = ?", [lid]);
      if (locationRows.length === 0) {
        return res.status(400).json({ message: "Invalid location selected" });
      }
    }

    // Validate qualification if provided
    if (qualification_id) {
      const [qualificationRows] = await pool.query("SELECT qualification_id FROM qualification WHERE qualification_id = ?", [qualification_id]);
      if (qualificationRows.length === 0) {
        return res.status(400).json({ message: "Invalid qualification selected" });
      }
    }

    // Validate market if provided
    if (marketid) {
      const [marketRows] = await pool.query("SELECT mid FROM markets WHERE mid = ?", [marketid]);
      if (marketRows.length === 0) {
        return res.status(400).json({ message: "Invalid market selected" });
      }
    }

    // Salary parsing and validation
    const parsedSalaryMin = parseInt(salary_min);
    const parsedSalaryMax = salary_max ? parseInt(salary_max) : null;

    if (isNaN(parsedSalaryMin) || parsedSalaryMin < 1000) {
      return res.status(400).json({ message: "Invalid minimum salary amount" });
    }

    if (parsedSalaryMax && parsedSalaryMax < parsedSalaryMin) {
      return res.status(400).json({ message: "Maximum salary cannot be less than minimum salary" });
    }

    // Insert query with updated field names
    const [result] = await pool.query(
      `INSERT INTO jobs (
        uid, cid, lid, custom_title, bigDescription, smallDescription, 
        posted, job_type, mode_of_work, experience_min, experience_max,
        salary_min, salary_max, equity_min, equity_max, opening,
        qualification_id, marketid, skillids
      ) VALUES (?, ?, ?, ?, ?, ?, CURDATE(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uid,
        cid,
        lid,
        custom_title,
        bigDescription,
        smallDescription,
        job_type,
        mode_of_work,
        experience_min || 0,
        experience_max || 0,
        parsedSalaryMin,
        parsedSalaryMax,
        equity_min || 0,
        equity_max || 0,
        opening || 1,
        qualification_id || null,
        marketid || null,
        JSON.stringify(skillids)
      ]
    );

    res.status(201).json({
      success: true,
      message: "Job posted successfully",
      jobid: result.insertId,
      job: {
        jobid: result.insertId,
        custom_title,
        bigDescription,
        smallDescription,
        job_type,
        mode_of_work,
        experience_min: experience_min || 0,
        experience_max: experience_max || 0,
        salary_min: parsedSalaryMin,
        salary_max: parsedSalaryMax,
        equity_min: equity_min || 0,
        equity_max: equity_max || 0,
        opening: opening || 1,
        qualification_id: qualification_id || null,
        marketid: marketid || null,
        skillids,
        lid,
        cid,
        uid,
        posted: new Date().toISOString().split("T")[0]
      }
    });

  } catch (err) {
    console.error("Create job error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
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

// 
exports.getRecommendedJobs = async (req, res) => {
  const uid = req.user?.id;
  if (!uid) {
    return res
      .status(401)
      .json({ message: "Unauthorized: User not authenticated" });
  }

  try {
    const [skillRows] = await pool.query(
      `SELECT skillid FROM applicant_skills WHERE uid = ?`,
      [uid]
    );

    if (skillRows.length === 0) {
      return res.status(404).json({ message: "No skills found for the user" });
    }

    const skillIds = skillRows.map((row) => row.skillid);
    const placeholders = skillIds
      .map(() => "JSON_CONTAINS(skillids, JSON_ARRAY(?))")
      .join(" OR ");

    const [jobs] = await pool.query(
      `SELECT * FROM jobs WHERE ${placeholders} ORDER BY posted DESC`,
      skillIds
    );

    for (let job of jobs) {
      const [locationData] = await pool.query(
        `SELECT lname FROM locations WHERE lid = ?`,
        [job.lid]
      );

      const [companyData] = await pool.query(
        `SELECT name, location, status, tags, type FROM company WHERE cid = ?`,
        [job.cid]
      );

      job.location = locationData[0]?.lname || null;
      job.company = companyData[0] || null;
    }

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




exports.getTotalJobsByRecruiter = async (req, res) => {
  console.log("Fetching job statistics by recruiter...");
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

    // Get recruiter's job statistics
    const [recruiterStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_jobs,
        COUNT(*) as active_jobs, -- All jobs are active for now
        COUNT(CASE WHEN posted >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH) THEN 1 END) as jobs_this_month,
        COUNT(CASE WHEN posted >= DATE_SUB(CURDATE(), INTERVAL 2 MONTH) AND posted < DATE_SUB(CURDATE(), INTERVAL 1 MONTH) THEN 1 END) as jobs_last_month
      FROM jobs 
      WHERE uid = ?
    `, [uid]);

    // Get global platform statistics for comparison
    const [globalStats] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM recruiters) as total_recruiters
    `);

    const stats = recruiterStats[0];
    const global = globalStats[0];

    // Calculate percentage changes
    const jobsChange = stats.jobs_last_month > 0 
      ? Math.round(((stats.jobs_this_month - stats.jobs_last_month) / stats.jobs_last_month) * 100)
      : stats.jobs_this_month > 0 ? 100 : 0;

    const response = {
      stats: {
        total_jobs: stats.total_jobs,
        jobs_this_month: stats.jobs_this_month,
        total_recruiters: global.total_recruiters, // Global metric
        active_jobs: stats.active_jobs,
        
        // Percentage changes
        jobs_change: 12, // Mock for total jobs
        jobs_this_month_change: jobsChange,
        platform_growth: 15, // Mock global platform growth
        active_jobs_change: 5 // Mock for active jobs
      }
    };

    res.status(200).json(response);

  } catch (err) {
    console.error("Error fetching job statistics:", err);
    res.status(500).json({ error: err.message });
  }
};


// stats for pie chart 

exports.Piechart = async (req, res) => {
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
    
    if (!uid) {
      return res.status(400).json({
        success: false,
        message: 'Recruiter UID is required'
      });
    }
    
    const query = `
      SELECT 
        a.status,
        COUNT(*) as count
      FROM applications a
      INNER JOIN jobs j ON a.jobid = j.jobid
      WHERE j.uid = ?
      GROUP BY a.status
    `;
    
    // Execute the query
    const results = await pool.query(query, [uid]);
    
    // Initialize stats with default values
    let stats = {
      accepted: 0,
      rejected: 0,
      pending: 0
    };
    
    // Process results and populate stats
    results[0].forEach(row => {
      stats[row.status] = parseInt(row.count);
    });
    
    // Return the stats
    return res.status(200).json({
      success: true,
      accepted: stats.accepted,
      rejected: stats.rejected,
      pending: stats.pending
    });
    
  } catch (error) {
    console.error('Error fetching application stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

