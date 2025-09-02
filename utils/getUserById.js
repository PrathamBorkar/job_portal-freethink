const pool = require("../config/db");

async function getUserById(uid) {
  const [userRows] = await pool.query("SELECT * FROM users WHERE uid = ?", [
    uid,
  ]);
  const user = userRows[0];

  if (!user) {
    return null;
  }

  let appData = null;
  let eduData = null;
  let expData = null;
  let appSkillData = [];

  if (user.role === "recruiter") {
    const [companyData] = await pool.query(
      `SELECT c.* FROM recruiters r
      JOIN company c ON r.cid = c.cid
      WHERE r.uid = ?`,
      [user.uid]
    );
    return { user, recruiterInfo: companyData[0] || null };
  } else {
    const [appRow] = await pool.query(
      "SELECT employmentStatus, jobType, preferredLocation, availability, linkedIn, portfolioWebsite FROM applicants WHERE uid = ?",
      [user.uid]
    );
    const [eduRow] = await pool.query("SELECT * FROM education WHERE uid = ?", [
      user.uid,
    ]);
    const [expRow] = await pool.query(
      "SELECT * FROM experience WHERE uid = ?",
      [user.uid]
    );
    const [appSkillRows] = await pool.query(
      "SELECT skillid FROM applicant_skills WHERE uid = ?",
      [user.uid]
    );

    appData = appRow[0];
    eduData = eduRow[0];
    expData = expRow[0];

    for (const appSkill of appSkillRows) {
      appSkillData.push(appSkill.skillid);
    }

    return {
      user,
      appData,
      eduData,
      expData,
      appSkillData,
    };
  }
}

module.exports = getUserById;
