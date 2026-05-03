const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { getUsage } = require("../controllers/usageController");

router.get("/",auth, getUsage);

module.exports = router;