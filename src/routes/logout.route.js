const express = require("express");
const authRequired = require("../middlewares/auth-required");

const logoutRouter = express.Router();

logoutRouter.post("/", authRequired(true), (req, res) => {
  req.session.destroy((err) => {
    if (err) throw err;

    res.status(200).json({ message: "Successfully logged out" });
  });
});

module.exports = logoutRouter;
