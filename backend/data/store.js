const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DATA_DIR = path.join(__dirname);
const USERS_FILE = path.join(DATA_DIR, "users.json");
const LOCK_FILE = path.join(DATA_DIR, ".users.lock");

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

function readUsers() {
  if (!fs.existsSync(USERS_FILE)) {
    return [];
  }

  const raw = fs.readFileSync(USERS_FILE, "utf8");
  if (!raw.trim()) {
    return [];
  }

  return JSON.parse(raw).map((user) => ({
    ...user,
    friends: user.friends || [],
  }));
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
      friends: [],
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

function listFriends(id) {
  const users = readUsers();
  const user = users.find((entry) => entry.id === id);
  if (!user) {
    return [];
  }
  const friendSet = new Set(user.friends || []);
  return users.filter((entry) => friendSet.has(entry.id));
}

function addFriend(userId, friendId) {
  if (userId === friendId) {
    throw new Error("You cannot add yourself as a friend.");
  }

  acquireLock();
  try {
    const users = readUsers();
    const userIndex = users.findIndex((entry) => entry.id === userId);
    const friendIndex = users.findIndex((entry) => entry.id === friendId);
    if (userIndex === -1 || friendIndex === -1) {
      return null;
    }

    users[userIndex].friends = users[userIndex].friends || [];
    users[friendIndex].friends = users[friendIndex].friends || [];

    if (!users[userIndex].friends.includes(friendId)) {
      users[userIndex].friends.push(friendId);
    }
    if (!users[friendIndex].friends.includes(userId)) {
      users[friendIndex].friends.push(userId);
    }

    writeUsers(users);
    return users[userIndex];
  } finally {
    releaseLock();
  }
}

function removeFriend(userId, friendId) {
  acquireLock();
  try {
    const users = readUsers();
    const userIndex = users.findIndex((entry) => entry.id === userId);
    const friendIndex = users.findIndex((entry) => entry.id === friendId);
    if (userIndex === -1 || friendIndex === -1) {
      return null;
    }

    users[userIndex].friends = (users[userIndex].friends || []).filter((id) => id !== friendId);
    users[friendIndex].friends = (users[friendIndex].friends || []).filter((id) => id !== userId);
    writeUsers(users);
    return users[userIndex];
  } finally {
    releaseLock();
  }
}

function toPublicUser(user, viewerId = null) {
  if (!user) {
    return null;
  }

  const { passwordHash, ...publicUser } = user;
  publicUser.friends = publicUser.friends || [];
  publicUser.friendCount = publicUser.friends.length;
  if (viewerId) {
    publicUser.isFriend = publicUser.friends.includes(viewerId);
  }
  return publicUser;
}

module.exports = {
  readUsers,
  findUserByEmail,
  findUserById,
  createUser,
  updateUser,
  searchUsers,
  listFriends,
  addFriend,
  removeFriend,
  toPublicUser,
};
