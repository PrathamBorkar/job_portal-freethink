const pool = require("../config/db");

exports.companies = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM company");

    if (!rows)
      return res.status(401).json({ message: "No compnies in database" });

    res.json({
      message: "All companies fetched successfully",
      companies: rows.map((row) => [row.cid, row.name]),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};