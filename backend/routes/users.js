const express = require("express");
const path = require("path");
const fs = require("fs");
const requireAuth = require("../middleware/requireAuth");
const { uploadAvatar } = require("../middleware/upload");
const {
  findUserById,
  updateUser,
  searchUsers,
  toPublicUser,
} = require("../data/store");
const { getFriendshipBetween } = require("../data/friends");

const router = express.Router();

function friendshipFor(currentUserId, otherUserId) {
  if (currentUserId === otherUserId) {
    return { status: "self", requestId: null };
  }

  const record = getFriendshipBetween(currentUserId, otherUserId);
  if (!record) {
    return { status: "none", requestId: null };
  }

  if (record.status === "accepted") {
    return { status: "friends", requestId: record.id };
  }

  const status =
    record.requesterId === currentUserId ? "pending_outgoing" : "pending_incoming";
  return { status, requestId: record.id };
}

function withFriendship(currentUserId, user) {
  const publicUser = toPublicUser(user);
  if (!publicUser) {
    return null;
  }
  publicUser.friendship = friendshipFor(currentUserId, publicUser.id);
  return publicUser;
}

router.get("/", requireAuth, (req, res) => {
  const query = req.query.search || "";
  const currentUserId = req.session.userId;
  const users = searchUsers(query)
    .filter((user) => user.id !== currentUserId)
    .map((user) => withFriendship(currentUserId, user));
  return res.json({ users });
});

router.get("/me", requireAuth, (req, res) => {
  const user = findUserById(req.session.userId);
  if (!user) {
    return res.status(401).json({ error: "Not authenticated." });
  }
  return res.json({ user: toPublicUser(user) });
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

  return res.json({ user: toPublicUser(user) });
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

    return res.json({ user: toPublicUser(user) });
  });
});

router.get("/:id", requireAuth, (req, res) => {
  const user = findUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  return res.json({ user: withFriendship(req.session.userId, user) });
});

module.exports = router;
