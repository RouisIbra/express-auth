const express = require("express");

// init router
const indexRouter = express.Router();

indexRouter.get("/", (req, res) => {
  //throw new Error("idk");
  res.status(200).json({ message: "Server is running" });
});

// export router
module.exports = indexRouter;
