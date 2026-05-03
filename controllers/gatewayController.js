const mongoose = require("mongoose");
const ApiKey = require("../models/ApiKey");
const Api = require("../models/Api");
const UsageLog = require("../models/UsageLog");
const checkRateLimit = require("../utils/rateLimiter");
const Subscription = require("../models/Subscription");

const FREE_LIMIT = 10;

const today = new Date();
today.setHours(0, 0, 0, 0);

const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const dns = require("dns");
dns.setDefaultResultOrder("ipv4first"); 

exports.handleRequest = async (req, res) => {
  const startTime = Date.now();
  let api = null; // ✅ FIX for catch

  try {
    const { apiKey } = req.params;

    // 🔑 Validate key
    const keyData = await ApiKey.findOne({
      key: apiKey,
      status: "active",
    });

    if (!keyData) {
      return res.status(403).json({ message: "Invalid API Key" });
    }

    const userId = keyData.userId;

    // ✅ MOVE DATE INSIDE FUNCTION
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sub = await Subscription.findOne({ userId }).populate("planId");
    const isPro = sub?.planId?.name === "pro";

    const totalRequests = await UsageLog.countDocuments({
      userId,
      timestamp: { $gte: today, $lt: tomorrow },
    });

    const remaining = FREE_LIMIT - totalRequests;

    if (!isPro && totalRequests >= FREE_LIMIT) {
      return res.status(403).json({
        error: "Free limit reached",
        remaining: 0,
      });
    }

    // 📦 Get API
    api = await Api.findById(keyData.apiId);

    if (!api) {
      return res.status(404).json({ message: "API not found" });
    }

    console.log("API BASE URL:", api.baseUrl);

    // 🚦 Rate limit
    if (!checkRateLimit(apiKey)) {
      return res.status(429).json({ message: "Rate limit exceeded" });
    }

    const endpoint = req.params.endpoint || api.testPath;

      if (!endpoint) {
        return res.status(400).json({
       message: "No endpoint configured for this API",
      });
    }

    // ✅ CLEAN URL
    const targetUrl = `${api.baseUrl.replace(/\/$/, "")}/${endpoint}`;

    console.log("CALLING:", targetUrl);

    // 🔥 FIXED FETCH
    const response = await fetch(targetUrl, {
      method: "GET",
      redirect: "follow",
      headers: {
        "Accept": "application/json,text/plain,*/*",
        "User-Agent": "Mozilla/5.0",
      },
    });


    if (response.status >= 400) {
  const text = await response.text();
  throw new Error(`API ERROR ${response.status}: ${text}`);
}

    let data;
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    const latency = Date.now() - startTime;

    // 📊 Save usage
    await UsageLog.create({
      apiKey: keyData._id,
      apiId: keyData.apiId,
      userId,
      endpoint,
      method: req.method,
      status: response.status,
      latency,
    });

    res.status(response.status).json({
      data,
      remaining: isPro ? "unlimited" : Math.max(remaining - 1, 0),
    });

  } catch (error) {
    console.error("🔥 FULL ERROR:", error);

    const latency = Date.now() - startTime;

    try {
      const keyData = await ApiKey.findOne({ key: req.params.apiKey });

      if (keyData) {
        await UsageLog.create({
          apiKey: keyData._id,
          apiId: keyData.apiId,
          userId: keyData.userId,
          endpoint: req.params.endpoint || api?.testPath || "unknown",
          method: req.method,
          status: 500,
          latency,
          cost: api?.pricePerRequest || 0,
          providerEarning: api?.basePrice || 0,
          adminRevenue:
            (api?.pricePerRequest || 0) - (api?.basePrice || 0),
        });
      }
    } catch (logErr) {
      console.error("Logging error:", logErr.message);
    }

    res.status(500).json({
      error: error.message,
      details: error.stack || "No details",
    });
  }
};