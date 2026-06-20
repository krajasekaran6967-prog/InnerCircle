const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const CONVERSATIONS_FILE = path.join(__dirname, "conversations.json");
const MESSAGES_FILE = path.join(__dirname, "messages.json");

function readFile(file) {
  if (!fs.existsSync(file)) {
    return [];
  }
  const raw = fs.readFileSync(file, "utf8");
  if (!raw.trim()) {
    return [];
  }
  return JSON.parse(raw);
}

function writeFile(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function readConversations() {
  return readFile(CONVERSATIONS_FILE);
}

function writeConversations(conversations) {
  writeFile(CONVERSATIONS_FILE, conversations);
}

function readMessages() {
  return readFile(MESSAGES_FILE);
}

function writeMessages(messages) {
  writeFile(MESSAGES_FILE, messages);
}

function createId() {
  return crypto.randomBytes(16).toString("hex");
}

function getConversation(id) {
  return readConversations().find((conversation) => conversation.id === id) || null;
}

function isMember(conversation, userId) {
  return Boolean(conversation) && conversation.memberIds.includes(userId);
}

function findDirectConversation(userA, userB) {
  return (
    readConversations().find(
      (conversation) =>
        conversation.type === "direct" &&
        conversation.memberIds.length === 2 &&
        conversation.memberIds.includes(userA) &&
        conversation.memberIds.includes(userB)
    ) || null
  );
}

function createConversation({ type, name, memberIds, createdBy }) {
  const conversations = readConversations();
  const now = new Date().toISOString();
  const uniqueMembers = [...new Set(memberIds)];

  const conversation = {
    id: createId(),
    type,
    name: type === "group" ? name : "",
    memberIds: uniqueMembers,
    createdBy,
    createdAt: now,
    lastMessageAt: now,
  };

  conversations.push(conversation);
  writeConversations(conversations);
  return conversation;
}

function addMembers(conversationId, memberIds) {
  const conversations = readConversations();
  const index = conversations.findIndex((c) => c.id === conversationId);
  if (index === -1) {
    return null;
  }

  const merged = new Set(conversations[index].memberIds);
  memberIds.forEach((id) => merged.add(id));
  conversations[index].memberIds = [...merged];
  writeConversations(conversations);
  return conversations[index];
}

function touchConversation(conversationId, timestamp) {
  const conversations = readConversations();
  const index = conversations.findIndex((c) => c.id === conversationId);
  if (index === -1) {
    return;
  }
  conversations[index].lastMessageAt = timestamp;
  writeConversations(conversations);
}

function listConversationsForUser(userId) {
  return readConversations()
    .filter((conversation) => conversation.memberIds.includes(userId))
    .sort((a, b) => (a.lastMessageAt < b.lastMessageAt ? 1 : -1));
}

function addMessage(conversationId, senderId, body) {
  const messages = readMessages();
  const now = new Date().toISOString();
  const message = {
    id: createId(),
    conversationId,
    senderId,
    body,
    createdAt: now,
  };

  messages.push(message);
  writeMessages(messages);
  touchConversation(conversationId, now);
  return message;
}

function listMessages(conversationId) {
  return readMessages()
    .filter((message) => message.conversationId === conversationId)
    .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));
}

function lastMessageFor(conversationId) {
  const messages = listMessages(conversationId);
  return messages.length ? messages[messages.length - 1] : null;
}

module.exports = {
  getConversation,
  isMember,
  findDirectConversation,
  createConversation,
  addMembers,
  listConversationsForUser,
  addMessage,
  listMessages,
  lastMessageFor,
};
