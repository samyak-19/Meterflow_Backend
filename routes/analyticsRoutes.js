const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

const { 
    getAnalytics,
    getUserAnalytics
    } = require("../controllers/analyticsController");


router.get("/global",auth, getAnalytics);
router.get("/user", auth, getUserAnalytics);

module.exports = router;