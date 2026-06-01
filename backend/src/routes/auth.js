const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

// 🔥 LOGIN WITHOUT DATABASE
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (email === "admin@demo.com" && password === "123456") {
    const token = jwt.sign(
      { id: 1, role: "admin" },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" }
    );

    return res.json({
      token,
      user: {
        id: 1,
        name: "Admin",
        email,
        role: "admin"
      }
    });
  }

  return res.status(400).json({ message: "Invalid credentials" });
});

module.exports = router;
