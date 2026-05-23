const express = require("express");
const bcrypt = require("bcryptjs");
const {
  findUserByEmail,
  findUserById,
  createUser,
  toPublicUser,
} = require("../data/store");

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { email, password, name, department } = req.body;

  if (!email || !password || !name || !department) {
    return res.status(400).json({ error: "All fields are required." });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters." });
  }

  if (findUserByEmail(email)) {
    return res.status(409).json({ error: "An account with this email already exists." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = createUser({ email, passwordHash, name, department });

  req.session.userId = user.id;

  return res.status(201).json({ user: toPublicUser(user, req.session.userId) });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const user = findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  req.session.userId = user.id;

  return res.json({ user: toPublicUser(user, req.session.userId) });
});

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Could not log out." });
    }

    res.clearCookie("innercircle.sid");
    return res.json({ message: "Logged out successfully." });
  });
});

router.get("/me", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authenticated." });
  }

  const user = findUserById(req.session.userId);
  if (!user) {
    req.session.destroy(() => {});
    return res.status(401).json({ error: "Not authenticated." });
  }

  return res.json({ user: toPublicUser(user, req.session.userId) });
});

module.exports = router;
