const db = require("better-sqlite3")("data/data.db");
const debug = require("debug")("express-auth:db");

// WAL mode for better performance
db.pragma("journal_mode = WAL");

const initDB = () => {
  try {
    debug("Initializing database tables...");
    db.transaction(() => {
      db.prepare(
        "CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, email TEXT, hash TEXT)"
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
  const stmt = db.prepare("SELECT username, email FROM users WHERE id=?");
  const user = stmt.get(id);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

process.on("exit", () => {
  try {
    debug("Closing database...");
    db.close();
    debug("Database closed successfully");
  } catch (error) {
    console.error("DB ERROR: Failed to close database");
    console.error(error.stack);
  }
});

module.exports = {
  initDB,
  createNewUser,
  getUserIDByUsername,
  getUserhash,
  getUserById,
};
