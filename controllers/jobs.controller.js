const e = require("express");
const pool = require("../config/db");

// ✅ Create Job (for recruiter)
exports.createJob = async (req, res) => {
  console.log("Creating job with data:", req.body);
  try {
    const {
      lid,
      title,
      bigDescription,
      smallDescription,
      job_type,
      mode_of_work,
      experience_min,
      experience_max,
      salary_min,
      salary_max,
      equity_min,
      equity_max,
      opening,
      qualification,
      job_markets,
      job_roles,
      skillids,
    } = req.body;

    const userEmail = req.user?.email;

    if (!userEmail) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Recruiter not authenticated" });
    }

    const [userRows] = await pool.query(
      "SELECT uid FROM users WHERE email = ?",
      [userEmail]
    );

    if (userRows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const uid = userRows[0].uid;

    const [companyRows] = await pool.query(
      "SELECT cid FROM recruiters WHERE uid = ?",
      [uid]
    );

    if (companyRows.length === 0) {
      return res
        .status(400)
        .json({ message: "Company not found for this user" });
    }

    const cid = companyRows[0].cid;

    // Validation
    if (
      !title ||
      !job_type ||
      !mode_of_work ||
      experience_min === undefined ||
      experience_max === undefined ||
      salary_min === undefined ||
      salary_max === undefined
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate location if provided - FIX: Use 'lid' instead of 'id'
    if (lid) {
      const [locationRows] = await pool.query(
        "SELECT lid FROM locations WHERE lid = ?",
        [lid]
      );
      if (locationRows.length === 0) {
        return res.status(400).json({ message: "Invalid location selected" });
      }
    }

    const [result] = await pool.query(
      `INSERT INTO jobs (
        uid, 
        cid, 
        lid,
      title,
      bigDescription,
      smallDescription,
      job_type,
      mode_of_work,
      experience_min,
      experience_max,
      salary_min,
      salary_max,
      equity_min,
      equity_max,
      opening,
      qualification,
      job_markets,
      job_roles,
      skillids,
        posted
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())`,
      [
        uid,
        cid,
        lid,
        title,
        bigDescription,
        smallDescription,
        job_type,
        mode_of_work,
        experience_min,
        experience_max,
        salary_min,
        salary_max,
        equity_min,
        equity_max,
        opening,
        qualification,
        JSON.stringify(job_markets),
        JSON.stringify(job_roles),
        JSON.stringify(skillids),
      ]
    );

    res.status(201).json({
      success: true,
      message: "Job posted successfully",
      jobid: result.insertId,
      job: {
        jobid: result.insertId,
        uid,
        cid,
        lid,
        title,
        bigDescription,
        smallDescription,
        job_type,
        mode_of_work,
        experience_min,
        experience_max,
        salary_min,
        salary_max,
        equity_min,
        equity_max,
        opening,
        qualification,
        job_markets,
        job_roles,
        skillids,
        posted: new Date().toISOString().split("T")[0],
      },
    });
  } catch (err) {
    console.error("Create job error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Something went wrong",
    });
  }
};

