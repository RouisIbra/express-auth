const db = require("better-sqlite3")("data/data.db");
const debug = require("debug")("express-auth:db");

// WAL mode for better performance
db.pragma("journal_mode = WAL");

const initDB = () => {
  try {
    debug("Initializing database tables...");
    db.transaction(() => {
      db.prepare(
        "CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, email TEXT, hash TEXT)"
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

module.exports = { initDB, createNewUser };
