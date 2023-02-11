const express = require("express");
const {
  createPasswordResetRequest,
  getUserIDByEmail,
  getUserIdByPasswordResethash,
  changeUserPassword,
} = require("../db/db");
const authRequired = require("../middlewares/auth-required");
const { sendResetPasswordMail } = require("../utils/mailer");
const { encryptPassword } = require("../utils/password-encryption");
const {
  validateResetPasswordRequestBody,
  validateResetPasswordBody,
} = require("../validator/auth");
const resetPwRouter = express.Router();

resetPwRouter.post("/send", authRequired(false), async (req, res, next) => {
  try {
    const { email } = await validateResetPasswordRequestBody(req.body);
    const userId = getUserIDByEmail(email);

    if (!userId) {
      res
        .status(404)
        .json({ message: "Email not linked to any registered user" });
      return;
    }

    const resetHash = createPasswordResetRequest(userId);
    await sendResetPasswordMail(email, resetHash);

    res.status(200).json({ message: "Reset link sent via email" });
  } catch (error) {
    next(error);
  }
});

resetPwRouter.post("/", authRequired(false), (req, res) => {
  const body = validateResetPasswordBody(req.body);

  const userId = getUserIdByPasswordResethash(body.resetcode);

  if (!userId) {
    res.status(404).json({ message: "Invalid reset code" });
    return;
  }

  const newHash = encryptPassword(body.password);
  changeUserPassword(userId, newHash);

  res.status(200).json({ message: "Password successfully changed" });
});

module.exports = resetPwRouter;
