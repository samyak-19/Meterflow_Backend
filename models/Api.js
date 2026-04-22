const mongoose = require ("mongoose");
const { base } = require("./User");

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
},{timestamps:true});

module.exports = mongoose.model("Api",apiSchema);