const pool = require("../config/db");

exports.companies = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM company");

    if (!rows)
      return res.status(401).json({
        success: false,
        message: "No compnies in database",
        companies: [],
      });

    res.json({
      success: true,
      message: "All companies fetched successfully",
      companies: rows.map((row) => [row.cid, row.name]),
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: err.message, companies: [] });
  }
};

//get comapany via recid

exports.getCompanyByRecruiter = async (req, res) => {
  console.log("Fetching company by recruite hitted r...");
  const email = req.user?.email;
  if (!email) {
    return res
      .status(401)
      .json({ message: "Unauthorized: User not authenticated" });
  }

  try {
    const [userRows] = await pool.query(
      "SELECT uid FROM users WHERE email = ?",
      [email]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: "Recruiter not found" });
    }

    const uid = userRows[0].uid;

    if (!uid) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Recruiter not authenticated" });
    }

    const [rows] = await pool.query(
      `
      SELECT c.* 
      FROM company c
      JOIN recruiters r ON c.cid = r.cid
      WHERE r.uid = ?
    `,
      [uid]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.status(200).json({ company: rows[0] });
  } catch (err) {
    console.error("Error fetching company by recruiter:", err);
    res.status(500).json({ error: err.message });
  }
};
