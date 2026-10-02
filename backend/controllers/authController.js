const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken")

const registerUser = async (req, res) => {
    try{
        const{name, email, password, role}= req.body;
        if(!name || !email ||!password){
            return res.status(400).json({
                message:"Name, email and password are required"
            })
        }
        const existingUser = await User.findOne({email})
        if(existingUser){
            return res.status(400).json({
                message:"User Already exists"
            })
        }
        const hashedPassword = await bcrypt.hash(password,10);

        const user = await User.create({
            name,
            email,
            password:hashedPassword,
            role:role || "employee"
        })
        res.status(201).json({
            message:"user registered successfully",
            user:{
                id:user._id,
                name:user.name,
                email:user.email,
                role:user.role
            }
        })
    }catch(error){
        console.error("Registration error:",error.message)
        res.status(500).json({
            message:"Server error"
        })
    }
}

const loginUser = async(req, res)=>{
    try{
        const{email, password} = req.body;

        if(!email || !password){
            return res.status(400).json({
                message:"Email and password are required"
            })
        }
        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({
                message:"Invalid email or passord"
            })
        }
        const isPasswordCorrect =await bcrypt.compare(
            password,
            user.password
        );
        if(!isPasswordCorrect){
            return res.status(401).json({
                message:"Invalid email or Password"
            })
        }
        const token =jwt.sign(
            {
                userId:user._id,
                role:user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn:"1d"
            }
        )
        res.status(200).json({
            message:"login successful",
            token,
            user:{
                id:user._id,
                name:user.name,
                email:user.email,
                role:user.role
            }
        });
    }catch(error){
        console.error("Login error",error.message)
        res.status(500).json({
            message:"Server error"
        })
    }
}

module.exports= {
    registerUser,
    loginUser
}