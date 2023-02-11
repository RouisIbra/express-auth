const db = require("better-sqlite3")("data/data.db");
const debug = require("debug")("express-auth:db");
const crypto = require("crypto");

// WAL mode for better performance
db.pragma("journal_mode = WAL");

const initDB = () => {
  try {
    debug("Initializing database tables...");
    db.transaction(() => {
      db.prepare(
        "CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, email TEXT UNIQUE, hash TEXT)"
      ).run();
      db.prepare(
        "CREATE TABLE IF NOT EXISTS resetpw(id INTEGER PRIMARY KEY AUTOINCREMENT, userid INTEGER, resethash TEXT UNIQUE, date TEXT, done INTEGER, FOREIGN KEY(userid) REFERENCES users(id) )"
      ).run();
    })();
    debug("Finished initializing database tables");
  } catch (error) {
    // if database failed to initialize tables end the process
    console.error(error.stack);
    process.kill(process.pid, "SIGTERM");
  }
};

const createNewUser = (username, email, hash) => {
  const stmt = db.prepare(
    "INSERT INTO users VALUES(NULL, $username, $email, $hash)"
  );
  stmt.run({ username, email, hash });
};

/**
 * @param {string} username
 * @returns {number | null}
 */
const getUserIDByUsername = (username) => {
  const stmt = db.prepare("SELECT id from users WHERE username=?");
  const row = stmt.get(username);
  return row ? row.id : null;
};

/**
 * @param {number} id
 * @returns {string}
 */
const getUserhash = (id) => {
  const stmt = db.prepare("SELECT hash from users WHERE id=?");
  const row = stmt.get(id);

  if (!row) {
    throw new Error("User not found");
  }

  return row.hash;
};

const getUserById = (id) => {
  const stmt = db.prepare("SELECT id, username, email FROM users WHERE id=?");
  const user = stmt.get(id);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

/**
 * Creates a password reset request into database and returns the reset hash
 * @param {number} userId
 * @returns {string}
 */
const createPasswordResetRequest = (userId) => {
  if (!userId) {
    throw new Error("UserID is null");
  }

  // generate random hash
  const resetHash = crypto.randomBytes(20).toString("hex");

  // insert it into db
  const stmt = db.prepare(
    "INSERT INTO resetpw VALUES(NULL, $userId, $resetHash, DateTime('now'), 0)"
  );
  stmt.run({ userId, resetHash });

  return resetHash;
};

/**
 * @param {string} email
 * @returns {number | null}
 */
const getUserIDByEmail = (email) => {
  const stmt = db.prepare("SELECT id from users WHERE email=?");
  const row = stmt.get(email);
  return row ? row.id : null;
};

/**
 * @param {string} resetHash
 * @returns {number | null}
 */
const getUserIdByPasswordResethash = (resetHash) => {
  if (!resetHash) {
    throw new Error("Resethash is null");
  }

  const stmt = db.prepare("SELECT userid FROM resetpw WHERE resethash=?");
  const row = stmt.get(resetHash);
  return row ? row.userid : null;
};

const changeUserPassword = (id, newPasswordHash) => {
  if (!id) {
    throw new Error("Id is null");
  }

  if (!newPasswordHash) {
    throw new Error("newPasswordHash is null");
  }

  const stmt = db.prepare("UPDATE users SET hash=$newhash where id=$id");
  stmt.run({ newhash: newPasswordHash, id });
};

const closeDB = () => {
  try {
    debug("Closing database...");
    db.close();
    debug("Database closed successfully");
  } catch (error) {
    console.error("DB ERROR: Failed to close database");
    console.error(error.stack);
  }
};

module.exports = {
  initDB,
  closeDB,
  createNewUser,
  getUserIDByUsername,
  getUserhash,
  getUserById,
  createPasswordResetRequest,
  getUserIDByEmail,
  getUserIdByPasswordResethash,
  changeUserPassword,
};
