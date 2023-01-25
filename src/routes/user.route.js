const express = require("express");
const authRequired = require("../middlewares/auth-required");

const userRouter = express.Router();

userRouter.get("/", authRequired(true), (req, res) => {
  res.status(200).json(req.session.user);
});

module.exports = userRouter;
