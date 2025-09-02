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

exports.patchCompanyProfile = async (req, res) => {
  const { cid } = req.params;
  const updates = req.body;

  if (!cid) return res.status(400).json({ message: "Missing Company ID" });

  try {
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      // skip cid if accidentally included
      if (key === "cid") continue;

      // optional: sanitize json fields
      const isJsonField = [
        "tags",
        "type",
        "links",
        "locationids",
        "marketids",
      ].includes(key);
      fields.push(`${key} = ?`);
      values.push(isJsonField ? JSON.stringify(value) : value);
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    values.push(cid); // for WHERE clause

    const query = `UPDATE company SET ${fields.join(", ")} WHERE cid = ?`;
    await pool.query(query, values);

    res.status(200).json({ message: "Company updated successfully" });
  } catch (err) {
    console.error("Error updating company:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getAllCompanies = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM company");
    res.status(200).json({ companies: rows });
  } catch (err) {
    console.error("Error fetching companies:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
exports.getCompanyDetails = async (req, res) => {
  const companyId = req.query.cid;
  console.log(`Received companyId from query param: ${companyId}`);

  if (!companyId) {
    return res.status(400).json({ error: "Missing cid query parameter" });
  }

  try {
    // Get company details
    const [companyRows] = await pool.query(
      `SELECT cid, name, description, companySize, status, tags, type, CEO, companyEmail, links, locationids, marketids
       FROM company
       WHERE cid = ?`,
      [companyId]
    );

    if (companyRows.length === 0) {
      return res.status(404).json({ error: "Company not found" });
    }

    const company = companyRows[0];

    // Helper to parse JSON/array fields
    const parseField = (field) => {
      if (!field) return [];
      if (Array.isArray(field)) return field;
      try {
        return JSON.parse(field);
      } catch {
        // Fallback for comma-separated strings
        return field.split(",").map((i) => i.trim());
      }
    };

    // Resolve location names from locationids
    let locations = [];
    const locationIds = parseField(company.locationids);
    if (locationIds.length) {
      const [locationRows] = await pool.query(
        `SELECT lname FROM locations WHERE lid IN (?)`,
        [locationIds]
      );
      locations = locationRows.map((l) => l.lname);
    }

    // Resolve market names from marketids
    let markets = [];
    const marketIds = parseField(company.marketids);
    if (marketIds.length) {
      const [marketRows] = await pool.query(
        `SELECT mname FROM markets WHERE mid IN (?)`,
        [marketIds]
      );
      markets = marketRows.map((m) => m.mname);
    }

    // Process tags, type, and links
    const tags = parseField(company.tags);
    const type = parseField(company.type);
    const links = parseField(company.links);

    // Construct final response
    const response = {
      cid: company.cid,
      name: company.name,
      description: company.description,
      companySize: company.companySize,
      status: company.status,
      tags,
      type,
      CEO: company.CEO,
      companyEmail: company.companyEmail,
      links,
      locations,
      markets,
    };

    res.json(response);
  } catch (err) {
    console.error("Error fetching company detail:", err);
    res
      .status(500)
      .json({ error: "Internal server error", message: err.message });
  }
};
