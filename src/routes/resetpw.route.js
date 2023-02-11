const express = require("express");
const { RateLimiterMemory } = require("rate-limiter-flexible");
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

const maxWrongAttemptsByIPperDay = 15;

const limiterSlowBruteByIP = new RateLimiterMemory({
  keyPrefix: "pw_reset_requests_ip_per_day",
  points: maxWrongAttemptsByIPperDay,
  duration: 60 * 60 * 24,
  blockDuration: 60 * 60 * 24 * 10, // Block for 10 days, if 15 attempts per day
});

resetPwRouter.post("/send", authRequired(false), async (req, res, next) => {
  try {
    const ipAddr = req.ip;
    const resSlowByIP = await limiterSlowBruteByIP.get(ipAddr);
    let retrySecs = 0;
    if (
      resSlowByIP !== null &&
      resSlowByIP.consumedPoints > maxWrongAttemptsByIPperDay
    ) {
      retrySecs = Math.round(resSlowByIP.msBeforeNext / 1000) || 1;
    }

    // block multiple failed attempts
    if (retrySecs > 0) {
      res.set("Retry-After", String(retrySecs));
      res.status(429).send("Too Many Requests");
      return;
    }

    const { email } = await validateResetPasswordRequestBody(req.body);
    const userId = getUserIDByEmail(email);

    await limiterSlowBruteByIP.consume(ipAddr);

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
    if (error instanceof Error) {
      next(error);
    } else {
      res.set(
        "Retry-After",
        String(Math.round(error.msBeforeNext / 1000)) || 1
      );
      res.status(429).send("Too Many Requests");
    }
  }
});

resetPwRouter.post("/", authRequired(false), async (req, res, next) => {
  try {
    const ipAddr = req.ip;
    const resSlowByIP = await limiterSlowBruteByIP.get(ipAddr);
    let retrySecs = 0;
    if (
      resSlowByIP !== null &&
      resSlowByIP.consumedPoints > maxWrongAttemptsByIPperDay
    ) {
      retrySecs = Math.round(resSlowByIP.msBeforeNext / 1000) || 1;
    }

    // block multiple failed attempts
    if (retrySecs > 0) {
      res.set("Retry-After", String(retrySecs));
      res.status(429).send("Too Many Requests");
      return;
    }
    await limiterSlowBruteByIP.consume(ipAddr);

    const body = validateResetPasswordBody(req.body);
    const userId = getUserIdByPasswordResethash(body.resetcode);
    if (!userId) {
      res.status(404).json({ message: "Invalid reset code" });
      return;
    }

    const newHash = encryptPassword(body.password);
    changeUserPassword(userId, newHash);

    res.status(200).json({ message: "Password successfully changed" });
  } catch (error) {
    if (error instanceof Error) {
      next(error);
    } else {
      res.set(
        "Retry-After",
        String(Math.round(error.msBeforeNext / 1000)) || 1
      );
      res.status(429).send("Too Many Requests");
    }
  }
});

module.exports = resetPwRouter;
