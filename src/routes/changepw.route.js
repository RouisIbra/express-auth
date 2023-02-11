const express = require("express");
const { changeUserPassword } = require("../db/db");
const authRequired = require("../middlewares/auth-required");
const { encryptPassword } = require("../utils/password-encryption");
const { validatechangePasswordBody } = require("../validator/auth");

const changePwRouter = express.Router();

changePwRouter.post("/", authRequired(true), (req, res) => {
  const body = validatechangePasswordBody(req.body);
  const user = req.session.user;

  const hash = encryptPassword(body.password);

  changeUserPassword(user.id, hash);

  res.status(200).json({ message: "Password changed successfully" });
});

module.exports = changePwRouter;
