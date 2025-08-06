const pool = require("../config/db");
const { skills } = require("./skill.controller");

// ------------------ GET FULL PROFILE ------------------
exports.getUserProfile = async (req, res) => {
  const { uid } = req;

  try {
    const [userResult] = await pool.query(
      "SELECT name, phone, email FROM users WHERE uid = ?",
      [uid]
    );
    const user = userResult[0];

    if (!user) return res.status(404).json({ message: "User not found" });

    const [educationResult] = await pool.query(
      "SELECT * FROM education WHERE uid = ?",
      [uid]
    );
    const [skillsResult] = await pool.query(
      `SELECT s.skillid, s.skillName FROM applicant_skills a
       JOIN skills s ON a.skillid = s.skillid WHERE a.uid = ?`,
      [uid]
    );
    const [experienceResult] = await pool.query(
      "SELECT * FROM experience WHERE uid = ?",
      [uid]
    );

    res.status(200).json({
      profile: {
        user,
        education: educationResult,
        skills: skillsResult,
        experience: experienceResult,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch profile", details: err.message });
  }
};

exports.patchUserProfile = async (req, res) => {
  const { uid } = req;
  const { user, education, skills, experience } = req.body;

  try {
    // 1. Update user info
    if (user) {
      const { name, phone } = user;
      await pool.query("UPDATE users SET name = ?, phone = ? WHERE uid = ?", [
        name,
        phone,
        uid,
      ]);
    }

    // 2. Update or insert education
    if (education) {
      const [existing] = await pool.query(
        "SELECT eid FROM education WHERE uid = ?",
        [uid]
      );

      if (existing.length > 0) {
        await pool.query(
          `UPDATE education SET degree=?, institution=?, field_of_study=?, start_date_degree=?, end_date_degree=?, grade_value=?, grade_type=?, education_level=? WHERE uid=?`,
          [
            education.degree,
            education.institution,
            education.field_of_study,
            education.start_date_degree,
            education.end_date_degree,
            education.grade_value,
            education.grade_type,
            education.education_level,
            uid,
          ]
        );
      } else {
        await pool.query(
          `INSERT INTO education (uid, degree, institution, field_of_study, start_date_degree, end_date_degree, grade_value, grade_type, education_level)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            uid,
            education.degree,
            education.institution,
            education.field_of_study,
            education.start_date_degree,
            education.end_date_degree,
            education.grade_value,
            education.grade_type,
            education.education_level,
          ]
        );
      }
    }

    // 3. Update skills
    if (skills) {
      await pool.query("DELETE FROM applicant_skills WHERE uid = ?", [uid]);
      if (skills.length > 0) {
        const skillValues = skills.map((skillId) => [uid, skillId]);
        await pool.query(
          "INSERT INTO applicant_skills (uid, skillid) VALUES ?",
          [skillValues]
        );
      }
    }

    // 4. Update/Insert experiences
    if (experience) {
      for (const exp of experience) {
        if (exp.expid) {
          await pool.query(
            `UPDATE experience SET expName=?, role=?, start=?, end=?, resume=? WHERE expid=? AND uid=?`,
            [
              exp.expName,
              exp.role,
              exp.start,
              exp.end,
              exp.resume,
              exp.expid,
              uid,
            ]
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
    res
      .status(500)
      .json({ error: "Failed to update profile", details: err.message });
  }
};

//new update controllers

exports.patchAdditionalData = async (req, res) => {
  const { additionalData } = req.body;

  if (!additionalData || !additionalData.uid) {
    return res.status(400).json({ error: "Missing 'additionalData' or 'uid'" });
  }

  const uid = additionalData.uid;

  try {
    const userFields = [];
    const userValues = [];

    if (additionalData.gender && additionalData.gender !== "") {
      userFields.push("gender = ?");
      userValues.push(additionalData.gender);
    }

    if (additionalData.dob && additionalData.dob !== "") {
      userFields.push("dob = ?");
      userValues.push(additionalData.dob);
    }

    if (userFields.length > 0) {
      userValues.push(uid);
      const userQuery = `UPDATE users SET ${userFields.join(
        ", "
      )} WHERE uid = ?`;
      await pool.query(userQuery, userValues);
    }

    const applicantFields = [];
    const applicantValues = [];

    const fieldsToCheck = [
      "employmentStatus",
      "jobType",
      "preferredLocation",
      "availability",
      "linkedIn",
      "portfolioWebsite",
    ];

    fieldsToCheck.forEach((field) => {
      if (additionalData[field] && additionalData[field] !== "") {
        applicantFields.push(`${field} = ?`);
        applicantValues.push(additionalData[field]);
      }
    });

    if (applicantFields.length > 0) {
      applicantValues.push(uid);
      const applicantQuery = `UPDATE applicants SET ${applicantFields.join(
        ", "
      )} WHERE uid = ?`;
      await pool.query(applicantQuery, applicantValues);
    }

    res.status(200).json({ message: "Additional data updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.patchEducationalData = async (req, res) => {
  const { educationalData } = req.body;

  if (!educationalData || !educationalData.uid) {
    return res
      .status(400)
      .json({ error: "Missing 'educationalData' or 'uid'" });
  }

  const uid = educationalData.uid;

  try {
    const fields = [];
    const values = [];

    const fieldMap = {
      degree: "degree",
      institution: "institution",
      field_of_study: "field_of_study",
      start_date_degree: "start_date_degree",
      end_date_degree: "end_date_degree",
      grade_value: "grade_value",
      grade_type: "grade_type",
      education_level: "education_level",
    };

    for (const key in fieldMap) {
      const value = educationalData[key];
      if (value !== undefined && value !== "") {
        fields.push(`${fieldMap[key]} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) {
      return res
        .status(400)
        .json({ error: "No valid educational fields provided for update" });
    }

    values.push(uid);

    const query = `UPDATE education SET ${fields.join(", ")} WHERE uid = ?`;
    await pool.query(query, values);

    res.status(200).json({ message: "Educational data updated successfully" });
  } catch (error) {
    console.error("Error updating educational data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.patchSkillData = async (req, res) => {
  const { skillData } = req.body;

  if (!skillData || !Array.isArray(skillData.skills) || !skillData.uid) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid request body. Expected 'skillData' with 'uid' and 'skills' array.",
    });
  }

  try {
    await pool.query("DELETE FROM applicant_skills WHERE uid = ?", [
      skillData.uid,
    ]);

    for (const [skillId] of skillData.skills) {
      await pool.query(
        "INSERT INTO applicant_skills (uid, skillid) VALUES (?, ?)",
        [skillData.uid, skillId]
      );
    }

    return res.status(200).json({
      success: true,
      message: "Skills updated successfully.",
    });
  } catch (error) {
    console.error("Database error in patchSkillData:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating skills.",
      error: error.message,
    });
  }
};