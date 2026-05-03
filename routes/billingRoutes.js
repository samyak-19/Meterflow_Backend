const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { calculateBilling } = require("../controllers/billingController");

router.get("/",auth,calculateBilling);

module.exports = router;