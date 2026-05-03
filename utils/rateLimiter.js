const rateLimitStore = {};

const LIMIT = 10; // requests
const WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(apiKey) {
  const now = Date.now();

  if (!rateLimitStore[apiKey]) {
    rateLimitStore[apiKey] = {
      count: 1,
      startTime: now,
    };
    return true;
  }

  const data = rateLimitStore[apiKey];

  // reset window
  if (now - data.startTime > WINDOW) {
    rateLimitStore[apiKey] = {
      count: 1,
      startTime: now,
    };
    return true;
  }

  // limit check
  if (data.count >= LIMIT) {
    console.log("Count:", data.count);
    return false;
  }

  data.count++;
  return true;
}

module.exports = checkRateLimit;