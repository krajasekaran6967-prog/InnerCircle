const express = require("express");
const path = require("path");
const fs = require("fs");
const requireAuth = require("../middleware/requireAuth");
const { uploadAvatar } = require("../middleware/upload");
const {
  findUserById,
  updateUser,
  searchUsers,
  listFriends,
  addFriend,
  removeFriend,
  toPublicUser,
} = require("../data/store");

const router = express.Router();

router.get("/", requireAuth, (req, res) => {
  const query = req.query.search || "";
  const users = searchUsers(query).map((user) => toPublicUser(user, req.session.userId));
  return res.json({ users });
});

router.get("/me", requireAuth, (req, res) => {
  const user = findUserById(req.session.userId);
  if (!user) {
    return res.status(401).json({ error: "Not authenticated." });
  }
  return res.json({ user: toPublicUser(user, req.session.userId) });
});

router.put("/me", requireAuth, (req, res) => {
  const { name, department, bio } = req.body;

  if (!name || !department) {
    return res.status(400).json({ error: "Name and department are required." });
  }

  const user = updateUser(req.session.userId, { name, department, bio: bio || "" });
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  return res.json({ user: toPublicUser(user, req.session.userId) });
});

router.post("/me/avatar", requireAuth, (req, res) => {
  uploadAvatar.single("avatar")(req, res, (err) => {
    if (err) {
      const message = err.message || "Upload failed.";
      return res.status(400).json({ error: message });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No image file provided." });
    }

    const existing = findUserById(req.session.userId);
    if (existing && existing.thumbnailUrl) {
      const oldPath = path.join(__dirname, "..", existing.thumbnailUrl.replace(/^\//, ""));
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    const thumbnailUrl = `/uploads/${req.file.filename}`;
    const user = updateUser(req.session.userId, { thumbnailUrl });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    return res.json({ user: toPublicUser(user, req.session.userId) });
  });
});

router.get("/me/friends", requireAuth, (req, res) => {
  const users = listFriends(req.session.userId).map((user) => toPublicUser(user, req.session.userId));
  return res.json({ users });
});

router.post("/:id/friends", requireAuth, (req, res) => {
  try {
    const user = addFriend(req.session.userId, req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    return res.json({ user: toPublicUser(user, req.session.userId) });
  } catch (error) {
    return res.status(400).json({ error: error.message || "Unable to add friend." });
  }
});

router.delete("/:id/friends", requireAuth, (req, res) => {
  const user = removeFriend(req.session.userId, req.params.id);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }
  return res.json({ user: toPublicUser(user, req.session.userId) });
});

router.get("/:id", requireAuth, (req, res) => {
  const user = findUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  return res.json({ user: toPublicUser(user, req.session.userId) });
});

module.exports = router;
