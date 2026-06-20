const express = require("express");
const requireAuth = require("../middleware/requireAuth");
const { findUserById, toPublicUser } = require("../data/store");
const {
  getConversation,
  isMember,
  findDirectConversation,
  createConversation,
  addMembers,
  listConversationsForUser,
  addMessage,
  listMessages,
  lastMessageFor,
} = require("../data/messages");

const router = express.Router();

function memberSummaries(memberIds) {
  return memberIds.map((id) => toPublicUser(findUserById(id))).filter(Boolean);
}

function shapeConversation(conversation, currentUserId) {
  const members = memberSummaries(conversation.memberIds);
  const others = members.filter((member) => member.id !== currentUserId);

  let title = conversation.name;
  if (conversation.type === "direct") {
    title = others[0] ? others[0].name : "Conversation";
  } else if (!title) {
    title = others.map((member) => member.name).join(", ") || "Group";
  }

  const last = lastMessageFor(conversation.id);

  return {
    id: conversation.id,
    type: conversation.type,
    title,
    members,
    createdBy: conversation.createdBy,
    lastMessageAt: conversation.lastMessageAt,
    lastMessage: last ? { body: last.body, senderId: last.senderId, createdAt: last.createdAt } : null,
  };
}

router.get("/", requireAuth, (req, res) => {
  const currentUserId = req.session.userId;
  const conversations = listConversationsForUser(currentUserId).map((conversation) =>
    shapeConversation(conversation, currentUserId)
  );
  return res.json({ conversations });
});

router.post("/", requireAuth, (req, res) => {
  const currentUserId = req.session.userId;
  const { recipientId, name, memberIds } = req.body;

  if (recipientId) {
    if (recipientId === currentUserId) {
      return res.status(400).json({ error: "You cannot message yourself." });
    }

    const recipient = findUserById(recipientId);
    if (!recipient) {
      return res.status(404).json({ error: "User not found." });
    }

    const existing = findDirectConversation(currentUserId, recipientId);
    if (existing) {
      return res.json({ conversation: shapeConversation(existing, currentUserId) });
    }

    const conversation = createConversation({
      type: "direct",
      memberIds: [currentUserId, recipientId],
      createdBy: currentUserId,
    });
    return res.status(201).json({ conversation: shapeConversation(conversation, currentUserId) });
  }

  const requestedMembers = Array.isArray(memberIds) ? memberIds : [];
  const validMembers = requestedMembers.filter((id) => findUserById(id));

  if (validMembers.length < 1) {
    return res.status(400).json({ error: "Select at least one member for the group." });
  }

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Group name is required." });
  }

  const conversation = createConversation({
    type: "group",
    name: name.trim(),
    memberIds: [currentUserId, ...validMembers],
    createdBy: currentUserId,
  });

  return res.status(201).json({ conversation: shapeConversation(conversation, currentUserId) });
});

router.get("/:id", requireAuth, (req, res) => {
  const currentUserId = req.session.userId;
  const conversation = getConversation(req.params.id);

  if (!conversation || !isMember(conversation, currentUserId)) {
    return res.status(404).json({ error: "Conversation not found." });
  }

  return res.json({ conversation: shapeConversation(conversation, currentUserId) });
});

router.get("/:id/messages", requireAuth, (req, res) => {
  const currentUserId = req.session.userId;
  const conversation = getConversation(req.params.id);

  if (!conversation || !isMember(conversation, currentUserId)) {
    return res.status(404).json({ error: "Conversation not found." });
  }

  const messages = listMessages(conversation.id).map((message) => {
    const sender = toPublicUser(findUserById(message.senderId));
    return {
      id: message.id,
      body: message.body,
      createdAt: message.createdAt,
      senderId: message.senderId,
      senderName: sender ? sender.name : "Unknown",
      mine: message.senderId === currentUserId,
    };
  });

  return res.json({ messages });
});

router.post("/:id/messages", requireAuth, (req, res) => {
  const currentUserId = req.session.userId;
  const conversation = getConversation(req.params.id);

  if (!conversation || !isMember(conversation, currentUserId)) {
    return res.status(404).json({ error: "Conversation not found." });
  }

  const body = (req.body.body || "").trim();
  if (!body) {
    return res.status(400).json({ error: "Message cannot be empty." });
  }

  const message = addMessage(conversation.id, currentUserId, body);
  return res.status(201).json({
    message: {
      id: message.id,
      body: message.body,
      createdAt: message.createdAt,
      senderId: message.senderId,
      mine: true,
    },
  });
});

router.post("/:id/members", requireAuth, (req, res) => {
  const currentUserId = req.session.userId;
  const conversation = getConversation(req.params.id);

  if (!conversation || !isMember(conversation, currentUserId)) {
    return res.status(404).json({ error: "Conversation not found." });
  }

  if (conversation.type !== "group") {
    return res.status(400).json({ error: "Only group conversations can add members." });
  }

  const requested = Array.isArray(req.body.memberIds) ? req.body.memberIds : [];
  const validMembers = requested.filter((id) => findUserById(id));

  if (validMembers.length === 0) {
    return res.status(400).json({ error: "No valid members to add." });
  }

  const updated = addMembers(conversation.id, validMembers);
  return res.json({ conversation: shapeConversation(updated, currentUserId) });
});

module.exports = router;
