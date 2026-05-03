const User = require("../models/User");
const Api = require("../models/Api");
const UsageLog = require("../models/UsageLog");
const Plan = require("../models/Plan");
const Billing = require("../models/Billing");
const Subscription = require("../models/Subscription");


exports.getStats = async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalApis = await Api.countDocuments();
  const totalRequests = await UsageLog.countDocuments();

  const revenue = await UsageLog.aggregate([
  {
    $group: {
      _id: null,
      total: { $sum: "$adminRevenue" },
    },
  },
]);

  const totalSubscriptions = await Subscription.countDocuments();

  res.json({
    totalUsers,
    totalApis,
    totalRequests,
    totalRevenue: revenue[0]?.total || 0,
    totalSubscriptions,
  });
};

// GET USERS
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    const result = await Promise.all(
      users.map(async (user) => {
        // 🔥 TOTAL REQUESTS
        const totalRequests = await UsageLog.countDocuments({
          userId: user._id,
        });

        // 🔥 BILLING
        const billing = await Billing.aggregate([
          { $match: { userId: user._id } },
          { $group: { _id: null, total: { $sum: "$billAmount" } } },
        ]);

        // 🔥 SUBSCRIPTION
        const sub = await Subscription.findOne({
          userId: user._id,
        }).populate("planId");

        const lastUsage = await UsageLog.findOne({ userId: user._id })
        .sort({ timestamp: -1 })
        .select("timestamp");

        return {
          ...user.toObject(),
          totalRequests,
          totalRevenue: billing[0]?.total || 0,
          plan: sub?.planId?.name || "free",
          lastActive: lastUsage?.timestamp || null,
        };
      })
    );

    res.json(result);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET APIS
exports.getApis = async (req, res) => {
  try {
    const apis = await Api.find().populate("userId", "email");
    res.json(apis);
  } catch (err) {
    res.status(500).json({ message: "Error fetching APIs" });
  }
};

exports.createPlan = async (req, res) => {
  const { name, apiKeyLimit, price } = req.body;

  const plan = await Plan.create({
    name,
    apiKeyLimit,
    price,
  });

  res.json(plan);
};

exports.getRevenue = async (req, res) => {
  const revenue = await Billing.aggregate([
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$billAmount" },
      },
    },
  ]);

  res.json(revenue);
};

exports.getRevenueSummary = async (req, res) => {
  const totalRevenue = await Billing.aggregate([
    { $group: { _id: null, total: { $sum: "$billAmount" } } },
  ]);

  const totalTransactions = await Billing.countDocuments();

  res.json({
    totalRevenue: totalRevenue[0]?.total || 0,
    totalTransactions,
  });
};

exports.getRevenueTrend = async (req, res) => {
  const trend = await Billing.aggregate([
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        revenue: { $sum: "$billAmount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const formatted = trend.map((t) => ({
    month: `${t._id.month}/${t._id.year}`,
    revenue: t.revenue,
  }));

  res.json(formatted);
};

exports.getTopApis = async (req, res) => {
  const data = await Billing.aggregate([
    {
      $group: {
        _id: "$apiId",
        revenue: { $sum: "$billAmount" },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "apis",
        localField: "_id",
        foreignField: "_id",
        as: "api",
      },
    },
    { $unwind: "$api" },
  ]);

  const result = data.map((d) => ({
    name: d.api.name,
    revenue: d.revenue,
  }));

  res.json(result);
};

