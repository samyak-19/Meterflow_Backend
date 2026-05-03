const Api = require ("../models/Api");
const ApiKey = require ("../models/ApiKey");
const Subscription = require("../models/Subscription");
const Plan = require("../models/Plan");
const crypto = require ("crypto");
const mongoose = require("mongoose");
const UsageLog = require("../models/UsageLog");

// create api
exports.createApi  =async(req,res)=>{
    try{

        const {name ,baseUrl,basePrice,testPath} = req.body;
        console.log("BODY:", req.body);
        console.log("BASE PRICE:", req.body.basePrice);


        const api =await Api.create({
            name,
            baseUrl:baseUrl.trim(),
            basePrice:Number(basePrice) || 0,
            testPath: testPath || "",
            userId: req.user.userId,
        });
        console.log(req.body);
        res.json(api);
    }catch(error){
        res.status(500).json({error :error.message});
    }
};

// generate api key
exports.generateApiKey = async (req, res) => {
  try {
    const { apiId } = req.body;

    const api = await Api.findById(apiId);
    if (!api) {
      return res.status(404).json({ message: "API not found" });
    }

    // 🔴 DEBUG (IMPORTANT)
    console.log("USER FROM TOKEN:", req.user);

    // 🚨 SAFETY CHECK
    if (!req.user || !req.user.userId) {
      return res.status(400).json({
        message: "User ID missing in token"
      });
    }

    const key = crypto.randomBytes(32).toString("hex");

    const apiKey = await ApiKey.create({
      apiId,
      userId: req.user.userId,   // 
      key,
    });

    res.json({
      message: "API key generated",
      key: apiKey.key,
    });

  } catch (error) {
    console.error("🔥 GENERATE KEY ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

// get user apis
exports.getUserApis =async (req,res)=>{
    try{
        const apis = await Api.find({ userId:req.user.userId});
        res.json(apis);
    }catch(error){
        res.status(500).json({error: error.message});
    }
};

// GET KEYS FOR API 🔥
exports.getApiKeys = async (req, res) => {
  try {
    const { apiId } = req.params;

    const keys = await ApiKey.find({ apiId });

    res.json(keys);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// REVOKE KEY
exports.revokeApiKey = async (req, res) => {
  try {
    const { keyId } = req.body;

    const key = await ApiKey.findById(keyId);
    if (!key) {
      return res.status(404).json({ message: "Key not found" });
    }

    key.status = "revoked";
    await key.save();

    res.json({ message: "API key revoked" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ROTATE KEY (revoke old + create new)
exports.rotateApiKey = async (req, res) => {
  try {
    const { keyId } = req.body;

    const oldKey = await ApiKey.findById(keyId);
    if (!oldKey) {
      return res.status(404).json({ message: "Key not found" });
    }

    // revoke old
    oldKey.status = "revoked";
    await oldKey.save();

    // create new
    const newKeyValue = crypto.randomBytes(32).toString("hex");

    const newKey = await ApiKey.create({
      apiId: oldKey.apiId,
      userId: oldKey.userId,
      key: newKeyValue,
    });


    const count = await ApiKey.countDocuments({ userId: req.user.userId });

    if (count >= 10) {
        return res.status(403).json({
         message: "API key limit reached. Upgrade plan.",
      });
    }

    res.json({
      message: "Key rotated",
      newKey: newKey.key,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getMyApisWithAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    const data = await Api.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },

      {
        $lookup: {
          from: "billings",
          localField: "_id",
          foreignField: "apiId",
          as: "billingData",
        },
      },
      {
        $lookup: {
          from: "usagelogs",
          localField: "_id",
          foreignField: "apiId",
          as: "usageData",
        },
      },
      {
        $addFields: {
          totalRevenue: { $sum: "$billingData.billAmount" },
          totalRequests: { $size: "$usageData" },
        },
      },
    ]);

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getMyApisAnalytics = async (req, res) => {
  try {
    const userId = req.user.Id;

    const data = await Api.aggregate([
      { $match: { userId: new require("mongoose").Types.ObjectId(userId) } },

      {
        $lookup: {
          from: "billings",   // ✅ FIX THIS
          localField: "_id",
          foreignField: "apiId",
          as: "billingData",
        },
      },
      {
        $lookup: {
          from: "usagelogs",  // ✅ FIX THIS
          localField: "_id",
          foreignField: "apiId",
          as: "usageData",
        },
      },

      {
        $addFields: {
          totalRevenue: { $sum: "$billingData.billAmount" },
          totalRequests: { $size: "$usageData" },
        },
      },
    ]);

    res.json(data);

  } catch (err) {
    console.error("Provider analytics error:", err);
    res.status(500).json({ error: err.message });
  }
};
exports.getProviderEarnings = async (req, res) => {
  try {
    const providerId = req.user.id;

    const earnings = await UsageLog.aggregate([
      {
        $lookup: {
          from: "apis",
          localField: "apiId",
          foreignField: "_id",
          as: "api",
        },
      },
      { $unwind: "$api" },

      {
        $match: {
          "api.userId": providerId,
        },
      },

      {
        $group: {
          _id: null,
          total: { $sum: "$providerEarning" },
        },
      },
    ]);

    res.json({
      totalEarnings: earnings[0]?.total || 0,
    });

  } catch (err) {
    console.error("🔥 PROVIDER EARNINGS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};