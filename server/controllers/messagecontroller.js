// Get all Users except the logged in user

import Message from "../models/message.js";
import cloudinary from "../lib/cloudinary.js";
import {io,userSocketMap} from "../server.js"
export const getUsersForSidebar=async (req,res)=>{
    try {
        const loggedInUserId = req.user._id;
        const users = await User.find({ _id: { $ne: loggedInUserId } }).select('-password');

        const unseenMessages={}
        const promises=users.map(async()=>{
            const message=await Message.find({senderId:user._id,receiverId:loggedInUserId,seen:false});
            if(message.length>0){
                unseenMessages[user._id]=message.length;
            }
        })
        await Promise.all(promises);
        res.json({success:true,users:users,unseenMessages});
    } catch (error) {
        res.status(500).json({ success:false,message: 'Error fetching users', error: error.message });
    }
}

export const getMessagesFromUser = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const {id:selectedUserId }= req.params;

        const messages = await Message.find({
            $or: [
                { senderId: loggedInUserId, receiverId: selectedUserId },
                { senderId: selectedUserId, receiverId: loggedInUserId }
            ]
        }).sort({ createdAt: 1 });
        await Message.updateMany({senderId:selectedUserId,receiverId:loggedInUserId},{seen:true});

        res.json({ success: true, messages });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching messages', error: error.message });
    }
};

// api to mark message as seen using message id 
export const markMessageAsSeen=async (req,res)=>{
    try {
        const{id}=req.params;
        await Message.findByIdAndUpdate(id,{seen:true});
        res.json({success:true});
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching messages', error: error.message });
        
    }
}

// send message to selected user
export const sendMessage=async(req,res)=>{
    try {
        const {text,image}=req.body;
        const receiverId=req.params.id;
        const senderId=req.user._id;

        let imageUrl;
        if(image){
            const uploadResponse=await cloudinary.uploader.upload(image);
            imageUrl=uploadResponse.secure_url;

        }
        const newMessage=await Message.create({
            senderId,
            receiverId,
            text,
            image:imageUrl
        })

        const receiverSocketId=userSocketMap[receiverId];
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage",newMessage);
        }
        res.json({success:true,newMessage});
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching messages', error: error.message });
    }
}
