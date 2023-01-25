const debug = require("debug")("express-auth:firewall");

/**
 * Blocks requests based on user athentication state
 * @param {boolean} loggedIn
 */
const authRequired = (loggedIn) => (req, res, next) => {
  if (loggedIn === Boolean(req.session.user)) {
    next();
  } else {
    throw new Error("Request blocked from accessing restricted area");
  }
};

module.exports = authRequired;
