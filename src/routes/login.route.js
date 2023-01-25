const express = require("express");
const { getUserIDByUsername, getUserhash, getUserById } = require("../db/db");
const { verifyPassword } = require("../utils/password-encryption");
const { validateLoginBody } = require("../validator/auth");

const loginRouter = express.Router();

loginRouter.post("/", (req, res) => {
  // validate request body
  const body = validateLoginBody(req.body);

  // get user id
  const userID = getUserIDByUsername(body.username);

  // if userID not found send 403
  if (!userID) {
    res.status(403).json({ message: "Username not found" }).end();
    return;
  }

  const hash = getUserhash(userID);

  const valid = verifyPassword(body.password, hash);

  if (!valid) {
    res.status(403).json({ message: "Incorrect passsword" }).end();
    return;
  }

  req.session.regenerate((err) => {
    if (err) throw err;

    req.session.user = getUserById(userID);

    res.status(200).json({ message: "Successfully logged in" });
  });
});

module.exports = loginRouter;
