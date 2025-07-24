const pool = require("../config/db");

exports.skills = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM skills");

    if (!rows)
      return res.status(401).json({ message: "No skills in database" });

    res.json({
      message: "Total skills fetched successfully",
      skills: rows.map((row) => [row.skillid, row.skillName]),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};