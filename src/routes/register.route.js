const express = require("express");
const { createNewUser } = require("../db/db");
const authRequired = require("../middlewares/auth-required");
const { encryptPassword } = require("../utils/password-encryption");
const { validateRegisterBody } = require("../validator/auth");

const registerRouter = express.Router();

registerRouter.post("/", authRequired(false), (req, res) => {
  const body = validateRegisterBody(req.body);

  const hash = encryptPassword(body.password);

  createNewUser(body.username, body.email, hash);

  res.status(200).json({ message: "Registration successfull" });
});

module.exports = registerRouter;
