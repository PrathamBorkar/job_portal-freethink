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