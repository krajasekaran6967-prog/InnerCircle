const { DatabaseSync } = require("node:sqlite");
const path = require("path");

const dbPath = process.env.DB_PATH || path.join(__dirname, "innercircle.db");
const db = new DatabaseSync(dbPath);

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id           TEXT PRIMARY KEY,
    email        TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    name         TEXT NOT NULL,
    department   TEXT NOT NULL,
    bio          TEXT NOT NULL DEFAULT '',
    thumbnailUrl TEXT NOT NULL DEFAULT '',
    createdAt    TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS friends (
    userId   TEXT NOT NULL REFERENCES users(id),
    friendId TEXT NOT NULL REFERENCES users(id),
    PRIMARY KEY (userId, friendId)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id              TEXT PRIMARY KEY,
    senderId        TEXT NOT NULL REFERENCES users(id),
    recipientId     TEXT,
    conversationKey TEXT,
    text            TEXT NOT NULL,
    createdAt       TEXT NOT NULL
  );
`);

module.exports = db;
