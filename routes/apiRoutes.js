const express = require ("express");
const router =express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const{
    createApi,
    generateApiKey,
    getUserApis,

}= require("../controllers/apiController");

router.post("/create", authMiddleware,createApi);
router.post("/generate-key",authMiddleware,generateApiKey);
router.get("/my-apis",authMiddleware,getUserApis);

module.exports = router;