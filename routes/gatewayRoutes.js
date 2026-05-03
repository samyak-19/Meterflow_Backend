const express =require("express");
const router = express.Router();

const gatewayController = require("../controllers/gatewayController");
const rateLimiter = require("../middleware/rateLimiter");

router.all("/:apiKey", rateLimiter, gatewayController.handleRequest);
router.all("/:apiKey/*endpoint", rateLimiter, gatewayController.handleRequest);

module.exports =router;