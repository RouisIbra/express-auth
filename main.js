const express = require("express");
const debug = require("debug")("express-auth:application");
const morgan = require("morgan");
const session = require("express-session");
const helmet = require("helmet");
const path = require("path");
const fs = require("fs");

// import dotenv variables in development mode
if (process.env.NODE_ENV == "development") {
  let filename = path.join(__dirname, ".env.dev");
  if (fs.existsSync(filename)) {
    require("dotenv").config({ path: filename });
  } else {
    throw new Error(
      ".env.dev file is required to run the server. Create one from the .env.dev.template file"
    );
  }
}

// setup database for sessions
const db = require("better-sqlite3")("data/sessions.db");
const sqliteStore = require("better-sqlite3-session-store")(session);

const { initDB, closeDB } = require("./src/db/db");

const indexRouter = require("./src/routes/index.route");
const registerRouter = require("./src/routes/register.route");
const loginRouter = require("./src/routes/login.route");
const logoutRouter = require("./src/routes/logout.route");
const userRouter = require("./src/routes/user.route");
const resetPwRouter = require("./src/routes/resetpw.route");

// init app
const app = express();

// define port
const port = process.env.PORT || 3000;

// reduce fingerprinting
app.disable("x-powered-by");

// enable helmet
app.use(helmet());

// enable http request logger
app.use(morgan("dev"));

// parse urlencoded body sent from a html form
app.use(express.urlencoded({ extended: false }));

// parse json body
app.use(express.json());

// session middleware
app.use(
  session({
    store: new sqliteStore({
      client: db,
      expired: {
        clear: true,
        intervalMs: 900000,
      },
    }),
    resave: false,
    saveUninitialized: false,
    secret: "shhh very secret",
    name: "sessionid",
    cookie: {
      secure: process.env.NODE_ENV === "production" ? true : "auto",
      httpOnly: true,
    },
  })
);

// mount routers
app.use("/", indexRouter);
app.use("/register", registerRouter);
app.use("/login", loginRouter);
app.use("/logout", logoutRouter);
app.use("/user", userRouter);
app.use("/resetpw", resetPwRouter);

// handle not found route
app.use((req, res, next) => {
  res.status(404).json({ message: "404 Not found" });
});

// base error handler
app.use((err, req, res, next) => {
  // if response is already being sent and an error occurs meanwhile, delegate to the default express error handler to close the connection
  if (res.headersSent) {
    return next(err);
  }
  console.error(err.stack);

  // tell the client that something wrong happened but never tell him what exactly happened
  // otherwise you will be exploited
  res.status(500).json({ message: "An internal error has occured" });
});

// run server
const server = app.listen(port, () => {
  debug(`Server running and listening at http://localhost:3000`);
});

// init database when server starts listening
server.on("listening", () => {
  initDB();
});

const closeSessionsDB = () => {
  try {
    if (db && db.open) {
      debug("Closing sessions database...");
      db.close();
      debug("Sessions database closed successfully");
    }
  } catch (error) {
    console.error("Failed to close sessions database");
    console.error(`${error.name}: ${error.message}`);
    console.error(error.stack);
  }
};

const closeServer = (callback) => {
  debug("Closing...");
  if (server && server.listening) {
    process.exitCode = debug("Closing server...");
    // close server
    server.close((err) => {
      if (err) {
        console.error("Failed to gracefully shutdown server");
        console.error(`${err.name}: ${err.message}`);
        console.error(err.stack);
      } else {
        debug("Server closed successfully");
      }
      callback();
    });
  }
};

// graceful shutdown
const gracefulShutdown = () => {
  closeServer(() => {
    closeDB();
    closeSessionsDB();
    process.exit();
  });
};

// signal handler for process termination
process.on("SIGTERM", gracefulShutdown);

// signal handler for process interrupt (by pressing ctrl+c on console)
process.on("SIGINT", gracefulShutdown);

// signal handler for nodemon reload
process.on("SIGHUP", gracefulShutdown);
