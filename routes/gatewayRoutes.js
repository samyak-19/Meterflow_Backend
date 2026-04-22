const express =require("express");
const router = express.Router();

const gatewayController = require("../controllers/gatewayController");

router.use("/:apiKey/",gatewayController.handleRequest);

module.exports =router;