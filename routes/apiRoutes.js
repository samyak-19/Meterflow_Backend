const express = require ("express");
const router =express.Router();
const Api = require("../models/Api");

const authMiddleware = require("../middleware/authMiddleware");
const admin = require("../middleware/admin");
const{
    createApi,
    generateApiKey,
    getUserApis,
    getApiKeys,
    revokeApiKey,
    rotateApiKey,
    getMyApisWithAnalytics,
    getProviderEarnings,
}= require("../controllers/apiController");

router.post("/create", authMiddleware,createApi);
router.post("/generate-key",authMiddleware,generateApiKey);
router.get("/my-apis",authMiddleware,getUserApis);
router.post("/revoke-key", authMiddleware, revokeApiKey);
router.post("/rotate-key", authMiddleware, rotateApiKey);
router.get("/keys/:apiId", authMiddleware, getApiKeys);
router.get("/my-apis-analytics", authMiddleware, getMyApisWithAnalytics);
router.get("/provider/earnings", authMiddleware, getProviderEarnings);

router.get("/public", async (req, res) => {
  try {
    const apis = await Api.find().select("name baseUrl testPath pricePerRequest");
    res.json(apis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;