const mongoose = require("mongoose");

const billingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  apiId:{
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Api"
  },
  totalRequests: Number,
  requests: Number,
  billAmount: Number,
  plan: String,

  createdAt: {
    type: Date,
    default: Date.now,
  },
  
  status: {
    type: String,
    enum: ["pending", "paid"],
    default: "pending",
  },
},{timestamps:true});

module.exports = mongoose.model("Billing", billingSchema);