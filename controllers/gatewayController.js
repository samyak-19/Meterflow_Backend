const ApiKey = require("../models/ApiKey");
const Api = require("../models/Api");

exports.handleRequest = async (req ,res) =>{
    try{
        const{apiKey} = req.params;

        // api valitadion
        const keyData = await ApiKey.findOne({key:apiKey, status:"active"});

        if(!keyData){
            return res.status(403).json({message: "Invalid Api Key"})
        }
        // get api info
        const api = await Api.findById(keyData.apiId);

        if(!api){
             return res.status(404).json({ message: "API not found" });
        }
        // endpoint extract
        const endpoint = req.originalUrl.split(`/${apiKey}/`)[1];

        if (!endpoint) {
            return res.status(400).json({ message: "No endpoint provided" });
        }
        // url build
        const targetUrl = `${api.baseUrl}/${endpoint}`;
        // forword request using fetch
        const response = await fetch(targetUrl,{
            method: req.method,
            headers:{
                "Content-Type":"application/json"
            },
        });
        const data = await response.json();
        res.status(response.status).json(data);
    }catch(error){
        console.error("Full ERROR",error);
        res.status(500).json({error:"Gatwaye error"})
    }
};