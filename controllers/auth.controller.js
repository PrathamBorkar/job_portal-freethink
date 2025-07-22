const pool =require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');    

exports.register = async (req, res) => {
 const { fullName, email, password, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO users (fullName, email, password, role) VALUES (?, ?, ?, ?)";
    const [result] = await pool.query(sql, [fullName, email, hashedPassword, role]);

    res.status(201).json({ message: "User registered", userId: result.insertId });
  } catch (err) {
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