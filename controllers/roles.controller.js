const pool = require("../config/db");

exports.roles = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM roles");

    if (!rows)
      return res.status(401).json({
        success: false,
        message: "No roles in database",
        roles: [],
      });

    res.json({
      success: true,
      message: "Total skills fetched successfully",
      roles: rows.map((row) => [row.rid, row.roleName]),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, roles: [] });
  }
};
