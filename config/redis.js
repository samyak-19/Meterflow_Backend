const Redis = require("ioredis");

const redis = new Redis({
  host: "redis-17131.c62.us-east-1-4.ec2.cloud.redislabs.com",
  port: 17131,
  username: "default",
  password: "HDgvr4611dXXk1XNHRdBeIVD2iBIuMNb",
});

redis.on("connect", () => {
  console.log("Redis connected ✅");
});

redis.on("error", (err) => {
  console.error("Redis error:", err.message);
});

module.exports = redis;