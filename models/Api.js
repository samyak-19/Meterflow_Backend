    const mongoose = require ("mongoose");

    const apiSchema = new mongoose.Schema({
        name:{
            type: String,
            required:true,
        },
        baseUrl:{
            type: String,
            required:true,
        },
        userId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        testPath: {
            type: String,
            default: "",
        },
    basePrice: { type: Number, default: 0 },       
    pricePerRequest: { type: Number, default: 0 },

    providerEarning: { type: Number, default: 0 },
    adminRevenue: { type: Number, default: 0 },
    endpoints: {
  type: [String],
  default: []
},
    },{timestamps:true});

    module.exports = mongoose.model("Api",apiSchema);