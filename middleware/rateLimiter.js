const redis = require("../config/redis");

module.exports = async (req, res, next) => {
  try {
    const apiKey = req.params.apiKey;

    if (!apiKey) {
      return res.status(400).json({ message: "API key missing" });
    }

    const key = `rate:${apiKey}`;

    const current = await redis.incr(key);

    // First request → set expiry
    if (current === 1) {
      await redis.expire(key, 60); // 60 sec window
    }

    // LIMIT (change as needed)
    if (current > 10) {
      return res.status(429).json({
        message: "Rate limit exceeded 🚫",
      });
    }

    next();
  } catch (error) {
    console.error("Rate limiter error:", error);
    next(); // don’t block if Redis fails
  }
};