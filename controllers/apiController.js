const Api = require ("../models/Api");
const ApiKey = require ("../models/ApiKey");
const crypto = require ("crypto");

// create api
exports.createApi  =async(req,res)=>{
    try{
        const {name ,baseUrl} = req.body;

        const api =await Api.create({
            name,
            baseUrl,
            userId: req.user.userId,
        });
        res.json(api);
    }catch(error){
        res.status(500).json({error :error.message});
    }
};

// generate api key
exports.generateApiKey = async (req,res) =>{
    try{
        const{apiId} =req.body;
        const key =crypto.randomBytes(32).toString("hex");

        const apiKey = await ApiKey.create({
            apiId,
            key,
        });
        res.json(apiKey);
    }catch(error){
         res.status(500).json({ error: error.message });
    }
};

// get user apis
exports.getUserApis =async (req,res)=>{
    try{
        const apis = await Api.find({ userId:req.user.userId});
        res.json(apis);
    }catch(error){
        res.status(500).json({error: error.message});
    }
};