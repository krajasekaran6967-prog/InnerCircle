const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const { findUserById, toPublicUser } = require("../data/store");
const {
  getFriendshipBetween,
  getFriendRecord,
  createFriendRequest,
  updateFriendStatus,
  removeFriendRecord,
  listAccepted,
  listIncomingRequests,
  listOutgoingRequests,
} = require("../data/friends");

const router = express.Router();

function otherUserId(record, userId) {
  return record.requesterId === userId ? record.recipientId : record.requesterId;
}

function publicUserById(id) {
  return toPublicUser(findUserById(id));
}

router.get("/", requireAuth, (req, res) => {
  const userId = req.session.userId;

  const friends = listAccepted(userId)
    .map((record) => {
      const user = publicUserById(otherUserId(record, userId));
      if (!user) {
        return null;
      }
      user.friendship = { status: "friends", requestId: record.id };
      return user;
    })
    .filter(Boolean);

  const incoming = listIncomingRequests(userId)
    .map((record) => {
      const user = publicUserById(record.requesterId);
      return user ? { requestId: record.id, user } : null;
    })
    .filter(Boolean);

  const outgoing = listOutgoingRequests(userId)
    .map((record) => {
      const user = publicUserById(record.recipientId);
      return user ? { requestId: record.id, user } : null;
    })
    .filter(Boolean);

  return res.json({ friends, incoming, outgoing });
});

router.post("/request", requireAuth, (req, res) => {
  const userId = req.session.userId;
  const { recipientId } = req.body;

  if (!recipientId) {
    return res.status(400).json({ error: "Recipient is required." });
  }

  if (recipientId === userId) {
    return res.status(400).json({ error: "You cannot add yourself." });
  }

  const recipient = findUserById(recipientId);
  if (!recipient) {
    return res.status(404).json({ error: "User not found." });
  }

  const existing = getFriendshipBetween(userId, recipientId);
  if (existing) {
    if (existing.status === "accepted") {
      return res.status(409).json({ error: "You are already connected." });
    }
    return res.status(409).json({ error: "A request is already pending." });
  }

  const record = createFriendRequest(userId, recipientId);
  return res.status(201).json({ request: record });
});

router.put("/:id", requireAuth, (req, res) => {
  const userId = req.session.userId;
  const { action } = req.body;

  const record = getFriendRecord(req.params.id);
  if (!record) {
    return res.status(404).json({ error: "Request not found." });
  }

  if (record.recipientId !== userId) {
    return res.status(403).json({ error: "You cannot respond to this request." });
  }

  if (record.status !== "pending") {
    return res.status(409).json({ error: "This request was already handled." });
  }

  if (action === "accept") {
    const updated = updateFriendStatus(record.id, "accepted");
    return res.json({ request: updated });
  }

  if (action === "decline") {
    removeFriendRecord(record.id);
    return res.json({ message: "Request declined." });
  }

  return res.status(400).json({ error: "Invalid action." });
});

router.delete("/:id", requireAuth, (req, res) => {
  const userId = req.session.userId;
  const record = getFriendRecord(req.params.id);

  if (!record) {
    return res.status(404).json({ error: "Connection not found." });
  }

  if (record.requesterId !== userId && record.recipientId !== userId) {
    return res.status(403).json({ error: "You cannot remove this connection." });
  }

  removeFriendRecord(record.id);
  return res.json({ message: "Connection removed." });
});

module.exports = router;
