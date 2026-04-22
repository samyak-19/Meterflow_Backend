const mongoose = require ("mongoose");

const apiKeySchema = new mongoose.Schema({
    apiId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Api",
    },
    key:{
        type: String,
        required:true,
        unique: true,
    },
    status:{
        type:String,
        enum:["active","revoked"],
        default : "active",
    },
},{timestamps:true});

module.exports =mongoose.model("ApiKey",apiKeySchema);