const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { name, email, password, role, phone } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql =
      "INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)";

    const [result] = await pool.query(sql, [
      name,
      email,
      hashedPassword,
      role,
      phone,
    ]);

    if (role === "recruiter") {
      const sql1 = "INSERT INTO recruiters (uid, cid) VALUES (?, ?)";
      await pool.query(sql1, [result.insertId, 1]);
    } else {
      const sql1 = "INSERT INTO applicants (uid) VALUES (?)";
      await pool.query(sql1, [result.insertId]);
    }

    res
      .status(201)
      .json({ message: "User registered", userId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    const user = rows[0];

    if (!user) return res.status(401).json({ message: "Invalid email" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { email: user.email, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        uid: user.uid,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
