const pool = require("../config/db");

// POST /jobs - Recruiter posts a new job
exports.createJob = async (req, res) => {
  try {
    const { title, description } = req.body;
    // Assuming req.user.id is set by authentication middleware for recruiter
    const uid = req.user?.id;

    if (!uid) {
      return res.status(401).json({ message: "Unauthorized: Recruiter not authenticated" });
    }
    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const [result] = await pool.query(
      "INSERT INTO jobs (uid, title, description) VALUES (?, ?, ?)",
      [uid, title, JSON.stringify(description)]
    );

    res.status(201).json({ message: "Job posted successfully", jobid: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


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
}

exports.getrecommendedJobs = async (req, res) => {
   const uid = req.user?.id;
    if (!uid) {
        return res.status(401).json({ message: "Unauthorized: User not authenticated" });
    }
    try{
         // Step 1: Get the user's skills
    const [skillsRows] = await conn.query(`
      SELECT s.skillName 
      FROM applicant_skills a
      JOIN skills s ON a.skillid = s.skillid
      WHERE a.uid = ?;
    `, [uid]);
    if (skillsRows.length === 0) {
      return res.status(404).json({ message: "No skills found for the user" });
    }
    const [jobs] = await conn.query(`
      SELECT * FROM jobs
      WHERE ${skillNames.map(() => `JSON_SEARCH(description->'$.requiredSkills', 'one', ?) IS NOT NULL`).join(" OR ")}
    `, skillNames);

    res.status(200).json({ jobs });}
    catch(err){
        return res.status(500).json({ error: err.message });
    }finally {
    conn.release();
  }
};


exports.deleteJobs = async (req, res) => {
    const title = req.params.title;
    const uid = req.user?.id;
    if (!uid) {
        return res.status(401).json({ message: "Unauthorized: Recruiter not authenticated" });
    }
    try {
        const [result] = await pool.query("DELETE FROM jobs WHERE title = ? AND uid = ?", [title, uid]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Job not found or you do not have permission to delete this job" });
        }

        res.status(200).json({ message: "Job deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

};
