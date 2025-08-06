require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { updatePopularityScores } = require("./utils/updatePopularity");
const authRoutes = require("./routes/auth.routes");
const skillRoutes = require("./routes/skill.routes");
const companyRoutes = require("./routes/company.routes");
const rootRoutes = require("./routes/root.routes");
const resumeRoutes = require("./routes/resume.routes");
const jobsRoutes = require("./routes/jobs.routes");
const editProfile = require("./routes/editprofile.routes");

const app = express();
app.use(
  cors({
    origin: "http://localhost:9000",
    credentials: true,
  })
);
app.use(express.json());

app.use("/", rootRoutes);
app.use("/auth", authRoutes);
app.use("/skills", skillRoutes);
app.use("/company", companyRoutes);
app.use("/resume", resumeRoutes);
app.use("/jobs", jobsRoutes);
app.use("/edit-profile", editProfile);

setInterval(updatePopularityScores, 30 * 60 * 1000);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
