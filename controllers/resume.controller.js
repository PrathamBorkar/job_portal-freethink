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

exports.downloadResume = async (req, res) => {
  const { uid } = req.params;

  try {
    const [rows] = await pool.execute(
      "SELECT resume_url FROM applicants WHERE uid = ?",
      [uid]
    );

    if (rows.length === 0 || !rows[0].resume_url) {
      return res
        .status(404)
        .json({ success: false, message: "Resume not found." });
    }

    const resumePath = path.join(__dirname, "..", rows[0].resume_url);

    if (!fs.existsSync(resumePath)) {
      return res
        .status(404)
        .json({ success: false, message: "Resume file not found on server." });
    }

    res.status(200).download(resumePath, `resume-${uid}.pdf`);
  } catch (error) {
    console.error("Error downloading resume:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while downloading resume.",
    });
  }
};

exports.sendResume = async (req, res) => {
  const { uid } = req.params;

  try {
    const [rows] = await pool.execute(
      "SELECT resume_url FROM applicants WHERE uid = ?",
      [uid]
    );

    if (rows.length === 0 || !rows[0].resume_url) {
      return res
        .status(404)
        .json({ success: false, message: "Resume not found." });
    }

    const resumePath = path.join(__dirname, "..", rows[0].resume_url);

    if (!fs.existsSync(resumePath)) {
      return res
        .status(404)
        .json({ success: false, message: "Resume file not found on server." });
    }

    res.status(200).sendFile(resumePath);
  } catch (error) {
    console.error("Error sending resume:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while sending resume.",
    });
  }
};