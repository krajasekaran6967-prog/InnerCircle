const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const { findUserById, toPublicUser } = require("../data/store");
const {
  createPublicMessage,
  listPublicMessages,
  createDirectMessage,
  listDirectMessages,
} = require("../data/messages-store");

const router = express.Router();

function hydrateMessage(message) {
  return {
    ...message,
    sender: toPublicUser(findUserById(message.senderId)),
  };
}

router.get("/public", requireAuth, (req, res) => {
  const limit = Math.min(Number(req.query.limit || 50), 100);
  const messages = listPublicMessages(limit).map(hydrateMessage);
  return res.json({ messages });
});

router.post("/public", requireAuth, (req, res) => {
  const text = String(req.body.text || "").trim();
  if (!text) {
    return res.status(400).json({ error: "Message text is required." });
  }

  const message = createPublicMessage(req.session.userId, text);
  return res.status(201).json({ message: hydrateMessage(message) });
});

router.get("/direct/:userId", requireAuth, (req, res) => {
  const target = findUserById(req.params.userId);
  if (!target) {
    return res.status(404).json({ error: "User not found." });
  }

  const limit = Math.min(Number(req.query.limit || 100), 200);
  const messages = listDirectMessages(req.session.userId, req.params.userId, limit).map(hydrateMessage);
  return res.json({ messages, member: toPublicUser(target, req.session.userId) });
});

router.post("/direct/:userId", requireAuth, (req, res) => {
  const target = findUserById(req.params.userId);
  if (!target) {
    return res.status(404).json({ error: "User not found." });
  }

  const text = String(req.body.text || "").trim();
  if (!text) {
    return res.status(400).json({ error: "Message text is required." });
  }

  const message = createDirectMessage(req.session.userId, req.params.userId, text);
  return res.status(201).json({ message: hydrateMessage(message) });
});

module.exports = router;
