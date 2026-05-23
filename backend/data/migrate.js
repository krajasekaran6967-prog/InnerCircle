// Run once: node backend/data/migrate.js
// Imports existing users.json into the SQLite database.

const fs = require("fs");
const path = require("path");
const db = require("./db");

const USERS_FILE = path.join(__dirname, "users.json");

if (!fs.existsSync(USERS_FILE)) {
  console.log("No users.json found — nothing to migrate.");
  process.exit(0);
}

const users = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));

const insertUser = db.prepare(
  "INSERT OR IGNORE INTO users (id, email, passwordHash, name, department, bio, thumbnailUrl, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
);
const insertFriend = db.prepare(
  "INSERT OR IGNORE INTO friends (userId, friendId) VALUES (?, ?)"
);

db.exec("BEGIN");
try {
  for (const u of users) {
    insertUser.run(
      u.id,
      u.email,
      u.passwordHash,
      u.name,
      u.department,
      u.bio || "",
      u.thumbnailUrl || "",
      u.createdAt || new Date().toISOString()
    );
    for (const friendId of u.friends || []) {
      insertFriend.run(u.id, friendId);
    }
  }
  db.exec("COMMIT");
  console.log(`Migrated ${users.length} user(s).`);
} catch (e) {
  db.exec("ROLLBACK");
  console.error("Migration failed:", e.message);
  process.exit(1);
}
