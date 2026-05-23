const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DATA_DIR = path.join(__dirname);
const USERS_FILE = path.join(DATA_DIR, "users.json");
const LOCK_FILE = path.join(DATA_DIR, ".users.lock");

function acquireLock() {
  const start = Date.now();
  while (fs.existsSync(LOCK_FILE)) {
    if (Date.now() - start > 5000) {
      throw new Error("Timeout waiting for lock");
    }
    fs.unlinkSync(LOCK_FILE);
  }
  fs.writeFileSync(LOCK_FILE, String(process.pid));
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

function readUsers() {
  if (!fs.existsSync(USERS_FILE)) {
    return [];
  }

  const raw = fs.readFileSync(USERS_FILE, "utf8");
  if (!raw.trim()) {
    return [];
  }

  return JSON.parse(raw);
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function createId() {
  return crypto.randomBytes(16).toString("hex");
}

function findUserByEmail(email) {
  const normalized = email.trim().toLowerCase();
  return readUsers().find((user) => user.email === normalized) || null;
}

function findUserById(id) {
  return readUsers().find((user) => user.id === id) || null;
}

function createUser({ email, passwordHash, name, department }) {
  acquireLock();
  try {
    const users = readUsers();
    const user = {
      id: createId(),
      email: email.trim().toLowerCase(),
      passwordHash,
      name: name.trim(),
      department: department.trim(),
      bio: "",
      thumbnailUrl: "",
      createdAt: new Date().toISOString(),
    };

    users.push(user);
    writeUsers(users);
    return user;
  } finally {
    releaseLock();
  }
}

function updateUser(id, updates) {
  acquireLock();
  try {
    const users = readUsers();
    const index = users.findIndex((user) => user.id === id);
    if (index === -1) {
      return null;
    }

    const user = users[index];
    if (updates.name !== undefined) {
      user.name = String(updates.name).trim();
    }
    if (updates.department !== undefined) {
      user.department = String(updates.department).trim();
    }
    if (updates.bio !== undefined) {
      user.bio = String(updates.bio).trim();
    }
    if (updates.thumbnailUrl !== undefined) {
      user.thumbnailUrl = updates.thumbnailUrl;
    }

    users[index] = user;
    writeUsers(users);
    return user;
  } finally {
    releaseLock();
  }
}

function searchUsers(query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return readUsers();
  }

  return readUsers().filter((user) => {
    const haystack = [user.name, user.email, user.department, user.bio]
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalized);
  });
}

function toPublicUser(user) {
  if (!user) {
    return null;
  }

  const { passwordHash, ...publicUser } = user;
  return publicUser;
}

module.exports = {
  readUsers,
  findUserByEmail,
  findUserById,
  createUser,
  updateUser,
  searchUsers,
  toPublicUser,
};
