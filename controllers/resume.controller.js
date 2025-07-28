const pool = require("../config/db");
const fs = require("fs");
const path = require("path");

function getResumeUrl(fileName) {
  return `/resumes/${fileName}`;
}

exports.uploadResume = async (req, res) => {
  try {
    const uid = req.body.uid;
    const fileName = req.file.filename;
    const newResumeUrl = getResumeUrl(fileName);

    const [rows] = await pool.execute(
      "SELECT resume_url FROM applicants WHERE uid = ?",
      [uid]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Applicant not found" });
    }

    const currentResumeUrl = rows[0].resume_url;

    if (currentResumeUrl) {
      const oldFilePath = path.join(__dirname, "..", currentResumeUrl);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    await pool.execute("UPDATE applicants SET resume_url = ? WHERE uid = ?", [
      newResumeUrl,
      uid,
    ]);

    res.status(200).json({ success: true, message: "Resume uploaded" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
