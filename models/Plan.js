const mongoose = require("mongoose");

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ["free", "pro"],
    required: true,
  },
  price: {
    type: Number,
    default: 0,
  },
  requestLimit: {
    type: Number,
    default: 10,
  },
});

module.exports = mongoose.model("Plan", planSchema);