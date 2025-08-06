require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const skillRoutes = require("./routes/skill.routes");
const companyRoutes = require("./routes/company.routes");
const rootRoutes = require("./routes/root.routes");
const resumeRoutes = require("./routes/resume.routes");
const jobsRoutes = require("./routes/jobs.routes");
const locationRoutes = require("./routes/location.routes");

const app = express();

// ✅ Corrected CORS config
app.use(cors({
  origin: 'http://localhost:9000',
  credentials: true
}));

app.use(express.json());

// Route setup
app.use("/", rootRoutes);
app.use("/auth", authRoutes);
app.use("/skills", skillRoutes);
app.use("/company", companyRoutes);
app.use("/resume", resumeRoutes);
app.use("/jobs",jobsRoutes);
app.use("/location", locationRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
