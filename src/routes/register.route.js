const express = require("express");
const { createNewUser, getUserIDByUsername } = require("../db/db");
const authRequired = require("../middlewares/auth-required");
const { encryptPassword } = require("../utils/password-encryption");
const { validateRegisterBody } = require("../validator/auth");

const registerRouter = express.Router();

registerRouter.post("/", authRequired(false), (req, res) => {
  const body = validateRegisterBody(req.body);

  // check if user is already registered
  const userId = getUserIDByUsername(body.username);

  // if user is already registered send 403 error status
  if (userId) {
    res.status(403).json({ message: "Username already registered" });
    return;
  }

  const hash = encryptPassword(body.password);

  createNewUser(body.username, body.email, hash);

  res.status(200).json({ message: "Registration successfull" });
});

module.exports = registerRouter;
