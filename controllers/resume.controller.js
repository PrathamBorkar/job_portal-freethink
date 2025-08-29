require("dotenv").config();
const { supabase } = require("../config/supabase");
const pool = require("../config/db");

function getResumeUrl(fileName) {
  return `${process.env.SUPABASE_URL}/storage/v1/object/public/frethink/resumes/${fileName}`;
}

exports.uploadResume = async (req, res) => {
  try {
    const { uid } = req.params;
    const file = req.file;

    if (!file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const fileName = `resume-${uid}-${Date.now()}.pdf`;

    const [rows] = await pool.execute(
      "SELECT resume_url FROM applicants WHERE uid = ?",
      [uid]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Applicant not found" });
    }

    const existingUrl = rows[0].resume_url;

    if (existingUrl) {
      const parts = existingUrl.split("/");
      const existingFileName = parts[parts.length - 1];

      await supabase.storage.from("frethink").remove([existingFileName]);
    }

    const { data, error } = await supabase.storage
      .from("frethink")
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Upload failed",
        error: error.message,
      });
    }

    const resumeUrl = getResumeUrl(fileName);

    await pool.execute("UPDATE applicants SET resume_url = ? WHERE uid = ?", [
      resumeUrl,
      uid,
    ]);

    res
      .status(200)
      .json({ success: true, message: "Resume uploaded", resumeUrl });
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

    const resumeUrl = rows[0].resume_url;

    const { data, error } = await supabase.storage
      .from("frethink")
      .download(resumeUrl.split("/resumes/")[1]);

    if (error) {
      console.error("Error downloading resume:", error.message);
      return res.status(500).json({
        success: false,
        message: "Error downloading file from Supabase.",
      });
    }

    res.status(200).send(data);
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
    // Step 1: Fetch resume URL from database
    const [rows] = await pool.execute(
      "SELECT resume_url FROM applicants WHERE uid = ?",
      [uid]
    );

    if (rows.length === 0 || !rows[0].resume_url) {
      console.error(`No resume found for UID: ${uid}`);
      return res
        .status(404)
        .json({ success: false, message: "Resume not found." });
    }

    const resumeUrl = rows[0].resume_url;

    // Extract filename, removing any potential path prefixes
    const fileName = resumeUrl.split("/resumes/")[1] || resumeUrl;

    console.log(`Attempting to download resume:`, {
      originalFileName: resumeUrl,
      processedFileName: fileName,
    });

    // Attempt to download the file
    const { data, error } = await supabase.storage
      .from("frethink")
      .download(fileName);

    if (error) {
      console.error("Detailed Supabase Storage Download Error:", {
        message: error.message,
        code: error.code,
        details: error,
        fileName: fileName,
      });

      // Handle specific error scenarios
      if (error.statusCode === 404) {
        return res.status(404).json({
          success: false,
          message: "File not found in storage.",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Error fetching file from Supabase.",
        errorDetails: error.message,
      });
    }

    // Validate downloaded data
    if (!data) {
      console.error(`No data retrieved for resume: ${fileName}`);
      return res.status(500).json({
        success: false,
        message: "No file data retrieved.",
      });
    }

    const buffer = Buffer.from(await data.arrayBuffer());

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);
    res.send(buffer);
  } catch (error) {
    console.error("Comprehensive Resume Fetch Error:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    res.status(500).json({
      success: false,
      message: "Server error while fetching resume for preview.",
      errorDetails: error.message,
    });
  }
};