exports.updateOneJob = async (req, res) => {
  try {
    const {
      jobid,
      uid,
      title,
      bigDescription,
      posted,
      popularity_score,
      job_type,
      mode_of_work,
      salary_min,
      salary_max,
      equity_min,
      equity_max,
      experience_min,
      experience_max,
      skillids,
      lid,
      cid,
      smallDescription,
      qualification,
      opening,
    } = req.body;

    // Convert skillids array to JSON string
    const skillidsJson = JSON.stringify(skillids);
    const newPosted = posted.split("T")[0];

    // Prepare update query
    const [result] = await pool.query(
      `UPDATE jobs SET
        uid = ?,
        title = ?,
        bigDescription = ?,
        posted = ?,
        popularity_score = ?,
        job_type = ?,
        mode_of_work = ?,
        experience_min = ?,
        experience_max  = ?,
        salary_min  = ?,
        salary_max  = ?,
        equity_min = ?,
        equity_max = ?,
        skillids = ?,
        lid = ?,
        cid = ?,
        smallDescription = ?,
        qualification = ?,
        opening = ?
      WHERE jobid = ?`,
      [
        uid,
        title,
        bigDescription,
        newPosted,
        popularity_score,
        job_type,
        mode_of_work,
        experience_min,
        experience_max,
        salary_min,
        salary_max,
        equity_min,
        equity_max,
        skillidsJson,
        lid,
        cid,
        smallDescription,
        qualification,
        opening,
        jobid,
      ]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Job not found or no changes made" });
    }

    res.status(200).json({ message: "Job updated successfully" });
  } catch (err) {
    console.error("Error updating job:", err);
    res
      .status(500)
      .json({ message: "Internal Server Error", details: err.message });
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

    // Enhanced JSON search condition
    const skillConditions = skillIds
      .map(() => `JSON_CONTAINS(skillids, CAST(? AS JSON), '$')`)
      .join(" OR ");

    console.log("Fetching jobs matching user skills...");
    const [jobs] = await pool.query(
      `SELECT
        j.jobid,
        j.uid,
        j.title,
        j.bigDescription,
        j.posted,
        j.popularity_score,
        j.job_type,
        j.mode_of_work,
        j.opening,
        j.cid AS company_id,
        j.salary_min,
        j.salary_max,
        j.experience_min,
        j.experience_max,
        j.skillids,
        j.job_roles,
        j.lid,
        j.job_markets,
        j.qualification,
        j.smallDescription,
        j.equity_min,
        j.equity_max,
        
        c.name AS company_name,
        c.companySize,
        c.type AS company_type,
        c.tags AS company_tags,
        c.status AS company_status,
        c.CEO AS company_ceo,
        
        l.lname AS location_name
      FROM jobs j
      LEFT JOIN company c ON j.cid = c.cid
      LEFT JOIN locations l ON j.lid = l.lid
      WHERE ${skillConditions}
      ORDER BY j.posted DESC`,
      skillIds.map((id) => JSON.stringify(id))
    );

    console.log(`Found ${jobs.length} job(s) matching the skills.`);

    // Enhanced JSON parsing function
    const parseField = (field) => {
      if (!field) return [];
      if (Array.isArray(field)) return field;
      if (typeof field === "string") {
        try {
          const parsed = JSON.parse(field);
          return Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          if (field.includes(",")) {
            return field
              .split(",")
              .map((item) => item.trim())
              .filter((item) => item && !isNaN(item))
              .map(Number);
          }
          if (!isNaN(field)) return [Number(field)];
          return [];
        }
      }
      return [field];
    };

    // Process jobs to match getJobs format
    const processedJobs = jobs.map((job) => ({
      jobid: job.jobid,
      uid: job.uid,
      custom_title: job.title,
      bigDescription: job.bigDescription,
      posted: job.posted,
      popularity_score: job.popularity_score,
      job_type: job.job_type,
      mode_of_work: job.mode_of_work,
      opening: job.opening,
      company_id: job.company_id,
      salary_min: job.salary_min,
      salary_max: job.salary_max,
      experience_min: job.experience_min,
      experience_max: job.experience_max,
      smallDescription: job.smallDescription,
      equity_min: job.equity_min,
      equity_max: job.equity_max,
      company_name: job.company_name,
      companySize: job.companySize,
      company_type: job.company_type,
      company_tags: job.company_tags,
      company_status: job.company_status,
      company_ceo: job.company_ceo,
      job_roles: parseField(job.job_roles).join(","),
      markets: parseField(job.job_markets).join(","),
      locations: job.location_name || "",
      skills: parseField(job.skillids).join(","),
      qualification_name: job.qualification,
    }));

    console.log("Final recommended jobs prepared in getJobs format.");
    res.status(200).json({
      success: true,
      jobs: processedJobs,
    });
  } catch (err) {
    console.error("Error in getRecommendedJobs:", err);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: err.message,
    });
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

