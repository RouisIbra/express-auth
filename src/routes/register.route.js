const express = require("express");
const { createNewUser } = require("../db/db");
const { encryptPassword } = require("../utils/password-encryption");
const { validateRegisterBody } = require("../validator/auth");

const registerRouter = express.Router();

registerRouter.post("/", async (req, res, next) => {
  try {
    const body = validateRegisterBody(req.body);

    const { hash, salt } = await encryptPassword(body.password);

    createNewUser(body.username, body.email, hash, salt);

    res.status(200).json({ message: "Registration successfull" });
  } catch (error) {
    next(error);
  }
});

module.exports = registerRouter;
