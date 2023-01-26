const express = require("express");
const authRequired = require("../middlewares/auth-required");

const userRouter = express.Router();

userRouter.get("/", (req, res) => {
  if (req.session.user) {
    res.status(200).json(req.session.user);
  } else {
    res.status(401).json({ message: "You are not logged in" });
  }
});

module.exports = userRouter;
