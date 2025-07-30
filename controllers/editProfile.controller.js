const pool = require("../config/db");

// ------------------ GET FULL PROFILE ------------------
exports.getUserProfile = async (req, res) => {
  const { uid } = req;

  try {
    const [userResult] = await pool.query("SELECT name, phone, email FROM users WHERE uid = ?", [uid]);
    const user = userResult[0];

    if (!user) return res.status(404).json({ message: "User not found" });

    const [educationResult] = await pool.query("SELECT * FROM education WHERE uid = ?", [uid]);
    const [skillsResult] = await pool.query(
      `SELECT s.skillid, s.skillName FROM applicant_skills a
       JOIN skills s ON a.skillid = s.skillid WHERE a.uid = ?`, [uid]
    );
    const [experienceResult] = await pool.query("SELECT * FROM experience WHERE uid = ?", [uid]);

    res.status(200).json({
      profile: {
        user,
        education: educationResult,
        skills: skillsResult,
        experience: experienceResult
      }
    });

  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile", details: err.message });
  }
};


exports.patchUserProfile = async (req, res) => {
  const { uid } = req;
  const { user, education, skills, experience } = req.body;

  try {
    // 1. Update user info
    if (user) {
      const { name, phone } = user;
      await pool.query("UPDATE users SET name = ?, phone = ? WHERE uid = ?", [name, phone, uid]);
    }

    // 2. Update or insert education
    if (education) {
      const [existing] = await pool.query("SELECT eid FROM education WHERE uid = ?", [uid]);

      if (existing.length > 0) {
        await pool.query(
          `UPDATE education SET degree=?, institution=?, field_of_study=?, start_date_degree=?, end_date_degree=?, grade_value=?, grade_type=?, education_level=? WHERE uid=?`,
          [
            education.degree, education.institution, education.field_of_study,
            education.start_date_degree, education.end_date_degree,
            education.grade_value, education.grade_type, education.education_level, uid
          ]
        );
      } else {
        await pool.query(
          `INSERT INTO education (uid, degree, institution, field_of_study, start_date_degree, end_date_degree, grade_value, grade_type, education_level)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            uid, education.degree, education.institution, education.field_of_study,
            education.start_date_degree, education.end_date_degree,
            education.grade_value, education.grade_type, education.education_level
          ]
        );
      }
    }

    // 3. Update skills
    if (skills) {
      await pool.query("DELETE FROM applicant_skills WHERE uid = ?", [uid]);
      if (skills.length > 0) {
        const skillValues = skills.map(skillId => [uid, skillId]);
        await pool.query("INSERT INTO applicant_skills (uid, skillid) VALUES ?", [skillValues]);
      }
    }

    // 4. Update/Insert experiences
    if (experience) {
      for (const exp of experience) {
        if (exp.expid) {
          await pool.query(
            `UPDATE experience SET expName=?, role=?, start=?, end=?, resume=? WHERE expid=? AND uid=?`,
            [exp.expName, exp.role, exp.start, exp.end, exp.resume, exp.expid, uid]
          );
        } else {
          await pool.query(
            `INSERT INTO experience (uid, expName, role, start, end, resume) VALUES (?, ?, ?, ?, ?, ?)`,
            [uid, exp.expName, exp.role, exp.start, exp.end, exp.resume]
          );
        }
      }
    }

    res.status(200).json({ message: "Profile updated successfully." });

  } catch (err) {
    res.status(500).json({ error: "Failed to update profile", details: err.message });
  }
};
