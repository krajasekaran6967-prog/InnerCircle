const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const FRIENDS_FILE = path.join(__dirname, "friends.json");

function readFriends() {
  if (!fs.existsSync(FRIENDS_FILE)) {
    return [];
  }

  const raw = fs.readFileSync(FRIENDS_FILE, "utf8");
  if (!raw.trim()) {
    return [];
  }

  return JSON.parse(raw);
}

function writeFriends(friends) {
  fs.writeFileSync(FRIENDS_FILE, JSON.stringify(friends, null, 2));
}

function createId() {
  return crypto.randomBytes(16).toString("hex");
}

function getFriendshipBetween(userA, userB) {
  return (
    readFriends().find(
      (record) =>
        (record.requesterId === userA && record.recipientId === userB) ||
        (record.requesterId === userB && record.recipientId === userA)
    ) || null
  );
}

function getFriendRecord(id) {
  return readFriends().find((record) => record.id === id) || null;
}

function createFriendRequest(requesterId, recipientId) {
  const friends = readFriends();
  const now = new Date().toISOString();
  const record = {
    id: createId(),
    requesterId,
    recipientId,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  friends.push(record);
  writeFriends(friends);
  return record;
}

function updateFriendStatus(id, status) {
  const friends = readFriends();
  const index = friends.findIndex((record) => record.id === id);
  if (index === -1) {
    return null;
  }

  friends[index].status = status;
  friends[index].updatedAt = new Date().toISOString();
  writeFriends(friends);
  return friends[index];
}

function removeFriendRecord(id) {
  const friends = readFriends();
  const next = friends.filter((record) => record.id !== id);
  if (next.length === friends.length) {
    return false;
  }
  writeFriends(next);
  return true;
}

function listAccepted(userId) {
  return readFriends().filter(
    (record) =>
      record.status === "accepted" &&
      (record.requesterId === userId || record.recipientId === userId)
  );
}

function listIncomingRequests(userId) {
  return readFriends().filter(
    (record) => record.status === "pending" && record.recipientId === userId
  );
}

function listOutgoingRequests(userId) {
  return readFriends().filter(
    (record) => record.status === "pending" && record.requesterId === userId
  );
}

function areFriends(userA, userB) {
  const record = getFriendshipBetween(userA, userB);
  return Boolean(record && record.status === "accepted");
}

module.exports = {
  readFriends,
  getFriendshipBetween,
  getFriendRecord,
  createFriendRequest,
  updateFriendStatus,
  removeFriendRecord,
  listAccepted,
  listIncomingRequests,
  listOutgoingRequests,
  areFriends,
};
