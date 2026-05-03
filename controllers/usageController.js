const UsageLog = require("../models/UsageLog");
const ApiKey = require("../models/ApiKey");

exports.getUsage = async (req, res) => {
  try {
    const { apiKey } = req.query;

    // 🔥 Step 1: Find API key document
    const keyData = await ApiKey.findOne({ key: apiKey });

    if (!keyData) {
      return res.status(404).json({ message: "Invalid API key" });
    }

    // 🔥 Step 2: Use ObjectId
    const usage = await UsageLog.find({
      apiKey: keyData._id
    });

    res.json(usage);
  } catch (error) {
    console.error("🔥 USAGE ERROR:", error.stack);
    res.status(500).json({ error: error.message });
  }
};