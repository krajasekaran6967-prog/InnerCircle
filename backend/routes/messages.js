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

async function hydrateMessage(message) {
  return {
    ...message,
    sender: toPublicUser(await findUserById(message.senderId)),
  };
}

router.get("/public", requireAuth, async (req, res) => {
  const limit = Math.min(Math.max(Number.isFinite(Number(req.query.limit)) ? Number(req.query.limit) : 50, 1), 100);
  const messages = await Promise.all((await listPublicMessages(limit)).map(hydrateMessage));
  return res.json({ messages });
});

router.post("/public", requireAuth, async (req, res) => {
  const text = String(req.body.text || "").trim();
  if (!text) {
    return res.status(400).json({ error: "Message text is required." });
  }
  if (text.length > 500) {
    return res.status(400).json({ error: "Message must be 500 characters or fewer." });
  }

  const message = await createPublicMessage(req.session.userId, text);
  return res.status(201).json({ message: await hydrateMessage(message) });
});

router.get("/direct/:userId", requireAuth, async (req, res) => {
  const target = await findUserById(req.params.userId);
  if (!target) {
    return res.status(404).json({ error: "User not found." });
  }

  const limit = Math.min(Math.max(Number.isFinite(Number(req.query.limit)) ? Number(req.query.limit) : 100, 1), 200);
  const messages = await Promise.all(
    (await listDirectMessages(req.session.userId, req.params.userId, limit)).map(hydrateMessage)
  );
  return res.json({ messages, member: toPublicUser(target, req.session.userId) });
});

router.post("/direct/:userId", requireAuth, async (req, res) => {
  const target = await findUserById(req.params.userId);
  if (!target) {
    return res.status(404).json({ error: "User not found." });
  }

  const text = String(req.body.text || "").trim();
  if (!text) {
    return res.status(400).json({ error: "Message text is required." });
  }

  const message = await createDirectMessage(req.session.userId, req.params.userId, text);
  return res.status(201).json({ message: await hydrateMessage(message) });
});

module.exports = router;
