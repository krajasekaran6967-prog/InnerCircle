const crypto = require("crypto");
const db = require("./db");

function createId() {
  return crypto.randomBytes(16).toString("hex");
}

function rowToUser(row) {
  if (!row) return null;
  return {
    ...row,
    friends: db
      .prepare("SELECT friendId FROM friends WHERE userId = ?")
      .all(row.id)
      .map((r) => r.friendId),
  };
}

function findUserByEmail(email) {
  return rowToUser(
    db.prepare("SELECT * FROM users WHERE email = ?").get(email.trim().toLowerCase())
  );
}

function findUserById(id) {
  return rowToUser(db.prepare("SELECT * FROM users WHERE id = ?").get(id));
}

function createUser({ email, passwordHash, name, department }) {
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
  db.prepare(
    "INSERT INTO users (id, email, passwordHash, name, department, bio, thumbnailUrl, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(user.id, user.email, user.passwordHash, user.name, user.department, user.bio, user.thumbnailUrl, user.createdAt);
  return { ...user, friends: [] };
}

function updateUser(id, updates) {
  const allowed = ["name", "department", "bio", "thumbnailUrl"];
  const fields = [];
  const values = [];
  for (const key of allowed) {
    if (updates[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(
        key === "thumbnailUrl" ? updates[key] : String(updates[key]).trim()
      );
    }
  }
  if (!fields.length) return findUserById(id);
  values.push(id);
  db.prepare(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  return findUserById(id);
}

function searchUsers(query) {
  const normalized = query.trim().toLowerCase();
  const rows = db.prepare("SELECT * FROM users").all();
  if (!normalized) return rows.map(rowToUser);
  return rows
    .filter((u) =>
      [u.name, u.email, u.department, u.bio].join(" ").toLowerCase().includes(normalized)
    )
    .map(rowToUser);
}

function listFriends(userId) {
  const friendIds = db
    .prepare("SELECT friendId FROM friends WHERE userId = ?")
    .all(userId)
    .map((r) => r.friendId);
  return friendIds.map(findUserById).filter(Boolean);
}

const insertFriend = db.prepare("INSERT OR IGNORE INTO friends (userId, friendId) VALUES (?, ?)");

function addFriend(userId, friendId) {
  if (userId === friendId) throw new Error("You cannot add yourself as a friend.");
  db.exec("BEGIN");
  try {
    insertFriend.run(userId, friendId);
    insertFriend.run(friendId, userId);
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
  return findUserById(userId);
}

function removeFriend(userId, friendId) {
  if (!findUserById(friendId)) return null;
  db.exec("BEGIN");
  try {
    db.prepare("DELETE FROM friends WHERE userId = ? AND friendId = ?").run(userId, friendId);
    db.prepare("DELETE FROM friends WHERE userId = ? AND friendId = ?").run(friendId, userId);
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
  return findUserById(userId);
}

function toPublicUser(user, viewerId = null) {
  if (!user) return null;
  const { passwordHash, ...pub } = user;
  pub.friends = pub.friends || [];
  pub.friendCount = pub.friends.length;
  if (viewerId) {
    const viewer = db.prepare("SELECT 1 FROM friends WHERE userId = ? AND friendId = ?").get(viewerId, user.id);
    pub.isFriend = !!viewer;
  }
  return pub;
}

module.exports = {
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