exports.getTotalJobsByRecruiter = async (req, res) => {
  console.log("Fetching job statistics by recruiter...");
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

    // Get recruiter's job statistics
    const [recruiterStats] = await pool.query(
      `
      SELECT 
        COUNT(*) as total_jobs,
        COUNT(*) as active_jobs, -- All jobs are active for now
        COUNT(CASE WHEN posted >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH) THEN 1 END) as jobs_this_month,
        COUNT(CASE WHEN posted >= DATE_SUB(CURDATE(), INTERVAL 2 MONTH) AND posted < DATE_SUB(CURDATE(), INTERVAL 1 MONTH) THEN 1 END) as jobs_last_month
      FROM jobs 
      WHERE uid = ?
    `,
      [uid]
    );

    // Get global platform statistics for comparison
    const [globalStats] = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM recruiters) as total_recruiters
    `);

    const stats = recruiterStats[0];
    const global = globalStats[0];

    // Calculate percentage changes
    const jobsChange =
      stats.jobs_last_month > 0
        ? Math.round(
            ((stats.jobs_this_month - stats.jobs_last_month) /
              stats.jobs_last_month) *
              100
          )
        : stats.jobs_this_month > 0
        ? 100
        : 0;

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
        active_jobs_change: 5, // Mock for active jobs
      },
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

    if (!uid) {
      return res.status(400).json({
        success: false,
        message: "Recruiter UID is required",
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
      pending: 0,
    };

    // Process results and populate stats
    results[0].forEach((row) => {
      stats[row.status] = parseInt(row.count);
    });

    // Return the stats
    return res.status(200).json({
      success: true,
      accepted: stats.accepted,
      rejected: stats.rejected,
      pending: stats.pending,
    });
  } catch (error) {
    console.error("Error fetching application stats:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getFilters = async (req, res) => {
  try {
    const queries = {
      jobRoles: "SELECT rid as job_role_id, roleName as role_name FROM roles",
      markets: "SELECT mid, mname FROM markets",
      locations: "SELECT lid, lname FROM locations",
      skills: "SELECT skillid, skillName as skill_name FROM skills",
      companies: "SELECT cid, name FROM company",
    };

    const runQuery = async (sql, labelKey, valueKey) => {
      const [rows] = await pool.query(sql);
      console.log(`Fetched ${rows.length} rows for ${labelKey}`);
      return rows.map((item) => ({
        label: item[labelKey],
        value: item[valueKey],
      }));
    };

    const [jobRoles, markets, locations, skills, companies] = await Promise.all(
      [
        runQuery(queries.jobRoles, "role_name", "job_role_id"),
        runQuery(queries.markets, "mname", "mid"),
        runQuery(queries.locations, "lname", "lid"),
        runQuery(queries.skills, "skill_name", "skillid"),
        runQuery(queries.companies, "name", "cid"),
      ]
    );

    res.json({
      success: true,
      jobRoles,
      markets,
      locations,
      skills,
      companies,
    });
  } catch (err) {
    console.error("Error fetching filters:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch filters",
      jobRoles: [],
      markets: [],
      locations: [],
      skills: [],
      companies: [],
    });
  }
};
// controllers/companyJobsController.js

exports.getCompanyJobs = async (req, res) => {
  try {
    const companyId = req.query.companyId; // ✅ matches frontend

    if (!companyId) {
      return res
        .status(400)
        .json({ success: false, error: "Company ID is required" });
    }

    console.log("🟠 Fetching jobs for company:", companyId);

    // Base query
    let sql = `
      SELECT
        j.jobid,
        j.uid,
        j.title,
        j.bigDescription,
        j.posted,
        j.popularity_score,
        j.job_type,
        j.mode_of_work,
        j.opening,
        j.cid AS company_id,
        j.salary_min,
        j.salary_max,
        j.experience_min,
        j.experience_max,
        j.skillids,
        j.job_roles,
        j.lid,
        j.job_markets,
        j.smallDescription,
        j.equity_min,
        j.equity_max,
        j.qualification,
        c.name AS company_name,
        c.companySize,
        c.type AS company_type,
        c.tags AS company_tags,
        c.status AS company_status,
        c.CEO AS company_ceo,
        l.lname AS location_name
      FROM jobs j
      LEFT JOIN company c ON j.cid = c.cid
      LEFT JOIN locations l ON j.lid = l.lid
      WHERE j.cid = ?
      ORDER BY j.posted DESC
    `;

    const [rows] = await pool.query(sql, [companyId]);

    // Helper to parse JSON fields
    const parseField = (field) => {
      if (!field) return [];
      if (Array.isArray(field)) return field;
      if (typeof field === "string") {
        try {
          const parsed = JSON.parse(field);
          return Array.isArray(parsed) ? parsed : [parsed];
        } catch (e) {
          return field.includes(",")
            ? field.split(",").map((s) => s.trim())
            : [field];
        }
      }
      return [field];
    };

    // Process jobs
    const processedJobs = rows.map((job) => ({
      jobid: job.jobid,
      uid: job.uid,
      custom_title: job.title,
      bigDescription: job.bigDescription,
      posted: job.posted,
      popularity_score: job.popularity_score,
      job_type: job.job_type,
      mode_of_work: job.mode_of_work,
      opening: job.opening,
      company_id: job.company_id,
      salary_min: job.salary_min,
      salary_max: job.salary_max,
      experience_min: job.experience_min,
      experience_max: job.experience_max,
      smallDescription: job.smallDescription,
      equity_min: job.equity_min,
      equity_max: job.equity_max,
      qualification: job.qualification,
      company_name: job.company_name,
      companySize: job.companySize,
      company_type: job.company_type,
      company_tags: job.company_tags,
      company_status: job.company_status,
      company_ceo: job.company_ceo,
      job_roles: parseField(job.job_roles).join(","),
      markets: parseField(job.job_markets).join(","),
      locations: job.location_name || "",
      skills: parseField(job.skillids).join(","),
    }));

    res.json({ success: true, jobs: processedJobs });
  } catch (error) {
    console.error("❌ Error fetching company jobs:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

exports.getJobs = async (req, res) => {
  try {
    console.log("🟠 Received filters (raw req.query):", req.query);

    const whereClauses = [];
    const params = [];

    // Helpers
    const parseArrayFilter = (filter) => {
      if (!filter) return [];
      return typeof filter === "string" ? filter.split(",") : filter;
    };

    const parseNumericArrayFilter = (filter) => {
      return parseArrayFilter(filter)
        .map(Number)
        .filter((n) => !isNaN(n));
    };

    // Parse filters
    const jobRoles = parseNumericArrayFilter(req.query.jobRoles);
    const preferredLocations = parseNumericArrayFilter(
      req.query.preferredLocations
    );
    const skills = parseNumericArrayFilter(req.query.skills);
    const markets = parseNumericArrayFilter(req.query.markets);
    const companies = parseNumericArrayFilter(req.query.companies);
    const companySizes = parseArrayFilter(req.query.companySizes);
    const jobTypes = parseArrayFilter(req.query.jobTypes);
    const companyTypes = parseArrayFilter(req.query.companyTypes);
    const modeOfWork = parseArrayFilter(
      req.query.mode_of_work || req.query.jobMode
    );
    const educations = parseArrayFilter(req.query.educations);

    const equityMin = req.query.equityMin ? Number(req.query.equityMin) : null;
    const equityMax = req.query.equityMax ? Number(req.query.equityMax) : null;
    const salaryMin = req.query.salaryMin ? Number(req.query.salaryMin) : null;
    const salaryMax = req.query.salaryMax ? Number(req.query.salaryMax) : null;
    const experienceMin = req.query.experienceMin
      ? Number(req.query.experienceMin)
      : null;
    const experienceMax = req.query.experienceMax
      ? Number(req.query.experienceMax)
      : null;

    // ✅ Pagination params
    const limit = parseInt(req.query.limit) || 4;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    console.log("🟢 Parsed filters:", {
      jobRoles,
      preferredLocations,
      skills,
      markets,
      companies,
      companySizes,
      jobTypes,
      companyTypes,
      modeOfWork,
      educations,
      salaryMin,
      salaryMax,
      experienceMin,
      experienceMax,
      equityMin,
      equityMax,
      page,
      limit,
      offset,
    });

    // WHERE clauses
    if (companyTypes.length > 0) {
      const orConditions = companyTypes
        .map(() => `JSON_CONTAINS(c.type, ?, '$')`)
        .join(" OR ");
      whereClauses.push(`(${orConditions})`);
      params.push(...companyTypes.map((type) => JSON.stringify(type)));
    }

    if (jobRoles.length > 0) {
      const orConditions = jobRoles
        .map(() => `JSON_CONTAINS(j.job_roles, ?, '$')`)
        .join(" OR ");
      whereClauses.push(`(${orConditions})`);
      params.push(...jobRoles.map((id) => id.toString()));
    }

    if (preferredLocations.length > 0) {
      const placeholders = preferredLocations.map(() => "?").join(", ");
      whereClauses.push(`j.lid IN (${placeholders})`);
      params.push(...preferredLocations);
    }

    if (salaryMin !== null && salaryMax !== null) {
      whereClauses.push(`(j.salary_max >= ? AND j.salary_min <= ?)`);
      params.push(salaryMin, salaryMax);
    } else if (salaryMin !== null) {
      whereClauses.push(`j.salary_max >= ?`);
      params.push(salaryMin);
    } else if (salaryMax !== null) {
      whereClauses.push(`j.salary_min <= ?`);
      params.push(salaryMax);
    }

    if (experienceMin !== null && experienceMax !== null) {
      whereClauses.push(`(j.experience_max >= ? AND j.experience_min <= ?)`);
      params.push(experienceMin, experienceMax);
    } else if (experienceMin !== null) {
      whereClauses.push(`j.experience_max >= ?`);
      params.push(experienceMin);
    } else if (experienceMax !== null) {
      whereClauses.push(`j.experience_min <= ?`);
      params.push(experienceMax);
    }

    if (equityMin !== null && equityMax !== null) {
      whereClauses.push(`(j.equity_max >= ? AND j.equity_min <= ?)`);
      params.push(equityMin, equityMax);
    } else if (equityMin !== null) {
      whereClauses.push(`j.equity_max >= ?`);
      params.push(equityMin);
    } else if (equityMax !== null) {
      whereClauses.push(`j.equity_min <= ?`);
      params.push(equityMax);
    }

    if (skills.length > 0) {
      const orConditions = skills
        .map(() => `JSON_CONTAINS(j.skillids, ?, '$')`)
        .join(" OR ");
      whereClauses.push(`(${orConditions})`);
      params.push(...skills.map((id) => id.toString()));
    }

    if (markets.length > 0) {
      const orConditions = markets
        .map(() => `JSON_CONTAINS(j.job_markets, ?, '$')`)
        .join(" OR ");
      whereClauses.push(`(${orConditions})`);
      params.push(...markets.map((id) => id.toString()));
    }

    if (companies.length > 0) {
      const placeholders = companies.map(() => "?").join(", ");
      whereClauses.push(`c.cid IN (${placeholders})`);
      params.push(...companies);
    }

    if (companySizes.length > 0) {
      const placeholders = companySizes.map(() => "?").join(", ");
      whereClauses.push(`c.companySize IN (${placeholders})`);
      params.push(...companySizes);
    }

    if (jobTypes.length > 0) {
      const placeholders = jobTypes.map(() => "?").join(", ");
      whereClauses.push(`j.job_type IN (${placeholders})`);
      params.push(...jobTypes);
    }

    if (modeOfWork.length > 0) {
      const placeholders = modeOfWork.map(() => "?").join(", ");
      whereClauses.push(`j.mode_of_work IN (${placeholders})`);
      params.push(...modeOfWork);
    }

    if (educations.length > 0) {
      const placeholders = educations.map(() => "?").join(", ");
      whereClauses.push(`j.qualification IN (${placeholders})`);
      params.push(...educations);
    }

    // Base SQL
    let sql = `
      SELECT
        j.jobid,
        j.uid,
        j.title,
        j.bigDescription,
        j.posted,
        j.popularity_score,
        j.job_type,
        j.mode_of_work,
        j.opening,
        j.cid AS company_id,
        j.salary_min,
        j.salary_max,
        j.experience_min,
        j.experience_max,
        j.skillids,
        j.job_roles,
        j.lid,
        j.job_markets,
        j.smallDescription,
        j.equity_min,
        j.equity_max,
        j.qualification,
        c.name AS company_name,
        c.companySize,
        c.type AS company_type,
        c.tags AS company_tags,
        c.status AS company_status,
        c.CEO AS company_ceo,
        l.lname AS location_name
      FROM jobs j
      LEFT JOIN company c ON j.cid = c.cid
      LEFT JOIN locations l ON j.lid = l.lid
    `;

    if (whereClauses.length > 0) {
      sql += " WHERE " + whereClauses.join(" AND ");
    }

    // ✅ Count total before pagination
    const countSql = `
      SELECT COUNT(*) AS totalCount
      FROM jobs j
      LEFT JOIN company c ON j.cid = c.cid
      LEFT JOIN locations l ON j.lid = l.lid
      ${whereClauses.length > 0 ? " WHERE " + whereClauses.join(" AND ") : ""}
    `;
    const filterParams = [...params]; // copy filters only
    const [countRows] = await pool.query(countSql, filterParams);
    const totalCount = countRows[0].totalCount;

    // ✅ Pagination
    sql += " ORDER BY j.posted DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    console.log("📝 Final SQL:", sql);
    console.log("📦 Query Params:", params);

    const [rows] = await pool.query(sql, params);

    // Parse JSON-ish fields
    const parseField = (field) => {
      if (!field) return [];
      if (Array.isArray(field)) return field;
      if (typeof field === "string") {
        try {
          const parsed = JSON.parse(field);
          return Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          if (field.includes(",")) {
            return field
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean);
          }
          return [field];
        }
      }
      return [field];
    };

    const processedJobs = rows.map((job) => {
      const skillIds = parseField(job.skillids);
      const roleIds = parseField(job.job_roles);
      const marketIds = parseField(job.job_markets);

      return {
        jobid: job.jobid,
        uid: job.uid,
        custom_title: job.title,
        bigDescription: job.bigDescription,
        posted: job.posted,
        popularity_score: job.popularity_score,
        job_type: job.job_type,
        mode_of_work: job.mode_of_work,
        opening: job.opening,
        company_id: job.company_id,
        salary_min: job.salary_min,
        salary_max: job.salary_max,
        experience_min: job.experience_min,
        experience_max: job.experience_max,
        smallDescription: job.smallDescription,
        equity_min: job.equity_min,
        equity_max: job.equity_max,
        qualification: job.qualification,
        company_name: job.company_name,
        companySize: job.companySize,
        company_type: job.company_type,
        company_tags: job.company_tags,
        company_status: job.company_status,
        company_ceo: job.company_ceo,
        job_roles: roleIds.join(","),
        markets: marketIds.join(","),
        locations: job.location_name || "",
        skills: skillIds.join(","),
      };
    });

    res.json({
      success: true,
      jobs: processedJobs,
      pagination: {
        page,
        limit,
        count: processedJobs.length,
        total: totalCount,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching jobs:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: error.message,
    });
  }
};

exports.getJobDetails = async (req, res) => {
  try {
    const jobid = req.query.jobid;
    console.log(`Received jobid from query param: ${jobid}`);

    if (!jobid) {
      return res.status(400).json({ error: "Missing jobid query parameter" });
    }

    // Main query to fetch job details
    const sqlJobDetails = `
      SELECT
        j.jobid,
        j.uid,
        j.title,
        j.bigDescription,
        j.posted,
        j.popularity_score,
        j.job_type,
        j.mode_of_work,
        j.opening,
        j.cid AS company_id,
        j.salary_min,
        j.salary_max,
        j.experience_min,
        j.experience_max,
        j.smallDescription,
        j.equity_min,
        j.equity_max,
        j.qualification,
        j.skillids,
        j.job_roles,
        j.lid, 
        j.job_markets,
        
        c.name AS company_name,
        c.location AS company_location,
        c.companySize,
        c.tags AS company_tags,
        
        l.lname AS location_name
      FROM jobs j
      LEFT JOIN company c ON j.cid = c.cid
      LEFT JOIN locations l ON j.lid = l.lid
      WHERE j.jobid = ?
    `;

    const [jobDetails] = await pool.query(sqlJobDetails, [jobid]);

    if (jobDetails.length === 0) {
      return res.status(404).json({ error: "Job not found" });
    }

    const job = jobDetails[0];

    let marketNames = [];
    if (job.job_markets) {
      try {
        let marketIds;

        if (Array.isArray(job.job_markets)) {
          marketIds = job.job_markets;
        } else if (typeof job.job_markets === "string") {
          const sanitizedJobMarkets = job.job_markets.trim(); // Trim string
          marketIds = JSON.parse(sanitizedJobMarkets); // Parse it into an array
        }

        if (Array.isArray(marketIds) && marketIds.length > 0) {
          const sqlMarkets = `SELECT mname FROM markets WHERE mid IN (?)`;
          const [marketResults] = await pool.query(sqlMarkets, [marketIds]);
          marketNames = marketResults.map((result) => result.mname);
        }
      } catch (err) {
        console.error("Error parsing job_markets JSON:", err.message);
        return res.status(500).json({
          error: "Error parsing job_markets JSON",
          message: err.message,
        });
      }
    }

    let skillNames = [];
    if (job.skillids) {
      try {
        let skillIds;

        if (Array.isArray(job.skillids)) {
          skillIds = job.skillids;
        } else if (typeof job.skillids === "string") {
          const sanitizedSkillIds = job.skillids.trim(); // Trim string
          skillIds = JSON.parse(sanitizedSkillIds); // Parse it into an array
        }

        if (Array.isArray(skillIds) && skillIds.length > 0) {
          const sqlSkills = `SELECT skillName FROM skills WHERE skillid IN (?)`;
          const [skillResults] = await pool.query(sqlSkills, [skillIds]);
          skillNames = skillResults.map((result) => result.skillName);
        }
      } catch (err) {
        console.error("Error parsing skillids JSON:", err.message);
        return res
          .status(500)
          .json({ error: "Error parsing skillids JSON", message: err.message });
      }
    }

    // Process fields to match original response structure
    const processedJob = {
      jobid: job.jobid,
      uid: job.uid,
      custom_title: job.title,
      bigDescription: job.bigDescription,
      posted: job.posted,
      popularity_score: job.popularity_score,
      job_type: job.job_type,
      mode_of_work: job.mode_of_work,
      opening: job.opening,
      company_id: job.company_id,
      salary_min: job.salary_min,
      salary_max: job.salary_max,
      experience_min: job.experience_min,
      experience_max: job.experience_max,
      smallDescription: job.smallDescription,
      equity_min: job.equity_min,
      equity_max: job.equity_max,
      company_name: job.company_name,
      companySize: job.companySize,
      company_location: job.company_location,
      company_tags: job.company_tags,
      qualification_id: job.qualification,
      qualification_name: job.qualification,
      job_roles: job.job_roles ? job.job_roles.join(",") : "",
      markets: marketNames.join(", "),
      locations: job.location_name || "",
      skills: skillNames.join(", "),
    };

    res.json(processedJob);
  } catch (err) {
    console.error("Error fetching job detail:", err);
    res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
};
