const pool = require("../config/db");

exports.skills = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM skills");

    if (!rows)
      return res
        .status(401)
        .json({ success: false, message: "No skills in database", skills: [] });

    res.json({
      success: true,
      message: "Total skills fetched successfully",
      skills: rows.map((row) => [row.skillid, row.skillName]),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, skills: [] });
  }
};

exports.countApplicantSkills = async (req, res) => {
  let skillJSON = {};
  let topSkills = [];
  let leastSkills = [];
  let topCount = 0;
  let leastCount = Infinity;
  let threshold = 10;

  try {
    const [rows] = await pool.query("SELECT * FROM skills");

    const skills = rows.map((row) => [row.skillid, row.skillName]);
    const skillObject = Object.fromEntries(skills);

    for (const [skillid, skillName] of Object.entries(skillObject)) {
      const [count] = await pool.query(
        `SELECT COUNT(*) AS total_applicants FROM applicant_skills WHERE skillid = ?`,
        [skillid]
      );

      skillJSON[skillName] = count[0].total_applicants;

      const applicantCount = count[0].total_applicants;

      if (applicantCount > topCount) {
        topSkills = [{ name: skillName, count: applicantCount }];
        topCount = applicantCount;
      } else if (applicantCount === topCount) {
        topSkills.push({ name: skillName, count: applicantCount });
      }

      if (applicantCount < leastCount) {
        leastSkills = [{ name: skillName, count: applicantCount }];
        leastCount = applicantCount;
      } else if (applicantCount === leastCount) {
        leastSkills.push({ name: skillName, count: applicantCount });
      }
    }

    topSkills = topSkills.sort((a, b) => b.count - a.count).slice(0, threshold);
    leastSkills = leastSkills
      .sort((a, b) => a.count - b.count)
      .slice(0, threshold);

    const sortedSkills = Object.entries(skillJSON)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);
    const result = Object.fromEntries(sortedSkills);

    res.status(200).json({
      success: true,
      message: "Counted applicants successfully",
      data: result,
      topSkills,
      leastSkills,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
      data: {},
      topSkills: [],
      leastSkills: [],
    });
  }
};

exports.countJobsSkills = async (req, res) => {
  let skillJSON = {};
  let ResponseJSON = {};
  let topSkills = [];
  let leastSkills = [];
  let topCount = 0;
  let leastCount = Infinity;
  let threshold = 10;

  try {
    const [jobRows] = await pool.query("SELECT jobid, skillids FROM jobs");
    const [skillRows] = await pool.query(
      "SELECT skillid, skillName FROM skills"
    );

    for (const skill of skillRows) {
      skillJSON[skill.skillid] = skill.skillName;
    }

    for (const job of jobRows) {
      const parsedSkillIds = job.skillids;
      for (const skillid of parsedSkillIds) {
        ResponseJSON[skillid] = (ResponseJSON[skillid] || 0) + 1;
      }
    }

    const result = {};
    for (const [skillid, skillName] of Object.entries(skillJSON)) {
      const count = ResponseJSON[skillid] || 0;
      result[skillName] = count;

      if (count > topCount) {
        topSkills = [{ name: skillName, count }];
        topCount = count;
      } else if (count === topCount) {
        topSkills.push({ name: skillName, count });
      }

      if (count < leastCount) {
        leastSkills = [{ name: skillName, count }];
        leastCount = count;
      } else if (count === leastCount) {
        leastSkills.push({ name: skillName, count });
      }
    }

    topSkills = topSkills.sort((a, b) => b.count - a.count).slice(0, threshold);
    leastSkills = leastSkills
      .sort((a, b) => a.count - b.count)
      .slice(0, threshold);

    const sortedSkills = Object.entries(result)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15);
    const finalResult = Object.fromEntries(sortedSkills);

    return res.json({
      success: true,
      message: "Counted successfully",
      data: finalResult,
      topSkills,
      leastSkills,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
      data: {},
      topSkills: [],
      leastSkills: [],
    });
  }
};
