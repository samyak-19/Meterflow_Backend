const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require ("jsonwebtoken");

// signup
exports.signup = async (req, res) =>{
    try{
        const {email ,password} = req.body;

        // checking the user
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message : "User Already Exist"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // creating user
        const user = await User.create({
            email,
            password:hashedPassword,
        });

        res.status(201).json({
            message :"User registerd",
            userId : user._id
        });    
    }
    catch(error){
        res.status(500).json({error: error.message})
    }
};

// login
exports.login = async(req ,res) =>{
    try{
        const {email,password} = req.body

        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message : "Invalid credentials"});
        }

        // checking password
        const isMatch =await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({message :"Invalid credentials"})
        }
        // token
        const token =jwt.sign(
            {userId: user._id , role: user.role},
            process.env.JWT_SECRET,
            {expiresIn: "7d"}
        );

        res.json({
            message : "Login hogaya",
            token,
        });
    }catch(error){
        res.status(500).json({error: error.message});
    }
};