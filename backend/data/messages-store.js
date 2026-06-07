const crypto = require("crypto");
const db = require("./db");

function createId() {
  return crypto.randomBytes(16).toString("hex");
}

function createPublicMessage(senderId, text) {
  const msg = {
    id: createId(),
    senderId,
    recipientId: null,
    conversationKey: null,
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };
  db.prepare(
    "INSERT INTO messages (id, senderId, recipientId, conversationKey, text, createdAt) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(msg.id, msg.senderId, msg.recipientId, msg.conversationKey, msg.text, msg.createdAt);
  return msg;
}

function listPublicMessages(limit = 50) {
  return db
    .prepare("SELECT * FROM messages WHERE recipientId IS NULL ORDER BY createdAt ASC LIMIT ?")
    .all(limit);
}

function directKey(a, b) {
  return [a, b].sort().join(":");
}

function createDirectMessage(senderId, recipientId, text) {
  const msg = {
    id: createId(),
    senderId,
    recipientId,
    conversationKey: directKey(senderId, recipientId),
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };
  db.prepare(
    "INSERT INTO messages (id, senderId, recipientId, conversationKey, text, createdAt) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(msg.id, msg.senderId, msg.recipientId, msg.conversationKey, msg.text, msg.createdAt);
  return msg;
}

function listDirectMessages(userA, userB, limit = 100) {
  return db
    .prepare(
      "SELECT * FROM messages WHERE conversationKey = ? ORDER BY createdAt ASC LIMIT ?"
    )
    .all(directKey(userA, userB), limit);
}

module.exports = {
  createPublicMessage,
  listPublicMessages,
  createDirectMessage,
  listDirectMessages,
};
