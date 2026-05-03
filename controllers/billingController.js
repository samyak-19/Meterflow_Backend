const UsageLog = require("../models/UsageLog");
const ApiKey = require("../models/ApiKey");
const Billing = require("../models/Billing");

exports.calculateBilling = async (req, res) => {
  try {
    const { apiKey } = req.query;

    if (!apiKey) {
      return res.status(400).json({ message: "API key is required" });
    }

    // 🔑 Step 1: Find API key document
    const keyData = await ApiKey.findOne({ key: apiKey });

    if (!keyData) {
      return res.status(404).json({ message: "Invalid API key" });
    }

    const userId = keyData.userId;

    // 🔥 Step 2: Get logs using ObjectId (IMPORTANT FIX)
    const logs = await UsageLog.find({
      apiKey: keyData._id
    }).populate("apiId");

    // 🔢 Total Requests
    const totalRequests = logs.length;

    // 💰 Calculate Billing
    let billAmount = 0;

    logs.forEach((log) => {
      if (log.apiId && log.apiId.pricePerRequest) {
        billAmount += log.apiId.pricePerRequest;
      }
    });

    // 🛑 No usage case
    if (totalRequests === 0) {
      return res.json({
        totalRequests: 0,
        billAmount: 0,
      });
    }

    // 💾 Save / Update Billing
    const bill = await Billing.findOneAndUpdate(
      { userId },
      {
        userId,
        totalRequests,
        billAmount,
      },
      { new: true, upsert: true }
    );

    // 📤 Response
    res.json({
      totalRequests,
      billAmount,
    });

  } catch (error) {
    console.error("🔥 BILLING ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
};