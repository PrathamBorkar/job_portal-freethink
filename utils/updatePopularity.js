const pool = require("../config/db");

const updatePopularityScores = async () => {
  try {
    const [jobs] = await pool.query("SELECT jobid, posted FROM jobs");

    const today = new Date();

    for (const job of jobs) {
      const jobid = job.jobid;
      const posted = new Date(job.posted);
      const daysSincePosted = Math.max(
        1,
        Math.floor((today - posted) / (1000 * 60 * 60 * 24))
      );

      const [result] = await pool.query(
        "SELECT COUNT(*) AS total FROM applications WHERE jobid = ?",
        [jobid]
      );
      const applicants = result[0].total;
      const popularityScore = applicants / daysSincePosted;

      await pool.query("UPDATE jobs SET popularity_score = ? WHERE jobid = ?", [
        popularityScore,
        jobid,
      ]);
    }

    console.log(`[${new Date().toISOString()}] Updated popularity scores`);
  } catch (error) {
    console.log(
      `[${new Date().toISOString()}] ERROR Updating popularity scores\nMESSAGE: ${
        error.message
      }`
    );
  }
};

module.exports = {
  updatePopularityScores,
};
