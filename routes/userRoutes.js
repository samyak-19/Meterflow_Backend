const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const Subscription = require("../models/Subscription");
const Plan = require("../models/Plan");

// 🔥 GET USER SUBSCRIPTION
router.get("/subscription", auth, async (req, res) => {
  try {
    const sub = await Subscription.findOne({
      userId: req.user.userId,
      status: "active",
    }).populate("planId");

    // ✅ No subscription → FREE
    if (!sub) {
      return res.json({
        plan: "free",
        requestLimit: 10,
      });
    }

    res.json({
      plan: sub.planId.name,
      price: sub.planId.price,
      requestLimit: sub.planId.requestLimit,
      expiresAt: sub.expiresAt,
    });
  } catch (err) {
    console.error("SUBSCRIPTION ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🔥 UPGRADE TO PRO
router.post("/upgrade", auth, async (req, res) => {
  try {
    const proPlan = await Plan.findOne({ name: "pro" });

    if (!proPlan) {
      return res.status(404).json({ message: "Pro plan not found" });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const sub = await Subscription.findOneAndUpdate(
      { userId: req.user.id },
      {
        userId: req.user.id,
        planId: proPlan._id,
        status: "active",
        expiresAt,
      },
      { upsert: true, new: true }
    );

    res.json({
      message: "Upgraded to PRO",
      plan: "pro",
      expiresAt,
    });
  } catch (err) {
    console.error("UPGRADE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;