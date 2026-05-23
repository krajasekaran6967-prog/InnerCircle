const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DATA_DIR = path.join(__dirname);
const MESSAGES_FILE = path.join(DATA_DIR, "messages.json");
const LOCK_FILE = path.join(DATA_DIR, ".messages.lock");

function acquireLock() {
  const start = Date.now();
  while (true) {
    try {
      const fd = fs.openSync(LOCK_FILE, "wx");
      fs.writeFileSync(fd, String(process.pid));
      fs.closeSync(fd);
      return;
    } catch (error) {
      if (error.code !== "EEXIST") {
        throw error;
      }
      if (Date.now() - start > 5000) {
        throw new Error("Timeout waiting for lock");
      }
    }
  }
}

function releaseLock() {
  try {
    if (fs.existsSync(LOCK_FILE)) {
      const pid = fs.readFileSync(LOCK_FILE, "utf8");
      if (pid === String(process.pid)) {
        fs.unlinkSync(LOCK_FILE);
      }
    }
  } catch {
    // Ignore errors
  }
}

function readDb() {
  if (!fs.existsSync(MESSAGES_FILE)) {
    return { public: [], direct: [] };
  }

  const raw = fs.readFileSync(MESSAGES_FILE, "utf8");
  if (!raw.trim()) {
    return { public: [], direct: [] };
  }

  const parsed = JSON.parse(raw);
  return {
    public: parsed.public || [],
    direct: parsed.direct || [],
  };
}

function writeDb(db) {
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(db, null, 2));
}

function createId() {
  return crypto.randomBytes(16).toString("hex");
}

function createPublicMessage(senderId, text) {
  acquireLock();
  try {
    const db = readDb();
    const message = {
      id: createId(),
      senderId,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };
    db.public.push(message);
    writeDb(db);
    return message;
  } finally {
    releaseLock();
  }
}

function listPublicMessages(limit = 50) {
  const db = readDb();
  return db.public.slice(-limit);
}

function directKey(userA, userB) {
  return [userA, userB].sort().join(":");
}

function createDirectMessage(senderId, recipientId, text) {
  acquireLock();
  try {
    const db = readDb();
    const message = {
      id: createId(),
      senderId,
      recipientId,
      conversationKey: directKey(senderId, recipientId),
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };
    db.direct.push(message);
    writeDb(db);
    return message;
  } finally {
    releaseLock();
  }
}

function listDirectMessages(userA, userB, limit = 100) {
  const db = readDb();
  const key = directKey(userA, userB);
  return db.direct.filter((msg) => msg.conversationKey === key).slice(-limit);
}

module.exports = {
  createPublicMessage,
  listPublicMessages,
  createDirectMessage,
  listDirectMessages,
};
