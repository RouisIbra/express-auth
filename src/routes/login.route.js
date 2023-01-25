const express = require("express");
const { getUserIDByUsername, getUserhash, getUserById } = require("../db/db");
const authRequired = require("../middlewares/auth-required");
const { verifyPassword } = require("../utils/password-encryption");
const { validateLoginBody } = require("../validator/auth");

const loginRouter = express.Router();

loginRouter.post("/", authRequired(false), (req, res) => {
  // validate request body
  const body = validateLoginBody(req.body);

  // get user id
  const userID = getUserIDByUsername(body.username);

  // if userID not found end with 403 response
  if (!userID) {
    res.status(403).json({ message: "Username not found" }).end();
    return;
  }

  // get user hash
  const hash = getUserhash(userID);

  // verify if password is correct
  const valid = verifyPassword(body.password, hash);

  // if password is incorrect end with 403 response
  if (!valid) {
    res.status(403).json({ message: "Incorrect passsword" }).end();
    return;
  }

  // generate session for loggin in user
  req.session.regenerate((err) => {
    if (err) throw err;

    // save user's info (id, username, email) as user object in session
    req.session.user = getUserById(userID);

    // send success response
    res.status(200).json({ message: "Successfully logged in" });
  });
});

module.exports = loginRouter;
