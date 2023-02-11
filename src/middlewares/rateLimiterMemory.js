const { RateLimiterMemory } = require("rate-limiter-flexible");

const rateLimiter = new RateLimiterMemory({
  keyPrefix: "anti_ddos_ip",
  points: 10,
  duration: 10,
  blockDuration: 60, // 1 minute
});

const rateLimiterMiddleware = (req, res, next) => {
  rateLimiter
    .consume(req.ip)
    .then(() => next())
    .catch((err) => {
      if (err instanceof Error) {
        next(err);
      } else {
        res.status(429).send("Too Many Requests");
      }
    });
};

module.exports = rateLimiterMiddleware;
