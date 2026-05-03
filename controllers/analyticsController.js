const UsageLog = require("../models/UsageLog");
const ApiKey = require("../models/ApiKey");

exports.getAnalytics = async (req, res) => {
  try {
    const { apiKey } = req.query;

    if (!apiKey) {
      return res.status(400).json({ message: "API key required" });
    }

    // 🔑 Step 1: Find API Key document
    const keyData = await ApiKey.findOne({ key: apiKey });

    if (!keyData) {
      return res.status(404).json({ message: "Invalid API key" });
    }

    // 🔥 Step 2: Use ObjectId (IMPORTANT FIX)
    const logs = await UsageLog.find({
      apiKey: keyData._id
    });

    // 🧠 Analytics calculation
    const totalRequests = logs.length;

    // dummy calculations (you can improve later)
    const errorRate = 0; // (you can track errors later)
    const avgLatency = 120; // static for now

    res.json({
      totalRequests,
      errorRate,
      avgLatency,
    });

  } catch (error) {
    console.error("🔥 ANALYTICS ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.getUserAnalytics = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { apiId } = req.query; // optional

    // 📅 DATE RANGE (TODAY)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 🔥 TOTAL USER REQUESTS (ALL TIME)
    const totalRequests = await UsageLog.countDocuments({ userId });

    // 🔥 DAILY USER REQUESTS
    const dailyRequests = await UsageLog.countDocuments({
      userId,
      timestamp: { $gte: today, $lt: tomorrow },
    });

    let apiTotalRequests = 0;
    let apiDailyRequests = 0;

    // 🔥 IF API SELECTED → CALCULATE API LEVEL STATS
    if (apiId) {
      apiTotalRequests = await UsageLog.countDocuments({
        userId,
        apiId,
      });

      apiDailyRequests = await UsageLog.countDocuments({
        userId,
        apiId,
        timestamp: { $gte: today, $lt: tomorrow },
      });
    }

    res.json({
      totalRequests,
      dailyRequests,
      apiTotalRequests,
      apiDailyRequests,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};