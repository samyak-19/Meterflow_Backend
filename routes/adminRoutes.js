const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware"); 
const admin = require("../middleware/admin");        

const {
  getUsers,
  getApis,
  getStats,
  createPlan, 
  getRevenue,
  getSubscriptions, 
  getUserDetails,
  getUserApis,   
  getUserUsage,
  getUserBilling,
  getUserSubscription,
  getRevenueSummary,
  getRevenueTrend,
  getTopApis,
  getTopUsers,
  getApisAnalytics,
  getApiDetails,
  getRequestTrend,
  updateApiPrice,
} = require("../controllers/adminController");

router.get("/users", auth, admin, getUsers);
router.get("/apis", auth, admin, getApis);
router.get("/stats", auth, admin, getStats);
router.post("/plans", auth, admin, createPlan);
router.get("/revenue", auth, admin, getRevenue);
router.get("/subscriptions", auth, admin, getSubscriptions);
router.get("/user/:id", auth, admin, getUserDetails);
router.get("/user/:id/apis", auth, admin, getUserApis);
router.get("/user/:id/usage", auth, admin, getUserUsage);
router.get("/user/:id/billing", auth, admin, getUserBilling);
router.get("/user/:id/subscription", auth, admin, getUserSubscription);
router.get("/revenue/summary", auth, admin, getRevenueSummary);
router.get("/revenue/trend", auth, admin, getRevenueTrend);
router.get("/revenue/top-apis", auth, admin, getTopApis);
router.get("/revenue/top-users", auth, admin, getTopUsers);
router.get("/apis-analytics", auth, admin, getApisAnalytics);
router.get("/api/:id", auth, admin, getApiDetails);
router.get("/requests/trend", auth, admin, getRequestTrend);
router.put("/api/:apiId/price", auth, admin, updateApiPrice);


module.exports = router;