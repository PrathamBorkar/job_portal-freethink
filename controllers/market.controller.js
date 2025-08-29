const pool = require("../config/db");

exports.markets = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM markets");

    if (!rows)
      return res.status(401).json({
        success: false,
        message: "No markets in database",
        markets: [],
      });

    res.json({
      success: true,
      message: "Total skills fetched successfully",
      markets: rows.map((row) => [row.mid, row.mname]),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, markets: [] });
  }
};
