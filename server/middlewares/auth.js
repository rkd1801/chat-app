import User from "../models/user.js";
import jwt from 'jsonwebtoken'
export const protectRoute = async (req, res, next) => {
    try {
        const token = req.header("token");
        const decoded=jwt.verify(token,process.env.JWT_SECRET)
        const user=await User.findById(decoded.userId).select("-password");
        if(!user)return res.json({success:false, message:"User not found"});
        req.user=user;        
        next();
    } catch (err) {
        console.log(err.message);
        res.status(401).json({ success:false,message: 'Token is not valid' });
    }
};


