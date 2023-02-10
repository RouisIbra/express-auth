const express = require("express");
const { getUserIDByUsername, getUserhash, getUserById } = require("../db/db");
const authRequired = require("../middlewares/auth-required");
const { verifyPassword } = require("../utils/password-encryption");
const { validateLoginBody } = require("../validator/auth");
const { RateLimiterMemory } = require("rate-limiter-flexible");

const maxWrongAttemptsByIPperDay = 100;
const maxConsecutiveFailsByUsernameAndIP = 15;

const limiterSlowBruteByIP = new RateLimiterMemory({
  keyPrefix: "login_fail_ip_per_day",
  points: maxWrongAttemptsByIPperDay,
  duration: 60 * 60 * 24,
  blockDuration: 60 * 60 * 24, // Block for 1 day, if 100 wrong attempts per day
});

const limiterConsecutiveFailsByUsernameAndIP = new RateLimiterMemory({
  keyPrefix: "login_fail_consecutive_username_and_ip",
  points: maxConsecutiveFailsByUsernameAndIP,
  duration: 60 * 60 * 24 * 10, // Store number for 10 days since first fail
  blockDuration: 60 * 60, // Block for 1 hour
});

const getUsernameIPkey = (username, ip) => `${username}_${ip}`;

const loginRouter = express.Router();

loginRouter.post("/", authRequired(false), async (req, res, next) => {
  try {
    // validate request body
    const body = await validateLoginBody(req.body);

    const ipAddr = req.ip;
    const usernameIPkey = getUsernameIPkey(body.username, ipAddr);

    const [resUsernameAndIP, resSlowByIP] = await Promise.all([
      limiterConsecutiveFailsByUsernameAndIP.get(usernameIPkey),
      limiterSlowBruteByIP.get(ipAddr),
    ]);

    let retrySecs = 0;

    // Check if IP or Username + IP is already blocked
    if (
      resSlowByIP !== null &&
      resSlowByIP.consumedPoints > maxWrongAttemptsByIPperDay
    ) {
      retrySecs = Math.round(resSlowByIP.msBeforeNext / 1000) || 1;
    } else if (
      resUsernameAndIP !== null &&
      resUsernameAndIP.consumedPoints > maxConsecutiveFailsByUsernameAndIP
    ) {
      retrySecs = Math.round(resUsernameAndIP.msBeforeNext / 1000) || 1;
    }

    // block multiple failed attempts
    if (retrySecs > 0) {
      res.set("Retry-After", String(retrySecs));
      res.status(429).send("Too Many Requests");
      return;
    }

    // get user id
    const userID = getUserIDByUsername(body.username);

    // if userID not found end with 403 response
    if (!userID) {
      try {
        const promises = [limiterSlowBruteByIP.consume(ipAddr)];

        await Promise.all(promises);

        res.status(403).json({ message: "Username not found" }).end();
        return;
      } catch (rlRejected) {
        if (rlRejected instanceof Error) {
          throw rlRejected;
        } else {
          res.set(
            "Retry-After",
            String(Math.round(rlRejected.msBeforeNext / 1000)) || 1
          );
          res.status(429).send("Too Many Requests");
          return;
        }
      }
    }

    // get user hash
    const hash = getUserhash(userID);

    // verify if password is correct
    const valid = verifyPassword(body.password, hash);

    // if password is incorrect end with 403 response
    if (!valid) {
      try {
        const promises = [
          limiterSlowBruteByIP.consume(ipAddr),
          limiterConsecutiveFailsByUsernameAndIP.consume(usernameIPkey),
        ];

        await Promise.all(promises);

        res.status(403).json({ message: "Incorrect passsword" }).end();
        return;
      } catch (rlRejected) {
        if (rlRejected instanceof Error) {
          throw rlRejected;
        } else {
          res.set(
            "Retry-After",
            String(Math.round(rlRejected.msBeforeNext / 1000)) || 1
          );
          res.status(429).send("Too Many Requests");
          return;
        }
      }
    }

    // generate session for loggin in user
    req.session.regenerate((err) => {
      if (err) throw err;

      // save user's info (id, username, email) as user object in session
      req.session.user = getUserById(userID);

      if (resUsernameAndIP !== null && resUsernameAndIP.consumedPoints > 0) {
        // Reset on successful authorisation
        limiterConsecutiveFailsByUsernameAndIP
          .delete(usernameIPkey)
          .finally(() =>
            // send success response
            res.status(200).json({ message: "Successfully logged in" })
          );
      } else {
        // send success response
        res.status(200).json({ message: "Successfully logged in" });
      }
    });
  } catch (e) {
    next(e);
  }
});

module.exports = loginRouter;
