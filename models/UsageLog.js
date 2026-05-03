const mongoose = require ("mongoose");
const ApiKey = require("./ApiKey");

const usageLogSchema = new mongoose.Schema({
    apiKey :{
       type: mongoose.Schema.Types.ObjectId,
       ref: "ApiKey",
       required: true,
    },
    apiId:{
        type: mongoose.Schema.Types.ObjectId,
        ref : "Api",
        required: true,
    },
    userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    },
    endpoint :String,
    method: String,
    status : Number,
    latency : Number,
    cost: Number,
    providerEarning: Number,
    adminRevenue: Number,
    timestamp :{
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("UsageLog", usageLogSchema);