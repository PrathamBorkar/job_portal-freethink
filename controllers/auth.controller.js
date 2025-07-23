const pool =require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');   



exports.Uregister = async (req, res) => {
  const {
    first_name,
    middle_name,
    last_name,
    username,
    email,
    password,
    phone,
    age,
    gender,
    resume_url
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (
        first_name, middle_name, last_name, username,
        email, password_hash, phone, age, gender, resume_url
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      first_name,
      middle_name || null,
      last_name,
      username,
      email,
      hashedPassword,
      phone || null,
      age || null,
      gender,
      resume_url || null
    ];

    const [result] = await pool.query(sql, values);

    res.status(201).json({
      message: "User registered successfully",
      userId: result.insertId
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        error: "Username or Email already exists"
      });
    }
    res.status(500).json({ error: err.message });
  }
};


exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = rows[0];
    if (!user) return res.status(401).json({ message: "Invalid email" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ message: "Login successful", token, user: { id: user.id, fullName: user.fullName, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};