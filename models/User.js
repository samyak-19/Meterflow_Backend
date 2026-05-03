const mongoose = require ("mongoose");

const userSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
        unique: true,
    },
    password:{
        type: String,
        required:true,
    },
    role: {
        type: String,
        enum:["admin","provider","user"],
        default: "user",
    }, 
    subscription: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subscription",
},  
},{timestamps : true});

module.exports = mongoose.model("User",userSchema);