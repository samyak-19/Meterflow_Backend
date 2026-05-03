const Subscription = require("../models/Subscription");

exports.subscribe = async (req, res) => {
  const userId = req.user.userId;
  const { planId } = req.body;

 const sub = await Subscription.findOneAndUpdate(
  { userId },
  { planId, status: "active" },
  { upsert: true, new: true }
);

  res.json(sub);
};