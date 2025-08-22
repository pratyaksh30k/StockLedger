import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { User } from "../models/user.models.js";

const router = express.Router(); 

router.get("/dashboard",verifyToken,async(req,res)=>{
  try{
    const user = await User.findById(req.user.id).select("-password");
    if(!user){
      return res.status(404).json({message:"User not found"});
    }
    res.json({
      message: "Welcome to your dashboard!",
      user,
    });
  }catch(err){
    console.error("Dashboard error:", err);
    res.status(500).json({message:"Something went wrong!"});
  }
})

export default router