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

  const sql = `
    SELECT 
      c.cid,
      c.name,
      c.description,
      c.companySize,
      c.status,
      c.tags,
      c.type,
      c.CEO,
      c.companyEmail,
      c.links,
      c.locationids,
      c.marketids
    FROM company c
    WHERE c.cid = ?
  `;

  try {
    const [rows] = await pool.query(sql, [companyId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Company not found" });
    }

    const company = rows[0];

    // Enhanced JSON parsing function that handles non-standard formats
    const parseCompanyField = (field) => {
      if (!field) return [];

      // Handle cases where it's already an array
      if (Array.isArray(field)) return field;

      // Handle non-standard JSON format like {"Fun", "Nothing"}
      if (
        typeof field === "string" &&
        field.startsWith("{") &&
        field.endsWith("}")
      ) {
        try {
          // First try standard JSON parsing
          return JSON.parse(field);
        } catch (e) {
          // If standard JSON fails, handle non-standard format
          const cleaned = field
            .replace(/^{/, '["') // Replace { with ["
            .replace(/}$/, '"]') // Replace } with "]
            .replace(/","/g, '","') // Ensure proper comma separation
            .replace(/, /g, '","'); // Replace comma+space with ","
          try {
            return JSON.parse(cleaned);
          } catch (e2) {
            console.error(`Failed to parse field: ${field}`, e2);
            return [];
          }
        }
      }

      // Handle comma-separated strings
      if (typeof field === "string" && field.includes(",")) {
        return field
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item);
      }

      // Fallback for other cases
      return [field];
    };

    // Process fields to match the expected response structure
    const processedCompany = {
      ...company,
      tags: parseCompanyField(company.tags),
      type: parseCompanyField(company.type),
      links: parseCompanyField(company.links),
      // For locations and markets, we need to parse the IDs first
      locations: parseCompanyField(company.locationids).join(","),
      markets: parseCompanyField(company.marketids).join(","),
    };

    res.json(processedCompany);
  } catch (err) {
    console.error("Error fetching company detail:", err);
    res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
};
