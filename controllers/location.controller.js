const pool = require("../config/db");

exports.locations = async (req, res) => {
  console.log("Fetching all locations...");
  try {
    const [rows] = await pool.query("SELECT lid, lname FROM locations ORDER BY lname");

    if (!rows || rows.length === 0) {
      return res.json({
        success: true,
        message: "No locations found",
        locations: []
      });
    }

    res.json({
      success: true,
      message: "Total locations fetched successfully",
      locations: rows.map((row) => [row.lid, row.lname]), // Same format as skills
    });
  } catch (err) {
    console.error("Locations fetch error:", err);
    res.status(500).json({ 
      success: false, 
      error: err.message, 
      locations: [] 
    });
  }
};