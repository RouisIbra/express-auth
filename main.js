const express = require("express");
const indexRouter = require("./src/routes/index.route");
const debug = require("debug")("express-auth:application");
const morgan = require("morgan");
const { initDB } = require("./src/db/db");
const registerRouter = require("./src/routes/register.route");

// init app
const app = express();

// define port
const port = process.env.PORT || 3000;

// enable http request logger
app.use(morgan("dev"));

// parse urlencoded body sent from a html form
app.use(express.urlencoded({ extended: false }));

// parse json body
app.use(express.json());

// mount routers
app.use("/", indexRouter);
app.use("/register", registerRouter);

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

// graceful shutdown
const gracefulShutdown = () => {
  if (server && server.listening) {
    debug("Closing server...");
    server.close((err) => {
      if (err) {
        console.error("Failed to gracefully shutdown server");
      } else {
        debug("Server closed successfully");
      }
    });
  }
};

// signal handler for process termination
process.on("SIGTERM", gracefulShutdown);

// signal handler for process interrupt (by pressing ctrl+c on console)
process.on("SIGINT", gracefulShutdown);

// signal handler for nodemon reload
process.on("SIGHUP", gracefulShutdown);