exports.getTopUsers = async (req, res) => {
  const data = await Billing.aggregate([
    {
      $group: {
        _id: "$userId",
        totalSpent: { $sum: "$billAmount" },
      },
    },
    { $sort: { totalSpent: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
  ]);

  const result = data.map((d) => ({
    email: d.user.email,
    totalSpent: d.totalSpent,
  }));

  res.json(result);
};

exports.getSubscriptions = async (req, res) => {
  const subs = await Subscription.find()
    .populate("userId")
    .populate("planId");

  res.json(subs);
};

// GET SINGLE USER
exports.getUserDetails = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select("-password");

    // 🔥 USAGE
    const totalRequests = await UsageLog.countDocuments({ userId });

    // 🔥 DAILY
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyRequests = await UsageLog.countDocuments({
      userId,
      timestamp: { $gte: today },
    });

    // 🔥 BILLING
    const billing = await Billing.aggregate([
      { $match: { userId: user._id } },
      { $group: { _id: null, total: { $sum: "$billAmount" } } },
    ]);

    const latency = await UsageLog.aggregate([
      { $match: { userId: user._id } },
      { $group: { _id: null, avg: { $avg: "$latency" } } },
    ]);

     const lastUsage = await UsageLog.findOne({ userId })
      .sort({ timestamp: -1 })
      .select("timestamp");

    // 🔥 APIs USED
    const apis = await UsageLog.distinct("apiId", { userId });

    res.json({
      user,
      totalRequests,
      dailyRequests,
      totalRevenue: billing[0]?.total || 0,
      avgLatency: Math.round(latency[0]?.avg || 0),
      lastActive: lastUsage?.timestamp || null,
      apiCount: apis.length,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET USER APIS
exports.getUserApis = async (req, res) => {
  try {
    const apis = await Api.find({ userId: req.params.id });
    res.json(apis);
  } catch {
    res.status(500).json({ message: "Error fetching user APIs" });
  }
};

// GET USER USAGE
exports.getUserUsage = async (req, res) => {
  try {
    const usage = await UsageLog.find({ userId: req.params.id });
    res.json(usage);
  } catch {
    res.status(500).json({ message: "Error fetching usage" });
  }
};

// GET USER BILLING
exports.getUserBilling = async (req, res) => {
  try {
    const logs = await UsageLog.find({ userId: req.params.id })
      .populate("apiId");

    let total = 0;
    logs.forEach(log => {
      total += log.apiId?.pricePerRequest || 0;
    });

    res.json({ billAmount: total });
  } catch {
    res.status(500).json({ message: "Error calculating billing" });
  }
};

// GET USER SUBSCRIPTION
exports.getUserSubscription = async (req, res) => {
  try {
    const sub = await Subscription.findOne({ userId: req.params.id })
      .populate("planId");

    res.json(sub);
  } catch {
    res.status(500).json({ message: "Error fetching subscription" });
  }
};

exports.getApisAnalytics = async (req, res) => {
  try {
    const data = await Api.aggregate([
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
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          name: 1,
          baseUrl: 1,
          basePrice: 1,           
          pricePerRequest: 1,
          totalRevenue: 1,
          totalRequests: 1,
          testPath: 1,
          "user.email": 1,
        },
      },
    ]);

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getApiDetails = async (req, res) => {
  try {
    const apiId = req.params.id;

    // TOTAL REQUESTS
    const totalRequests = await UsageLog.countDocuments({ apiId });

    // TOTAL REVENUE
    const revenue = await Billing.aggregate([
      { $match: { apiId: new require("mongoose").Types.ObjectId(apiId) } },
      { $group: { _id: null, total: { $sum: "$billAmount" } } },
    ]);

    // USAGE TREND (daily)
    const usageTrend = await UsageLog.aggregate([
      { $match: { apiId: new require("mongoose").Types.ObjectId(apiId) } },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: "$timestamp" },
            month: { $month: "$timestamp" },
          },
          requests: { $sum: 1 },
        },
      },
      { $sort: { "_id.month": 1, "_id.day": 1 } },
    ]);

    // REVENUE TREND
    const revenueTrend = await Billing.aggregate([
      { $match: { apiId: new require("mongoose").Types.ObjectId(apiId) } },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$billAmount" },
        },
      },
      { $sort: { "_id.month": 1, "_id.day": 1 } },
    ]);

    res.json({
      totalRequests,
      totalRevenue: revenue[0]?.total || 0,
      usageTrend: usageTrend.map(d => ({
        date: `${d._id.day}/${d._id.month}`,
        requests: d.requests,
      })),
      revenueTrend: revenueTrend.map(d => ({
        date: `${d._id.day}/${d._id.month}`,
        revenue: d.revenue,
      })),
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getRequestTrend = async (req, res) => {
  const trend = await UsageLog.aggregate([
    {
      $group: {
        _id: {
          day: { $dayOfMonth: "$timestamp" },
          month: { $month: "$timestamp" },
        },
        requests: { $sum: 1 },
      },
    },
    { $sort: { "_id.month": 1, "_id.day": 1 } },
  ]);

  res.json(
    trend.map(t => ({
      date: `${t._id.day}/${t._id.month}`,
      requests: t.requests,
    }))
  );
};
exports.getRevenueTrend = async (req, res) => {
  res.json([{ date: "test", revenue: 100 }]); // TEMP TEST
};

exports.updateApiPrice = async (req, res) => {
  try {
    const { apiId } = req.params;
    const { pricePerRequest } = req.body;

    // 🔍 find API first
    const api = await Api.findById(apiId);

    if (!api) {
      return res.status(404).json({ error: "API not found" });
    }

    // ✅ update price
    api.pricePerRequest = Number(pricePerRequest);

    // 🔥 earnings logic
    api.providerEarning = api.basePrice; // provider gets base price
    api.adminRevenue = api.pricePerRequest - api.basePrice;

    await api.save();

    res.json(api);

  } catch (err) {
    console.error("Update price error:", err);
    res.status(500).json({ error: "Server error" });
  }
};